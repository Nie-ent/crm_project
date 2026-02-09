'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function OrdersRealtime() {
    const router = useRouter()
    const supabase = createClient()
    const [status, setStatus] = useState('CONNECTING')
    const [lastEvent, setLastEvent] = useState<string | null>(null)

    useEffect(() => {
        // Debug Auth State
        supabase.auth.getUser().then(({ data }) => {
            console.log('Realtime User Check:', data.user?.id || 'No User')
        })

        const channel = supabase
            .channel('orders-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'orders',
                },
                (payload) => {
                    console.log('Realtime Event Received:', payload)
                    setLastEvent(`${payload.eventType} at ${new Date().toLocaleTimeString()}`)

                    // Refresh the data
                    router.refresh()

                    // Optional: Show a toast
                    if (payload.eventType === 'INSERT') {
                        toast.info('New order received!')
                    } else if (payload.eventType === 'UPDATE') {
                        console.log('Order Updated:', payload.new)
                        toast("Order updated")
                    }
                }
            )
            .subscribe((status) => {
                console.log('REALTIME SUBSCRIPTION STATUS:', status)
                setStatus(status)
                if (status === 'SUBSCRIBED') {
                    toast.success('Connected to Live Orders')
                }
                if (status === 'CHANNEL_ERROR') {
                    toast.error('Realtime Connection Error')
                }
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, router])

    return null
}
