'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { login, signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

type AuthForm = z.infer<typeof authSchema>

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AuthForm>({
        resolver: zodResolver(authSchema),
    })

    const onSubmit = async (data: AuthForm) => {
        setLoading(true)
        const formData = new FormData()
        formData.append('email', data.email)
        formData.append('password', data.password)

        try {
            if (isLogin) {
                const res = await login(null, formData)
                if (res?.error) {
                    toast.error(res.error)
                } else if (res?.success) {
                    window.location.href = '/dashboard'
                }
            } else {
                const res = await signup(null, formData)
                if (res?.error) {
                    toast.error(res.error)
                } else if (res?.success) {
                    toast.success(res.success)
                }
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{isLogin ? 'Welcome Back' : 'Create Account'}</CardTitle>
                    <CardDescription>
                        {isLogin
                            ? 'Enter your credentials to access your account'
                            : 'Sign up to start managing your restaurant'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                {...register('email')}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register('password')}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading
                                ? 'Processing...'
                                : isLogin
                                    ? 'Sign In'
                                    : 'Sign Up'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button
                        variant="link"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-muted-foreground"
                    >
                        {isLogin
                            ? "Don't have an account? Sign up"
                            : 'Already have an account? Sign in'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
