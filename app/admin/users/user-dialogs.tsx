'use client'

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { toast } from 'sonner'
import { createUser, updateUser, deleteUser } from './actions'
import { Loader2 } from 'lucide-react'

// Types (should be imported from shared location but defining here for speed/context)
type Tenant = {
    id: string
    name: string
}

type User = {
    id: string
    email: string
    full_name: string
    role: 'super_admin' | 'store_admin' | 'staff'
    tenant_id: string | null
    tenants?: Tenant | null
}

interface CreateUserDialogProps {
    tenants: Tenant[]
}

export function CreateUserDialog({ tenants }: CreateUserDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)

        try {
            await createUser(formData)
            toast.success('User created', {
                description: 'The user has been successfully created.'
            })
            setOpen(false)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Something went wrong';
            toast.error('Error', {
                description: message
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add User</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Create a new administrator or staff member.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" required placeholder="user@example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" name="fullName" required placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required minLength={6} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select name="role" required defaultValue="staff">
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                <SelectItem value="store_admin">Store Admin</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tenantId">Tenant</Label>
                        <Select name="tenantId">
                            <SelectTrigger>
                                <SelectValue placeholder="Select a tenant (optional for Super Admin)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None (Super Admin only)</SelectItem>
                                {tenants.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Required for Store Admin and Staff.</p>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create User
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

interface EditUserDialogProps {
    user: User
    tenants: Tenant[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditUserDialog({ user, tenants, open, onOpenChange }: EditUserDialogProps) {
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        const formData = new FormData(event.currentTarget)
        formData.append('userId', user.id)

        try {
            await updateUser(formData)
            toast.success('User updated', {
                description: 'User details have been updated.'
            })
            onOpenChange(false)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update user.';
            toast.error('Error', {
                description: message
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input id="edit-email" value={user.email || ''} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-fullName">Full Name</Label>
                        <Input id="edit-fullName" name="fullName" defaultValue={user.full_name || ''} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-role">Role</Label>
                        <Select name="role" defaultValue={user.role} required>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                <SelectItem value="store_admin">Store Admin</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-tenantId">Tenant</Label>
                        <Select name="tenantId" defaultValue={user.tenant_id || 'none'}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a tenant" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {tenants.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

interface DeleteUserDialogProps {
    userId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteUserDialog({ userId, open, onOpenChange }: DeleteUserDialogProps) {
    const [isLoading, setIsLoading] = useState(false)

    async function onConfirm() {
        setIsLoading(true)
        try {
            await deleteUser(userId)
            toast.success('User deleted', {
                description: 'The user has been permanently deleted.'
            })
            onOpenChange(false)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete user.';
            toast.error('Error', {
                description: message
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the user account and remove their access.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
