import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard,
    Store,
    Settings,
    Users,
    LogOut,
} from 'lucide-react'
import { signout } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'super_admin') {
        // If not super admin, maybe redirect to their tenant dashboard or show unauthorized
        // For now, redirect to root which will redirect to their dashboard via middleware
        return (
            <div className="flex h-screen flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
                <p>You do not have permission to view this area.</p>
                <Link href="/" className="text-blue-500 hover:underline">Return to Dashboard</Link>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md dark:bg-gray-800 hidden md:block">
                <div className="flex h-16 items-center justify-center border-b px-6">
                    <span className="text-lg font-bold">Admin Console</span>
                </div>
                <nav className="p-4 space-y-2">
                    <Link
                        href="/admin"
                        className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <LayoutDashboard size={20} />
                        <span>Overview</span>
                    </Link>
                    <Link
                        href="/admin/tenants"
                        className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <Store size={20} />
                        <span>Tenants</span>
                    </Link>
                    <Link
                        href="/admin/users"
                        className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <Users size={20} />
                        <span>Users</span>
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <Settings size={20} />
                        <span>Settings</span>
                    </Link>
                </nav>
                <div className="border-t p-4 absolute bottom-0 w-64">
                    <form action={signout}>
                        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
    )
}
