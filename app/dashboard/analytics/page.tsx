import { createClient } from '@/utils/supabase/server'
import { getAnalyticsData } from './actions'
import { OverviewChart, TopItemsList } from '@/components/analytics/charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign, CreditCard, Users } from 'lucide-react'

export default async function AnalyticsPage({
    searchParams,
}: {
    searchParams: Promise<{ range?: string }>
}) {
    const supabase = await createClient()
    const { range } = await searchParams
    const selectedRange = (range as '7d' | '30d' | 'today') || '7d'

    // 1. Get Store (Single setup)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()
    const { data: store } = await supabase.from('stores').select('id, name').eq('tenant_id', profile?.tenant_id).single()

    if (!store) return <div>No Store Found</div>

    // 2. Get Data
    const data = await getAnalyticsData(store.id, selectedRange)

    if (!data) return <div>Failed to load data</div>

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Analytics: {store.name}</h2>
                <div className="flex items-center space-x-2">
                    {/* Simple Range Switcher using Links (or client component) */}
                    <div className="flex gap-2 text-sm">
                        <a href="?range=today" className={`px-3 py-1 rounded-md ${selectedRange === 'today' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>Today</a>
                        <a href="?range=7d" className={`px-3 py-1 rounded-md ${selectedRange === '7d' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>7 Days</a>
                        <a href="?range=30d" className={`px-3 py-1 rounded-md ${selectedRange === '30d' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>30 Days</a>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${data.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            For selected period
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Orders</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{data.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            For selected period
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${data.avgOrderValue.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart data={data.chartData} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Selling Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TopItemsList data={data.topItems} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
