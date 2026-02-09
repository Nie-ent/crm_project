import { CartSheet } from '@/components/ui/cart-sheet'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function StorePublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black font-sans pb-20">
            {/* Sticky Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <div className="container flex h-16 items-center justify-between px-4">
                    <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Is this generic?
                    </Link>
                    <div className="font-bold">RestoMenu</div>
                    <CartSheet />
                </div>
            </header>
            <main>
                {children}
            </main>
        </div>
    )
}
