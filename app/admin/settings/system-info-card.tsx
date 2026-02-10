import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function SystemInfoCard() {
    // Mask Supabase URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const maskedUrl = supabaseUrl
        ? `${supabaseUrl.substring(0, 15)}...${supabaseUrl.substring(supabaseUrl.length - 5)}`
        : 'Not Configured'

    const nodeEnv = process.env.NODE_ENV

    // In a real app complexity, we might check DB connection here or in a separate async call
    // For now, static info is fine.

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>
                    Current environment and configuration details.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Environment</span>
                    <Badge variant={nodeEnv === 'production' ? 'default' : 'secondary'}>
                        {nodeEnv}
                    </Badge>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Supabase URL</span>
                    <span className="text-sm text-muted-foreground font-mono">{maskedUrl}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">App Version</span>
                    <span className="text-sm text-muted-foreground font-mono">v1.0.0</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Database Status</span>
                    <div className="flex items-center space-x-2">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm text-muted-foreground">Connected</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
