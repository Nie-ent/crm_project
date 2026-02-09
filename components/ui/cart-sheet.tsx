'use client'

import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/store/use-cart-store'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { placeOrder } from '@/app/store/actions'

export function CartSheet() {
    const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore()
    const [open, setOpen] = useState(false)
    const [ordering, setOrdering] = useState(false)
    const searchParams = useSearchParams()
    const tableId = searchParams.get('tableId')

    // Checkout Logic
    const [isPaying, setIsPaying] = useState(false)

    // Checkout Logic (Pay Later / Cash)
    const handleCheckout = async () => {
        if (items.length === 0) return
        setOrdering(true)
        await processOrder(false)
        setOrdering(false)
    }

    // Pay Now Logic (Stripe)
    const handlePayment = async () => {
        if (items.length === 0) return
        setIsPaying(true)
        await processOrder(true)
        setIsPaying(false)
    }

    const processOrder = async (payNow: boolean) => {
        const storeId = items[0]?.storeId
        if (!storeId) {
            toast.error("Invalid cart state")
            return
        }

        try {
            // 1. Create Order in DB first
            const res = await placeOrder({
                storeId,
                items: items.map(i => ({ id: i.id, quantity: i.quantity })),
                tableId: tableId || undefined
            })

            if (res.error) {
                toast.error(res.error)
                return
            }

            if (res.success && res.orderId) {
                if (payNow) {
                    // 2. Initiate Stripe Checkout
                    const checkoutRes = await fetch('/api/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            items: items,
                            storeId,
                            tableId: tableId || undefined,
                            orderId: res.orderId
                        })
                    })
                    const checkoutData = await checkoutRes.json()
                    if (checkoutData.url) {
                        window.location.href = checkoutData.url
                        return // Don't clear cart immediately, wait for redirect
                    } else {
                        toast.error(checkoutData.error || "Payment failed")
                    }
                } else {
                    toast.success("Order # " + res.orderId.slice(0, 8) + " placed!")
                    clearCart()
                    setOpen(false)
                }
            }
        } catch (e) {
            toast.error("Something went wrong")
        }
    }

    const total = totalPrice().toFixed(2)
    const count = items.reduce((acc, item) => acc + item.quantity, 0)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button className="relative" size="icon" variant="outline">
                    <ShoppingBag className="h-5 w-5" />
                    {count > 0 && (
                        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center font-bold">
                            {count}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Your Order</SheetTitle>
                    <SheetDescription>
                        {count === 0 ? 'Your cart is empty' : `You have ${count} items in your cart`}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 -mx-6 px-6 my-4">
                    {items.length === 0 ? (
                        <div className="flex h-40 items-center justify-center text-muted-foreground">
                            Cart is empty. Add some delicious food!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between space-x-4">
                                    <div className="flex-1 space-y-1">
                                        <p className="font-medium leading-none">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">${item.price}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-4 text-center text-sm">{item.quantity}</span>
                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {items.length > 0 && (
                    <>
                        <Separator />
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${total}</span>
                            </div>
                            <SheetFooter>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button onClick={handleCheckout} variant="outline" disabled={ordering || isPaying}>
                                        {ordering ? 'Placing...' : 'Pay Later'}
                                    </Button>
                                    <Button onClick={handlePayment} disabled={ordering || isPaying}>
                                        {isPaying ? 'Redirecting...' : 'Pay Now'}
                                    </Button>
                                </div>
                            </SheetFooter>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
