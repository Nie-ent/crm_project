
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function checkUser(email: string) {
    console.log(`Checking for user: ${email}`)

    // 1. Try Secure RPC (if available)
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_profile_by_email', { email_input: email })
    if (rpcData && rpcData.length > 0) {
        console.log('✅ FOUND via RPC:', rpcData)
        return
    } else {
        console.log('❌ Not found via RPC (Error or Empty):', rpcError?.message || 'Empty')
    }

    // 2. Try Public Profile Select
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)

    if (profileData && profileData.length > 0) {
        console.log('✅ FOUND via Standard Select:', profileData)
    } else {
        console.log('❌ Not found via Standard Select:', profileError?.message || 'Empty')
        console.log('   (This is expected if RLS is on and you are anonymous)')
    }
}

const emailToCheck = process.argv[2] || 'napatns1999@gmail.com'
checkUser(emailToCheck)
