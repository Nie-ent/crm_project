import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { signout } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Store, ShoppingBag, DollarSign, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

    if (!profile?.tenant_id) {
        return <div className="p-8">No Organization Found</div>
    }

    // Fetch Metrics
    // 1. Stores Count
    const { count: storeCount } = await supabase
        .from('stores')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', profile.tenant_id)

    // 2. Active Orders Count (pending, cooking, served) for all stores in tenant
    const { count: activeOrdersCount } = await supabase
        .from('orders')
        .select('store_id, stores!inner(tenant_id)', { count: 'exact', head: true })
        .eq('stores.tenant_id', profile.tenant_id)
        .in('status', ['pending', 'cooking', 'served'])

    // 3. Recent Orders (limit 5)
    // We need to fetch actual data here
    const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
            id,
            total_amount,
            status,
            created_at,
            stores!inner(name, tenant_id),
            tables(name)
        `)
        .eq('stores.tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false })
        .limit(5)


    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Overview of your business performance.</p>
                </div>
                <form action={signout}>
                    <Button variant="outline">Sign Out</Button>
                </form>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{storeCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Active locations</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeOrdersCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Orders in kitchen</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                        <Button asChild size="sm" variant="default">
                            <Link href="/dashboard/orders">View Orders</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                            <Link href="/dashboard/menu">Manage Menu</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {!recentOrders || recentOrders.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No orders yet.</div>
                    ) : (
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                                    <div>
                                        <p className="font-medium">
                                            {/* @ts-ignore active orders join fix */}
                                            {order.tables?.name || (order.tables as any)?.name ? `Table ${(order.tables as any)?.name || order.tables?.name}` : 'Takeaway'}
                                            {/* @ts-ignore active orders join fix */}
                                            <span className="text-muted-foreground font-normal ml-2">in {(order.stores as any)?.name || order.stores?.name}</span>
                                        </p>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(order.created_at).toLocaleString()} • <span className="capitalize">{order.status}</span>
                                        </div>
                                    </div>
                                    <div className="font-bold">
                                        ${order.total_amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-4">
                        <Button asChild variant="link" className="p-0 h-auto">
                            <Link href="/dashboard/orders" className="flex items-center">
                                View all orders <ArrowRight className="ml-1 w-4 h-4" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
