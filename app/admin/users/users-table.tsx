'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CreateUserDialog, EditUserDialog, DeleteUserDialog } from './user-dialogs'
import { useState } from 'react'
import { format } from 'date-fns'

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
    created_at: string
}

interface UsersTableProps {
    users: User[]
    tenants: Tenant[]
}

export default function UsersTable({ users, tenants }: UsersTableProps) {
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const handleEdit = (user: User) => {
        setSelectedUser(user)
        setIsEditOpen(true)
    }

    const handleDelete = (user: User) => {
        setSelectedUser(user)
        setIsDeleteOpen(true)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <CreateUserDialog tenants={tenants} />
            </div>

            <div className="rounded-md border bg-white dark:bg-gray-800">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Tenant</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{user.full_name}</span>
                                        <span className="text-sm text-muted-foreground">{user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'super_admin' ? 'destructive' : 'secondary'}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {user.tenants ? (
                                        <span className="font-medium">{user.tenants.name}</span>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {format(new Date(user.created_at), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {selectedUser && (
                <>
                    <EditUserDialog
                        user={selectedUser}
                        tenants={tenants}
                        open={isEditOpen}
                        onOpenChange={setIsEditOpen}
                    />
                    <DeleteUserDialog
                        userId={selectedUser.id}
                        open={isDeleteOpen}
                        onOpenChange={setIsDeleteOpen}
                    />
                </>
            )}
        </div>
    )
}
