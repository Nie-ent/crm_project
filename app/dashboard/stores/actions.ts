'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const storeSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    type: z.enum(['a_la_carte', 'buffet']).default('a_la_carte'),
})

export async function createStore(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // Authenticate
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Get User Role & Tenant
    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()

    // Determine Tenant ID
    let targetTenantId = profile?.tenant_id
    const overrideTenantId = formData.get('tenantId') as string | null

    if (profile?.role === 'super_admin' && overrideTenantId) {
        targetTenantId = overrideTenantId
    }

    if (!targetTenantId) return { error: 'No organization found' }

    // Validate
    const data = Object.fromEntries(formData)
    const parsed = storeSchema.safeParse(data)

    if (!parsed.success) {
        return { error: 'Invalid data', details: parsed.error.issues }
    }

    const { name, type } = parsed.data

    // Insert Store
    const { error } = await supabase.from('stores').insert({
        name,
        type,
        tenant_id: targetTenantId,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/stores')
    return { success: 'Store created successfully' }
}
