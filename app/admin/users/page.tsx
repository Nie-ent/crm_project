import { getUsers } from './actions'
import UsersTable from './users-table'
import { createClient } from '@/utils/supabase/server'

export default async function AdminUsersPage() {
    const supabase = await createClient()

    // Fetch tenants for the dropdowns
    const { data: tenants } = await supabase
        .from('tenants')
        .select('id, name')
        .order('name')

    // Fetch users (server action does the filtering and permission check)
    const users = await getUsers()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">
                    Manage administrators and staff members across all tenants.
                </p>
            </div>

            <UsersTable users={users || []} tenants={tenants || []} />
        </div>
    )
}
