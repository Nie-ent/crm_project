import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function StoreSettingsPage({ params }: { params: Promise<{ storeId: string }> }) {
    // In Next.js 15+, params is async
    const { storeId } = await params

    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>

            <div className="grid gap-4 p-4 border rounded-lg bg-white dark:bg-gray-800">
                <div className="grid gap-2">
                    <Label>Store Name</Label>
                    <Input defaultValue="Loading..." disabled />
                    <p className="text-xs text-muted-foreground">Detailed configuration coming soon.</p>
                </div>
                <Button disabled>Save Changes</Button>
            </div>
        </div>
    )
}
