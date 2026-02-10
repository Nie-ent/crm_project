import { createClient } from '@/utils/supabase/server'
import { AdminProfileForm } from './admin-profile-form'
import { SystemInfoCard } from './system-info-card'
import { redirect } from 'next/navigation'

export default async function AdminSettingsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account and view system configuration.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <AdminProfileForm
                    user={{
                        id: user.id,
                        email: user.email!,
                        full_name: profile?.full_name || ''
                    }}
                />

                <div className="space-y-6">
                    <SystemInfoCard />

                    {/* Placeholder for future Platform config */}
                    {/* <PlatformSettingsCard /> */}
                </div>
            </div>
        </div>
    )
}
