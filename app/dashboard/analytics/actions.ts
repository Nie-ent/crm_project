'use server'

import { createClient } from '@/utils/supabase/server'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'

export async function getAnalyticsData(storeId: string, range: '7d' | '30d' | 'today' = '7d') {
    const supabase = await createClient()

    // Determine Date Range
    const now = new Date()
    let startDate = subDays(now, 7)

    if (range === '30d') startDate = subDays(now, 30)
    if (range === 'today') startDate = startOfDay(now)

    // 1. Fetch Orders
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Analytics Error:', error)
        return null
    }

    // 2. Calculate Key Metrics
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // 3. Prepare Chart Data (Revenue over time)
    // Group by Date
    const chartDataMap = new Map<string, number>()

    // Initialize map with 0s for the whole range (to have continuous line/bars)
    // For simplicity in MVP, just grouping actual orders
    orders.forEach(order => {
        const dateStr = format(new Date(order.created_at), 'MM/dd') // Simple format
        const current = chartDataMap.get(dateStr) || 0
        chartDataMap.set(dateStr, current + (Number(order.total_amount) || 0))
    })

    const chartData = Array.from(chartDataMap.entries()).map(([date, revenue]) => ({
        date,
        revenue
    }))

    // 4. Top Selling Items (Need separate query on order_items)
    const { data: orderItems } = await supabase
        .from('order_items')
        .select('menu_item_id, quantity, menu_items(name)')
        .in('order_id', orders.map(o => o.id))

    const itemSales = new Map<string, { name: string, quantity: number }>()

    orderItems?.forEach(item => {
        // Supabase join returns an object or array. Usually object for FK.
        const menuItem = item.menu_items as any
        if (!menuItem?.name) return
        const name = menuItem.name
        const current = itemSales.get(name) || { name, quantity: 0 }
        itemSales.set(name, { name, quantity: current.quantity + item.quantity })
    })

    const topItems = Array.from(itemSales.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)

    return {
        totalOrders,
        totalRevenue,
        avgOrderValue,
        chartData,
        topItems
    }
}
