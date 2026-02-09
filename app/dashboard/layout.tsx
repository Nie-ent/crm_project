import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard,
    UtensilsCrossed,
    Store,
    Settings,
    ShoppingBag,
    LogOut,
    BarChart3,
    Users,
} from 'lucide-react'
import { signout } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'

export default async function DashboardLayout({
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

    // Optional: Check if user has a tenant_id. If not, they might be a fresh user who needs to be invited or create a tenant?
    // For now, let's assume valid users.

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md dark:bg-gray-800 hidden md:block">
                <div className="flex h-16 items-center justify-center border-b px-6">
                    <span className="text-xl font-bold font-mono">Resto<span className="text-primary">CRM</span></span>
                </div>
                <nav className="p-4 space-y-2">
                    <Link
                        href="/dashboard"
                        className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <LayoutDashboard size={20} />
                        <span>Overview</span>
                    </Link>
                    <Link
                        href="/dashboard/stores"
                        className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <Store size={20} />
                        <span>My Stores</span>
                    </Link>
                    <Link
                        href="/dashboard/team"
                        className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <Users size={20} />
                        <span>Team Library</span>
                    </Link>
                    <Link
                        href="/dashboard/menu"
                        className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <UtensilsCrossed size={20} />
                        <span>Menu & Items</span>
                    </Link>
                    <Link
                        href="/dashboard/orders"
                        className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <ShoppingBag size={20} />
                        <span>Orders</span>
                    </Link>
                    <Link
                        href="/dashboard/analytics"
                        className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <BarChart3 size={20} />
                        <span>Analytics</span>
                    </Link>
                    <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                        <Link
                            href="/dashboard/settings"
                            className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            <Settings size={20} />
                            <span>Settings</span>
                        </Link>
                    </div>
                </nav>
                <div className="border-t p-4 absolute bottom-0 w-64 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center space-x-3 mb-4 px-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm overflow-hidden">
                            <p className="font-medium truncate">{user.email}</p>
                            <p className="text-xs text-muted-foreground">Store Admin</p>
                        </div>
                    </div>
                    <form action={signout}>
                        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
        </div>
    )
}
