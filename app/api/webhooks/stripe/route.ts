import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
    const body = await req.text()
    const headerList = await headers()
    const signature = headerList.get('stripe-signature') as string

    let event: Stripe.Event

    try {
        if (!signature || !webhookSecret) return new NextResponse('Webhook error', { status: 400 })
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message)
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId

        if (orderId) {
            const supabase = await createClient()
            console.log(`Payment successful for order ${orderId}`)

            // Update Order Payment Status
            const { error } = await supabase
                .from('orders')
                .update({ payment_status: 'paid' })
                .eq('id', orderId)

            if (error) {
                console.error('Supabase update failed:', error)
                return new NextResponse('Database update failed', { status: 500 })
            }
        }
    }

    return new NextResponse('Received', { status: 200 })
}
