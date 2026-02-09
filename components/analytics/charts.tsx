'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface OverviewProps {
    data: {
        date: string
        revenue: number
    }[]
}

export function OverviewChart({ data }: OverviewProps) {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-[350px] text-muted-foreground">No data available</div>
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar
                    dataKey="revenue"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="fill-primary"
                />
            </BarChart>
        </ResponsiveContainer>
    )
}

interface TopItemsProps {
    data: {
        name: string
        quantity: number
    }[]
}

export function TopItemsList({ data }: TopItemsProps) {
    if (!data || data.length === 0) {
        return <div className="text-sm text-muted-foreground">No sales yet.</div>
    }

    return (
        <div className="space-y-8">
            {data.map((item, index) => (
                <div key={index} className="flex items-center">
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{item.name}</p>
                    </div>
                    <div className="ml-auto font-medium">{item.quantity} sold</div>
                </div>
            ))}
        </div>
    )
}
