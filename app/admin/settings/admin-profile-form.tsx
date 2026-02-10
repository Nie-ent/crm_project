'use client'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updateAdminProfile, resetAdminPassword } from './actions'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface AdminProfileFormProps {
    user: {
        id: string
        email: string
        full_name: string | null
    }
}

export function AdminProfileForm({ user }: AdminProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isResetting, setIsResetting] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        const formData = new FormData(event.currentTarget)

        try {
            await updateAdminProfile(formData)
            toast.success('Profile updated', {
                description: 'Your profile details have been changed.'
            })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update profile';
            toast.error('Error', {
                description: message
            })
        } finally {
            setIsLoading(false)
        }
    }

    async function handleResetPassword() {
        setIsResetting(true)
        try {
            await resetAdminPassword()
            toast.success('Email Sent', {
                description: 'Check your email for password reset instructions.'
            })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to send reset email';
            toast.error('Error', {
                description: message
            })
        } finally {
            setIsResetting(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>
                    Manage your personal account settings.
                </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" value={user.email} disabled className="bg-muted" />
                        <p className="text-xs text-muted-foreground">
                            Email cannot be changed here. Contact global support.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            name="fullName"
                            defaultValue={user.full_name || ''}
                            placeholder="Your Name"
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between px-6 py-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleResetPassword}
                        disabled={isResetting}
                    >
                        {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Reset Password
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
