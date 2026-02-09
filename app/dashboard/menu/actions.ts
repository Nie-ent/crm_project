'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const categorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    store_id: z.string().uuid(),
})

const menuItemSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    price: z.coerce.number().min(0, 'Price must be positive'),
    category_id: z.string().uuid().optional(),
    store_id: z.string().uuid(),
    description: z.string().optional(),
    is_available: z.boolean().default(true),
    image_url: z.string().optional(),
})

export async function createCategory(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const data = Object.fromEntries(formData)
    const parsed = categorySchema.safeParse(data)

    if (!parsed.success) {
        return { error: 'Invalid data', details: parsed.error.issues }
    }

    const { error } = await supabase.from('menu_categories').insert(parsed.data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/menu')
    return { success: 'Category created' }
}

export async function createMenuItem(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const data = Object.fromEntries(formData)
    // Checkbox handling for boolean
    const rawData = {
        ...data,
        is_available: data.is_available === 'on',
    }

    const parsed = menuItemSchema.safeParse(rawData)

    if (!parsed.success) {
        return { error: 'Invalid data', details: parsed.error.issues }
    }

    const { error } = await supabase.from('menu_items').insert(parsed.data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/menu')
    return { success: 'Menu item added' }
}

export async function toggleMenuItemAvailability(id: string, isAvailable: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('menu_items')
        .update({ is_available: isAvailable })
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/menu')
    revalidatePath(`/store/${id}`) // Also revalidate store page
    return { success: 'Item updated' }
}
