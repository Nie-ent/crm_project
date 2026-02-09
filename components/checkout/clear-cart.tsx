'use client'

import { useCartStore } from '@/store/use-cart-store'
import { useEffect } from 'react'

export function ClearCart() {
    const clearCart = useCartStore((state) => state.clearCart)

    useEffect(() => {
        clearCart()
    }, [clearCart])

    return null
}
