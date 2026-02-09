import { createClient } from '@/utils/supabase/server'
import { CreateStoreDialog } from './create-store-dialog'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'lucide-react'
import NextLink from 'next/link'

export default async function StoresPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Get User's Tenant
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()

    if (!profile?.tenant_id) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold">No Organization Found</h1>
            </div>
        )
    }

    const { data: stores } = await supabase
        .from('stores')
        .select('*')
        .eq('tenant_id', profile.tenant_id)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">My Stores</h1>
                <CreateStoreDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stores?.length === 0 && (
                    <div className="col-span-3 text-center py-10 text-muted-foreground">
                        No stores found. Create your first branch.
                    </div>
                )}
                {stores?.map((store) => (
                    <Card key={store.id}>
                        <CardHeader>
                            <CardTitle className="flex justify-between">
                                {store.name}
                                <Badge variant="outline" className="capitalize">{store.type.replace('_', ' ')}</Badge>
                            </CardTitle>
                            <CardDescription>Created on {new Date(store.created_at).toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground mb-4">
                                <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded select-all">ID: {store.id}</span>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <NextLink href={`/dashboard/stores/${store.id}/settings`}>
                                        Settings
                                    </NextLink>
                                </Button>
                                <Button size="sm" asChild>
                                    <NextLink href={`/dashboard?store_id=${store.id}`}>
                                        Manage
                                    </NextLink>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
