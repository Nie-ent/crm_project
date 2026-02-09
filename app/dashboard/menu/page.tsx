import { createClient } from '@/utils/supabase/server'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { CreateCategoryDialog } from './create-category-dialog'
import { CreateMenuItemDialog } from './create-menu-item-dialog'
import { CreateStoreDialog } from '@/app/dashboard/stores/create-store-dialog'
import { MenuItemAdminCard } from '@/components/menu/menu-item-admin-card'

export default async function MenuPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // 1. Get User's Tenant
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()

    if (!profile?.tenant_id) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold">No Organization Found</h1>
                <p>You need to be associated with an organization to manage a menu.</p>
            </div>
        )
    }

    // 2. Get First Store (MVP: Single Store focus)
    const { data: store } = await supabase
        .from('stores')
        .select('id, name')
        .eq('tenant_id', profile.tenant_id)
        .single() // If multiple, need a switcher. Using single() might fail if multiple exists, but good for now.

    if (!store) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold">No Store Found</h1>
                <p>Please create a store first.</p>
                <div className="mt-4">
                    <CreateStoreDialog />
                </div>
            </div>
        )
    }

    // 3. Fetch Menu Data
    const { data: categories } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('store_id', store.id)
        .order('sort_order')

    const { data: items } = await supabase
        .from('menu_items')
        .select('*')
        .eq('store_id', store.id)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
                    <p className="text-muted-foreground">Managing menu for: <span className="font-semibold text-primary">{store.name}</span></p>
                </div>
                <div className="flex gap-2">
                    <CreateCategoryDialog storeId={store.id} />
                    <CreateMenuItemDialog storeId={store.id} categories={categories || []} />
                </div>
            </div>

            <Tabs defaultValue="items" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="items">All Items</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>
                <TabsContent value="items" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {items?.map((item) => (
                            <MenuItemAdminCard
                                key={item.id}
                                item={item}
                                categoryName={categories?.find(c => c.id === item.category_id)?.name || 'Uncategorized'}
                            />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="categories">
                    <Card>
                        <CardHeader>
                            <CardTitle>Categories</CardTitle>
                            <CardDescription>
                                Organize your items into sections (e.g., Starters, Mains).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {categories?.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="flex items-center justify-between rounded-md border p-3 hover:bg-gray-50"
                                >
                                    <span className="font-medium">{cat.name}</span>
                                    <Badge variant="secondary">Active</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
