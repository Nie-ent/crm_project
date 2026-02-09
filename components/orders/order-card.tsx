'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Clock, CheckCircle, ChefHat, XCircle } from 'lucide-react'
import { updateOrderStatus } from '@/app/dashboard/orders/actions'
import { toast } from 'sonner'
import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface OrderItem {
    id: string
    quantity: number
    price: number
    menu_item: {
        name: string
    } | null
    notes?: string
}

interface Order {
    id: string
    table_id: string | null
    status: 'pending' | 'cooking' | 'served' | 'completed' | 'cancelled'
    total_amount: number
    created_at: string
    order_items: OrderItem[]
    tables?: {
        name: string
    } | null
}

interface OrderCardProps {
    order: Order
}

export function OrderCard({ order }: OrderCardProps) {
    const [status, setStatus] = useState(order.status)
    const [loading, setLoading] = useState(false)

    const handleStatusUpdate = async (newStatus: Order['status']) => {
        setLoading(true)
        const res = await updateOrderStatus(order.id, newStatus)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            setStatus(newStatus)
            toast.success(`Order marked as ${newStatus}`)
        }
    }

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
        cooking: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
        served: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
        completed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    }

    return (
        <Card className="flex flex-col h-full overflow-hidden border-2">
            <CardHeader className="bg-muted/50 pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            {order.tables?.name ? `Table ${order.tables.name}` : 'Takeaway'}
                            <Badge variant="outline" className={statusColors[status]}>
                                {status.toUpperCase()}
                            </Badge>
                        </CardTitle>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {new Date(order.created_at).toLocaleTimeString()}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-lg">${order.total_amount}</div>
                        <div className="text-xs text-muted-foreground">#{order.id.slice(0, 6)}</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <ScrollArea className="h-48 px-6 py-4">
                    <div className="space-y-3">
                        {order.order_items.map((item) => (
                            <div key={item.id} className="flex justify-between items-start text-sm">
                                <div className="flex gap-2">
                                    <span className="font-bold w-6 text-center bg-gray-100 dark:bg-gray-800 rounded px-1">
                                        {item.quantity}x
                                    </span>
                                    <div>
                                        <p className="font-medium">{item.menu_item?.name || 'Unknown Item'}</p>
                                        {item.notes && <p className="text-xs text-muted-foreground italic">{item.notes}</p>}
                                    </div>
                                </div>
                                <span className="text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <Separator />
            </CardContent>
            <CardFooter className="p-4 bg-muted/20 flex gap-2 justify-end">
                {status === 'pending' && (
                    <>
                        <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate('cancelled')} disabled={loading}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={() => handleStatusUpdate('cooking')} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                            <ChefHat className="w-4 h-4 mr-1" />
                            Start Cooking
                        </Button>
                    </>
                )}
                {status === 'cooking' && (
                    <Button size="sm" onClick={() => handleStatusUpdate('served')} disabled={loading} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Serve
                    </Button>
                )}
                {status === 'served' && (
                    <Button size="sm" variant="outline" onClick={() => handleStatusUpdate('completed')} disabled={loading}>
                        Complete Order
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
