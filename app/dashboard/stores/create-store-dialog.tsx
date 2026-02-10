'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createStore } from './actions'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Store } from 'lucide-react'

const schema = z.object({
    name: z.string().min(2),
    type: z.enum(['a_la_carte', 'buffet']),
})

export function CreateStoreDialog({ variant = 'default', tenantId }: { variant?: 'default' | 'outline' | 'ghost', tenantId?: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, reset, setValue } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            type: 'a_la_carte' as const,
        }
    })

    const onSubmit = async (data: any) => {
        setLoading(true)
        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('type', data.type)
        if (tenantId) {
            formData.append('tenantId', tenantId)
        }

        try {
            const res = await createStore(null, formData)
            if (res?.success) {
                toast.success(res.success)
                setOpen(false)
                reset()
            } else if (res?.error) {
                toast.error(res.error)
            }
        } catch {
            toast.error('Failed to create store')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={variant}>
                    {variant === 'default' ? <Plus className="mr-2 h-4 w-4" /> : <Store className="mr-2 h-4 w-4" />}
                    {variant === 'default' ? 'Create Store' : 'Add Store'}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Store</DialogTitle>
                    <DialogDescription>Add a new branch location.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Store Name</Label>
                        <Input {...register('name')} placeholder="e.g. Downtown Branch" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Business Model</Label>
                        <Select onValueChange={(val) => setValue('type', val as any)} defaultValue="a_la_carte">
                            <SelectTrigger>
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="a_la_carte">A La Carte (Standard)</SelectItem>
                                <SelectItem value="buffet">Buffet (Timer Based)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Store'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
