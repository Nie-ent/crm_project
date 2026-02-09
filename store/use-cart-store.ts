import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
    id: string // menu_item_id
    name: string
    price: number
    quantity: number
    storeId: string
    options?: any // For future modifiers
}

interface CartState {
    items: CartItem[]
    addItem: (item: Omit<CartItem, 'quantity'>) => void
    removeItem: (itemId: string) => void
    updateQuantity: (itemId: string, quantity: number) => void
    clearCart: () => void
    totalItems: () => number
    totalPrice: () => number
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (newItem) =>
                set((state) => {
                    const existing = state.items.find((i) => i.id === newItem.id)
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.id === newItem.id
                                    ? { ...i, quantity: i.quantity + 1 }
                                    : i
                            ),
                        }
                    }
                    return { items: [...state.items, { ...newItem, quantity: 1 }] }
                }),
            removeItem: (itemId) =>
                set((state) => ({
                    items: state.items.filter((i) => i.id !== itemId),
                })),
            updateQuantity: (itemId, quantity) =>
                set((state) => {
                    if (quantity <= 0) {
                        return { items: state.items.filter((i) => i.id !== itemId) }
                    }
                    return {
                        items: state.items.map((i) =>
                            i.id === itemId ? { ...i, quantity } : i
                        ),
                    }
                }),
            clearCart: () => set({ items: [] }),
            totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
            totalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
        }),
        {
            name: 'resto-cart', // key in localStorage
        }
    )
)
