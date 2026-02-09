'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { ImagePlus, Loader2, X } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const supabase = createClient()

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            const file = e.target.files?.[0]

            if (!file) return

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('menu-images')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage
                .from('menu-images')
                .getPublicUrl(filePath)

            onChange(data.publicUrl)
            toast.success('Image uploaded')
        } catch (error) {
            toast.error('Error uploading image')
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

    if (value) {
        return (
            <div className="relative w-40 h-40 rounded-lg overflow-hidden border">
                <div className="absolute top-2 right-2 z-10">
                    <Button
                        type="button"
                        onClick={() => onChange('')}
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <Image
                    fill
                    src={value}
                    alt="Menu Item"
                    className="object-cover"
                />
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                        <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                        {uploading ? 'Uploading...' : 'Upload Image'}
                    </p>
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={onUpload}
                    disabled={disabled || uploading}
                />
            </label>
        </div>
    )
}
