'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUsers() {
    const supabase = await createClient()

    // Check permission
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'super_admin') {
        throw new Error('Unauthorized')
    }

    // Fetch profiles with tenant info, excluding customers
    const { data: users, error } = await supabase
        .from('profiles')
        .select(`
            *,
            tenants (
                id,
                name
            )
        `)
        .neq('role', 'customer')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching users:', error)
        throw new Error('Failed to fetch users')
    }

    return users
}

export async function createUser(formData: FormData) {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // 1. Check permission
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Unauthorized')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single()

    if (profile?.role !== 'super_admin') {
        throw new Error('Unauthorized')
    }

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const role = formData.get('role') as string
    const tenantId = formData.get('tenantId') as string

    if (!email || !password || !fullName || !role) {
        throw new Error('Missing required fields')
    }

    // 2. Create Auth User
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
    })

    if (authError) {
        console.error('Error creating auth user:', authError)
        throw new Error(authError.message)
    }

    if (!authUser.user) throw new Error('Failed to create user')

    // 3. Update Profile (Role & Tenant)
    // Profile is auto-created by trigger usually, but we need to update it with role/tenant
    // We'll wait a brief moment or just upsert to be safe, or update if it exists.
    // Since we used admin.createUser, the trigger might have fired.
    // Let's force update it using adminClient to bypass RLS if needed, though super_admin policy exists.

    const { error: profileError } = await adminClient
        .from('profiles')
        .update({
            role: role as 'super_admin' | 'store_admin' | 'staff',
            tenant_id: tenantId || null,
            full_name: fullName
        })
        .eq('id', authUser.user.id)

    if (profileError) {
        console.error('Error updating profile:', profileError)
        // Cleanup auth user if profile fails? 
        // For now, just throw.
        throw new Error('User created but failed to set profile details')
    }

    revalidatePath('/admin/users')
    return { success: true }
}

export async function updateUser(formData: FormData) {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Check permission
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Unauthorized')

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single()

    if (adminProfile?.role !== 'super_admin') {
        throw new Error('Unauthorized')
    }

    const userId = formData.get('userId') as string
    const role = formData.get('role') as string
    const tenantId = formData.get('tenantId') as string
    const fullName = formData.get('fullName') as string

    // Update Profile
    const { error } = await adminClient
        .from('profiles')
        .update({
            role: role as 'super_admin' | 'store_admin' | 'staff',
            tenant_id: tenantId || null,
            full_name: fullName
        })
        .eq('id', userId)

    if (error) {
        console.error('Error updating user:', error)
        throw new Error('Failed to update user')
    }

    revalidatePath('/admin/users')
    return { success: true }
}

export async function deleteUser(userId: string) {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Check permission
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Unauthorized')

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single()

    if (adminProfile?.role !== 'super_admin') {
        throw new Error('Unauthorized')
    }

    const { error } = await adminClient.auth.admin.deleteUser(userId)

    if (error) {
        console.error('Error deleting user:', error)
        throw new Error('Failed to delete user')
    }

    revalidatePath('/admin/users')
    return { success: true }
}
