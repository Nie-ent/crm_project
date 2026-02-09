import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

import { ClearCart } from '@/components/checkout/clear-cart'

export default async function SuccessPage({
    params,
    searchParams,
}: {
    params: Promise<{ storeId: string }>
    searchParams: Promise<{ session_id: string }>
}) {
    const { storeId } = await params
    // In a real app, we might fetch session details to show the amount paid

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
            <ClearCart />
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full space-y-6">
                <div className="flex justify-center">
                    <CheckCircle2 className="h-24 w-24 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Payment Successful!</h1>
                <p className="text-gray-500">
                    Thank you for your order. The kitchen has received it and will start preparing your food shortly.
                </p>
                <div className="pt-4">
                    <Link href={`/store/${storeId}`}>
                        <Button className="w-full" size="lg">
                            Order More
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
