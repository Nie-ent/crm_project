import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Plus, MapPin, Grid3X3 } from 'lucide-react'
import { QRCodeDialog } from '@/components/tables/qr-code-dialog'
import { createZone, deleteZone, createTable, deleteTable } from './actions'

// Helper to cast actions for form usage to satisfy TS
const safeCreateZone = createZone as any
const safeDeleteZone = deleteZone as any
const safeCreateTable = createTable as any
const safeDeleteTable = deleteTable as any

export default async function TablesPage({ params }: { params: Promise<{ storeId: string }> }) {
    const supabase = await createClient()
    const { storeId } = await params

    // 1. Fetch Store, Zones, and Tables
    const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single()

    if (storeError || !store) notFound()

    const { data: zones } = await supabase
        .from('zones')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at')

    const { data: tables } = await supabase
        .from('tables')
        .select('*')
        .eq('store_id', storeId)
        .order('name')

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tables & Zones</h1>
                <p className="text-muted-foreground">Manage your floor plan and generate QR codes.</p>
            </div>

            {/* Zones Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Zones
                    </h2>
                </div>

                <div className="flex gap-4 items-end border p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <form action={safeCreateZone} className="flex-1 flex gap-4 items-end">
                        <input type="hidden" name="store_id" value={storeId} />
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="zone-name">Add New Zone</Label>
                            <Input type="text" id="zone-name" name="name" placeholder="e.g. Indoor, Patio" required />
                        </div>
                        <Button type="submit" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Zone
                        </Button>
                    </form>
                </div>

                {(!zones || zones.length === 0) && (
                    <p className="text-muted-foreground italic text-sm">No zones created yet.</p>
                )}
            </div>

            {/* Tables per Zone */}
            <div className="grid gap-6">
                {zones?.map((zone) => {
                    const zoneTables = tables?.filter(t => t.zone_id === zone.id) || []
                    return (
                        <Card key={zone.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                    <CardTitle>{zone.name}</CardTitle>
                                    <CardDescription>{zoneTables.length} tables</CardDescription>
                                </div>
                                <form action={safeDeleteZone.bind(null, zone.id, storeId)}>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </form>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4">
                                    {zoneTables.length > 0 ? (
                                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                            {zoneTables.map((table) => (
                                                <div key={table.id} className="flex flex-col gap-2 p-3 border rounded-md bg-white dark:bg-gray-900 shadow-sm relative group">
                                                    <div className="flex justify-between items-start">
                                                        <div className="font-bold text-lg">{table.name}</div>
                                                        <form action={safeDeleteTable.bind(null, table.id, storeId)}>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-500">
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </form>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Capacity: {table.capacity}</div>

                                                    <QRCodeDialog
                                                        tableId={table.id}
                                                        tableName={table.name}
                                                        storeId={storeId}
                                                        storeName={store.name}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground py-4 text-center border-dashed border-2 rounded">
                                            No tables in this zone.
                                        </div>
                                    )}

                                    {/* Add Table to Zone Form */}
                                    <div className="pt-2">
                                        <form action={safeCreateTable} className="flex gap-2 items-center">
                                            <input type="hidden" name="store_id" value={storeId} />
                                            <input type="hidden" name="zone_id" value={zone.id} />
                                            <Input name="name" placeholder="Table Name (e.g. 1, A1)" className="h-8 w-32" required />
                                            <Input name="capacity" type="number" placeholder="Seats" className="h-8 w-20" defaultValue="4" />
                                            <Button type="submit" size="sm" variant="secondary" className="h-8">
                                                <Plus className="w-3 h-3 mr-1" />
                                                Add Table
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
