
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function promoteUser(email: string) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is missing from .env.local')
        console.error('You must add the Service Role Key to run administrative tasks.')
        return
    }

    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Find the user ID from email first (using Admin API)
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers()

    // Simple find
    const user = users?.find(u => u.email === email)

    if (!user) {
        console.error(`User ${email} not found in Auth.`)
        return
    }

    console.log(`Promoting ${email} (${user.id}) to store_admin...`)

    const { error } = await adminClient
        .from('profiles')
        .update({ role: 'store_admin' })
        .eq('id', user.id)

    if (error) {
        console.error('Update failed:', error.message)
    } else {
        console.log('✅ Success! User is now a Store Admin.')
    }
}

const email = process.argv[2]
if (!email) {
    console.log("Usage: npx tsx scripts/promote-admin.ts <email>")
} else {
    promoteUser(email)
}
