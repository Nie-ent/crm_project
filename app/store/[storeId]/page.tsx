import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { MenuItemCard } from '@/components/menu/menu-item-card'
import { Badge } from '@/components/ui/badge'

export default async function StorePage({
    params,
    searchParams,
}: {
    params: Promise<{ storeId: string }>
    searchParams: Promise<{ tableId?: string }>
}) {
    const supabase = await createClient()
    const { storeId } = await params
    const { tableId } = await searchParams

    // 1. Fetch Store Details
    const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single()

    if (storeError || !store) {
        notFound()
    }

    // 1.5 Fetch Table Details (if tableId present)
    let tableName = null
    if (tableId) {
        const { data: table } = await supabase
            .from('tables')
            .select('name')
            .eq('id', tableId)
            .single()
        if (table) tableName = table.name
    }

    // 2. Fetch Categories
    const { data: categories } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('store_id', storeId)
        .order('sort_order', { ascending: true })

    // 3. Fetch Items
    const { data: items } = await supabase
        .from('menu_items')
        .select('*')
        .eq('store_id', storeId)

    return (
        <div>
            {/* Banner / Info */}
            <div className="bg-white dark:bg-gray-800 p-6 border-b">
                <div className="container px-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-extrabold">{store.name}</h1>
                            <div className="flex gap-2 mt-2">
                                <Badge variant="secondary" className="capitalize">{store.type.replace('_', ' ')}</Badge>
                                <div className="text-sm text-muted-foreground flex items-center">
                                    Mock Opening Hours: 9:00 - 22:00
                                </div>
                            </div>
                        </div>
                        {tableName && (
                            <div className="text-right">
                                <Badge variant="outline" className="text-lg px-3 py-1 border-primary text-primary">
                                    Table {tableName}
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-1">Dine-in Order</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Menu Content */}
            <div className="container px-4 py-6 space-y-8">
                {!categories || categories.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">Menu is empty.</p>
                    </div>
                ) : (
                    categories.map((category) => {
                        const categoryItems = items?.filter(i => i.category_id === category.id)
                        if (!categoryItems?.length) return null

                        return (
                            <section key={category.id} id={`category-${category.id}`} className="scroll-mt-20">
                                <h2 className="text-xl font-bold mb-4">{category.name}</h2>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {categoryItems.map(item => (
                                        <MenuItemCard
                                            key={item.id}
                                            id={item.id}
                                            name={item.name}
                                            price={item.price}
                                            description={item.description}
                                            storeId={store.id}
                                            isAvailable={item.is_available}
                                        />
                                    ))}
                                </div>
                            </section>
                        )
                    })
                )}

                {/* Uncategorized Items (if any) */}
                {items?.filter(i => !i.category_id).length! > 0 && (
                    <section className="scroll-mt-20">
                        <h2 className="text-xl font-bold mb-4">Others</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {items?.filter(i => !i.category_id).map(item => (
                                <MenuItemCard
                                    key={item.id}
                                    id={item.id}
                                    name={item.name}
                                    price={item.price}
                                    description={item.description}
                                    storeId={store.id}
                                    isAvailable={item.is_available}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
