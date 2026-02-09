'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const tenantSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric'),
    status: z.enum(['active', 'suspended']).default('active'),
    subscription_plan: z.string().default('free'),
})

export async function createTenant(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const data = Object.fromEntries(formData)
    const parsed = tenantSchema.safeParse(data)

    if (!parsed.success) {
        return { error: 'Invalid input data', details: parsed.error.issues }
    }

    const { name, slug, status, subscription_plan } = parsed.data

    // Check if slug exists
    const { data: existing } = await supabase.from('tenants').select('id').eq('slug', slug).single()
    if (existing) {
        return { error: 'Slug already exists. Please choose another one.' }
    }

    const { error } = await supabase.from('tenants').insert({
        name,
        slug,
        status,
        subscription_plan,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/tenants')
    return { success: 'Tenant created successfully' }
}
