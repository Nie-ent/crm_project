'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'
import { toast } from 'sonner'
import { toggleMenuItemAvailability } from '@/app/dashboard/menu/actions'
import Image from 'next/image'

interface MenuItemAdminCardProps {
    item: {
        id: string
        name: string
        price: number
        description?: string | null
        is_available: boolean
        category_id?: string | null
        image_url?: string | null
    }
    categoryName: string
}

export function MenuItemAdminCard({ item, categoryName }: MenuItemAdminCardProps) {
    const [isAvailable, setIsAvailable] = useState(item.is_available)

    const handleToggle = async (checked: boolean) => {
        // Optimistic update
        setIsAvailable(checked)

        try {
            const res = await toggleMenuItemAvailability(item.id, checked)
            if (res?.error) {
                toast.error(res.error)
                setIsAvailable(!checked) // Revert
            } else {
                toast.success(`Item marked as ${checked ? 'Available' : 'Sold Out'}`)
            }
        } catch (e) {
            toast.error("Failed to update status")
            setIsAvailable(!checked)
        }
    }

    return (
        <Card className="flex flex-row overflow-hidden">
            <div className="relative w-24 h-auto bg-muted border-r">
                {item.image_url ? (
                    <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground p-2 text-center">
                        No Image
                    </div>
                )}
            </div>
            <div className="flex-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-bold">{item.name}</CardTitle>
                    <div className="flex items-center gap-2">
                        <Switch checked={isAvailable} onCheckedChange={handleToggle} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${item.price}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {categoryName}
                    </p>
                    {item.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                    )}
                    <div className="mt-2">
                        <Badge variant={isAvailable ? 'outline' : 'secondary'}>
                            {isAvailable ? 'Available' : 'Sold Out'}
                        </Badge>
                    </div>
                </CardContent>
            </div>
        </Card>
    )
}
