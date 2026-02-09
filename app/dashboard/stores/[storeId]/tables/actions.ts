'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const zoneSchema = z.object({
    name: z.string().min(1, "Name is required"),
    store_id: z.string().uuid()
})

const tableSchema = z.object({
    name: z.string().min(1, "Name is required"),
    zone_id: z.string().uuid(),
    store_id: z.string().uuid(),
    capacity: z.coerce.number().min(1).default(4)
})

export async function createZone(formData: FormData) {
    const supabase = await createClient()
    const data = Object.fromEntries(formData)

    // Validate
    const parsed = zoneSchema.safeParse(data)
    if (!parsed.success) return { error: "Invalid data" }

    const { error } = await supabase.from('zones').insert(parsed.data)

    if (error) return { error: error.message }

    revalidatePath(`/dashboard/stores/${parsed.data.store_id}/tables`)
    return { success: true }
}

export async function deleteZone(zoneId: string, storeId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('zones').delete().eq('id', zoneId)

    if (error) return { error: error.message }

    revalidatePath(`/dashboard/stores/${storeId}/tables`)
    return { success: true }
}

export async function createTable(formData: FormData) {
    const supabase = await createClient()
    const data = Object.fromEntries(formData)

    const parsed = tableSchema.safeParse(data)
    if (!parsed.success) return { error: "Invalid data" }

    // Generate a simple identifier for the QR code later (just the ID is enough)
    const { error } = await supabase.from('tables').insert({
        ...parsed.data,
        qr_code: 'generated-on-client' // Placeholder, we generate dynamically
    })

    if (error) return { error: error.message }

    revalidatePath(`/dashboard/stores/${parsed.data.store_id}/tables`)
    return { success: true }
}

export async function deleteTable(tableId: string, storeId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('tables').delete().eq('id', tableId)

    if (error) return { error: error.message }

    revalidatePath(`/dashboard/stores/${storeId}/tables`)
    return { success: true }
}
