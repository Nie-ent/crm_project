import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia', // Use latest or what's compatible
})

export async function POST(req: Request) {
    const headerList = await headers()
    const origin = headerList.get('origin') || 'http://localhost:3000'

    try {
        const body = await req.json()
        const { items, storeId, tableId, orderId } = body

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            line_items: items.map((item: any) => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        // images: item.image_url ? [item.image_url] : [],
                    },
                    unit_amount: Math.round(item.price * 100), // cents
                },
                quantity: 1, // Cart currently treats each addItem as 1 line? Or do we have quantity?
                // The cart logic in store/actions.ts currently iterates and adds single items. 
                // We should probably aggregate them if quantity > 1, but for now assuming 1 per line item object passed.
            })),
            mode: 'payment',
            success_url: `${origin}/store/${storeId}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/store/${storeId}?canceled=true`,
            metadata: {
                orderId: orderId,
                storeId: storeId,
                tableId: tableId || '',
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (err: any) {
        console.error('Stripe Error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
