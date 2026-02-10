'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAdminProfile(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const fullName = formData.get('fullName') as string

    if (!fullName) throw new Error('Full name is required')

    const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)

    if (error) {
        throw new Error('Failed to update profile')
    }

    revalidatePath('/admin/settings')
    return { success: true }
}

export async function resetAdminPassword() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) throw new Error('Unauthorized')

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?next=/admin/settings`,
    })

    if (error) {
        throw new Error(error.message)
    }

    return { success: true }
}
