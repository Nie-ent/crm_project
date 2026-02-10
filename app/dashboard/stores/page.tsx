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

interface StoresPageProps {
    searchParams: { [key: string]: string | string[] | undefined }
}

export default async function StoresPage({ searchParams }: StoresPageProps) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Get User Role & Tenant
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user?.id)
        .single()

    // Determine which tenant to use
    let targetTenantId = profile?.tenant_id
    const params = await searchParams; // Next.js 15+ async searchParams
    const overrideTenantId = typeof params.tenant_id === 'string' ? params.tenant_id : undefined

    // If Super Admin and override is present, use it
    if (profile?.role === 'super_admin' && overrideTenantId) {
        targetTenantId = overrideTenantId
    }

    if (!targetTenantId && profile?.role !== 'super_admin') {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold">No Organization Found</h1>
            </div>
        )
    }

    // Initialize query
    let query = supabase.from('stores').select('*')

    // If super admin and no tenant specified, maybe show ALL (careful with volume) or just own?
    // Let's filter by targetTenantId if exists. 
    if (targetTenantId) {
        query = query.eq('tenant_id', targetTenantId)
    } else if (profile?.role === 'super_admin') {
        // Show all stores if super admin and no specific tenant selected?
        // Or prompt to select one? 
        // For now, let's show all, but order by tenant
        query = query.order('tenant_id', { ascending: true })
    }

    const { data: stores } = await query

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {targetTenantId ? 'Stores' : 'All Stores (Admin)'}
                    </h1>
                    {profile?.role === 'super_admin' && targetTenantId && (
                        <p className="text-muted-foreground text-sm">
                            Viewing as Super Admin for Tenant ID: {targetTenantId}
                        </p>
                    )}
                </div>
                {targetTenantId && <CreateStoreDialog tenantId={targetTenantId} />}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stores?.length === 0 && (
                    <div className="col-span-3 text-center py-10 text-muted-foreground">
                        No stores found.
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
