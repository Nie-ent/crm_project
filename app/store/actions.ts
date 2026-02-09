'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Validation Schema
const orderItemSchema = z.object({
    id: z.string().uuid(), // Menu Item ID
    quantity: z.number().int().positive(),
    options: z.any().optional(),
})

const checkoutSchema = z.object({
    storeId: z.string().uuid(),
    items: z.array(orderItemSchema),
    tableId: z.string().uuid().optional(), // Optional for now (Takeaway vs Dine-in)
    customerNotes: z.string().optional(),
})

export async function placeOrder(orderData: z.infer<typeof checkoutSchema>) {
    const supabase = await createClient()

    // 1. Validate Input
    const parsed = checkoutSchema.safeParse(orderData)
    if (!parsed.success) {
        return { error: 'Invalid order data' }
    }

    const { storeId, items, tableId } = parsed.data

    // 2. Fetch Prices (server-side calculation) AND Tenant ID
    // Get all item IDs
    const itemIds = items.map(i => i.id)
    const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('id, price, store_id, stores (tenant_id)')
        .in('id', itemIds)
        .eq('store_id', storeId) // Ensure items belong to this store!

    if (menuError || !menuItems || menuItems.length === 0) {
        return { error: 'Failed to fetch menu details' }
    }

    // Get tenant_id from the first item (all items are from same store)
    // Supabase returns array for joined relation unless single() used but we have array of items.
    // stores is a single object here per item.
    const tenantId = (menuItems[0].stores as any)?.tenant_id

    if (!tenantId) {
        return { error: 'Store configuration error' }
    }

    // Calculate Total & Prepare Order Items
    let totalAmount = 0
    const orderItemsData = []

    for (const item of items) {
        const dbItem = menuItems.find(mi => mi.id === item.id)
        if (!dbItem) continue // Item might have been deleted or invalid ID

        const price = Number(dbItem.price)
        totalAmount += price * item.quantity

        orderItemsData.push({
            menu_item_id: item.id,
            quantity: item.quantity,
            price: price, // Snapshot price
            options_selected: item.options || {},
        })
    }

    // 3. Create Order
    const orderId = crypto.randomUUID()
    const { data: { user } } = await supabase.auth.getUser()

    const { error: orderError } = await supabase
        .from('orders')
        .insert({
            id: orderId,
            store_id: storeId,
            tenant_id: tenantId,
            table_id: tableId || null,
            customer_id: user?.id || null, // Guest if null
            total_amount: totalAmount,
            status: 'pending',
            payment_status: 'pending', // Assume pay later for MVP
        })

    if (orderError) {
        return { error: orderError.message }
    }

    // 4. Create Order Items
    const itemsWithOrderId = orderItemsData.map(i => ({
        ...i,
        order_id: orderId
    }))

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsWithOrderId)

    if (itemsError) {
        // Ideally rollback (delete order), but for MVP just return error
        return { error: 'Failed to save order items' }
    }

    return { success: true, orderId: orderId }
}
