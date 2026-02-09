'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createMenuItem } from './actions'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

import { ImageUpload } from '@/components/ui/image-upload'

const schema = z.object({
    name: z.string().min(1),
    price: z.string().min(1), // Handle as string for input, convert later
    category_id: z.string().optional(),
    image_url: z.string().optional(),
    is_available: z.boolean().default(true),
})

export function CreateMenuItemDialog({ storeId, categories }: { storeId: string, categories: any[] }) {
    const [open, setOpen] = useState(false)

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            price: '',
            category_id: '',
            image_url: '',
            is_available: true
        }
    })

    const onSubmit = async (data: any) => {
        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('price', data.price)
        formData.append('store_id', storeId)
        if (data.category_id) formData.append('category_id', data.category_id)
        if (data.image_url) formData.append('image_url', data.image_url)
        formData.append('is_available', data.is_available ? 'on' : 'off')

        const res = await createMenuItem(null, formData)
        if (res?.success) {
            toast.success(res.success)
            setOpen(false)
            reset()
        } else {
            toast.error(res?.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Menu Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex justify-center mb-4">
                        <ImageUpload
                            value={watch('image_url')}
                            onChange={(url) => setValue('image_url', url)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input {...register('name')} placeholder="e.g. Signature Latte" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Price</Label>
                        <Input {...register('price')} type="number" step="0.01" placeholder="0.00" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Category</Label>
                        <Select onValueChange={(val) => setValue('category_id', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label>Available</Label>
                            <div className="text-xs text-muted-foreground">
                                Show this item in the store
                            </div>
                        </div>
                        <Switch
                            checked={watch('is_available')}
                            onCheckedChange={(val) => setValue('is_available', val)}
                        />
                    </div>
                    <Button type="submit">Save Item</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
