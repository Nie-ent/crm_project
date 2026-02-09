'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const data = Object.fromEntries(formData)
    const parsed = authSchema.safeParse(data)

    if (!parsed.success) {
        return { error: 'Invalid input data' }
    }

    const { email, password } = parsed.data

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function signup(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const data = Object.fromEntries(formData)
    const parsed = authSchema.safeParse(data)

    if (!parsed.success) {
        return { error: 'Invalid input data' }
    }

    const { email, password } = parsed.data

    const { error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: 'Check your email to confirm your account' }
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
