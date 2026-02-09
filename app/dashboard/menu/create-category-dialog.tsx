'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createCategory } from './actions'
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
import { toast } from 'sonner'
import { FolderPlus } from 'lucide-react'

const schema = z.object({
    name: z.string().min(1),
})

export function CreateCategoryDialog({ storeId }: { storeId: string }) {
    const [open, setOpen] = useState(false)

    const { register, handleSubmit, reset } = useForm<{ name: string }>({
        resolver: zodResolver(schema)
    })

    const onSubmit = async (data: { name: string }) => {
        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('store_id', storeId)

        const res = await createCategory(null, formData)
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
                <Button variant="outline">
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Category</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input {...register('name')} placeholder="e.g. Drinks" />
                    </div>
                    <Button type="submit">Save</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
