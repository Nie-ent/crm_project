import { createClient } from '@/utils/supabase/server'
import { OrderCard } from '@/components/orders/order-card'
import { OrdersRealtime } from '@/components/orders/orders-realtime'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
    const supabase = await createClient()

    // 1. Get User's Tenant
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()

    if (!profile?.tenant_id) {
        return <div>No Organization Found</div>
    }

    // 2. Fetch Orders for Tenant
    // Join with stores to ensure we only get orders for stores in this tenant
    // Join with tables and order_items
    const { data: orders } = await supabase
        .from('orders')
        .select(`
            *,
            tables (name),
            stores!inner (tenant_id),
            order_items (
                id,
                quantity,
                price,
                notes,
                menu_item:menu_items (name)
            )
        `)
        .eq('stores.tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false })

    if (!orders) return <div>Failed to load orders</div>

    const activeOrders = orders.filter(o => ['pending', 'cooking', 'served'].includes(o.status))
    const completedOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status))

    return (
        <div className="space-y-6">
            <OrdersRealtime />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Kitchen / Orders</h1>
                    <p className="text-muted-foreground">Manage incoming orders in real-time.</p>
                </div>
            </div>

            <Tabs defaultValue="active" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="active">Active Orders ({activeOrders.length})</TabsTrigger>
                    <TabsTrigger value="completed">History ({completedOrders.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="active" className="space-y-4">
                    {activeOrders.length === 0 ? (
                        <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
                            <p className="text-muted-foreground">No active orders right now.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {activeOrders.map((order) => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="completed">
                    {completedOrders.length === 0 ? (
                        <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
                            <p className="text-muted-foreground">No completed or cancelled orders yet.</p>
                            <p className="text-sm text-muted-foreground mt-1">Orders move here once you click <strong>Complete Order</strong> or <strong>Cancel</strong>.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {completedOrders.map((order) => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
