
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Using ANON key to test RLS visibility? Or service role?
    // Let's use SERVICE ROLE to see the REAL data first.
)

// Actually, I need to check what the USER sees versus what is in DB.
// But I don't have user token here easily. 
// Let's use SERVICE ROLE to verify data integrity first.
const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function checkOrders() {
    console.log('--- Checking Orders (Admin View) ---')
    // Fallback if service role key is missing in .env.local (it usually is for client apps)
    // If missing, this might fail unless I put it there.
    // The user provided ANON_KEY.

    // Attempt with ANON KEY (Guest View / or if I can sign in)
    // But better to just check if I can 'select' with simple query if RLS is open?
    // RLS is on.

    // I can't easily check Admin View without Service Key.
    // I will assume the user has the key or I can ask for it?
    // Usually .env.local has it? No, usually just ANON.

    // Let's try to just use what's available.
    // If I can't check DB, I might just trust the code has tenant_id.

    // Wait, I can print `process.env` keys to see what I have.
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { data, error } = await adminClient
            .from('orders')
            .select('id, created_at, status, tenant_id, ticket_num')
            .order('created_at', { ascending: false })
            .limit(5)

        if (error) console.error('Error:', error)
        else console.table(data)
    } else {
        console.log("No Service Role Key found. Cannot verify DB state directly via script.")
    }
}

checkOrders()
