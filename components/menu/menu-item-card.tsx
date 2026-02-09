'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCartStore } from '@/store/use-cart-store'
import { toast } from 'sonner'
import Image from 'next/image' // Optional, if we had images

interface MenuItemProps {
    id: string
    name: string
    price: number
    description?: string
    image_url?: string | null
    storeId: string
    isAvailable: boolean
}

export function MenuItemCard({ id, name, price, description, image_url, storeId, isAvailable }: MenuItemProps) {
    const addItem = useCartStore((state) => state.addItem)

    const handleAdd = () => {
        if (!isAvailable) return
        addItem({ id, name, price, storeId })
        toast.success(`Added ${name} to cart`)
    }

    return (
        <Card className={`overflow-hidden ${!isAvailable ? 'opacity-50 grayscale' : ''}`}>
            <div className="flex p-4 gap-4">
                {/* Image Square */}
                <div className="relative h-24 w-24 flex-shrink-0 rounded-md bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-muted-foreground text-xs overflow-hidden">
                    {image_url ? (
                        <Image
                            src={image_url}
                            alt={name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <span>No Image</span>
                    )}
                </div>

                <div className="flex flex-1 flex-col justify-between">
                    <div>
                        <h3 className="font-bold line-clamp-1">{name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{description || "No description available."}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-primary">${price}</span>
                        <Button size="sm" variant="secondary" className="h-8 w-8 rounded-full p-0" onClick={handleAdd} disabled={!isAvailable}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}
