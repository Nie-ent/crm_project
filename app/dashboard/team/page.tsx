import { getTeamMembers, removeTeamMember } from './actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddMemberDialog } from './add-member-dialog'

export default async function TeamPage() {
    const members = await getTeamMembers()

    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Team Management</h2>
                    <p className="text-muted-foreground">Manage your staff and their roles.</p>
                </div>

                <AddMemberDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {members.map((member) => (
                    <Card key={member.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {member.full_name || 'Unknown Name'}
                            </CardTitle>
                            <Badge variant={member.role === 'store_admin' ? 'default' : 'secondary'}>
                                {member.role.replace('_', ' ')}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-4 pt-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={member.avatar_url} />
                                    <AvatarFallback>{(member.full_name || member.email || '?')[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1 overflow-hidden">
                                    <p className="text-sm font-medium leading-none truncate">{member.email}</p>
                                    <p className="text-xs text-muted-foreground">Joined {new Date(member.created_at || Date.now()).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <form action={removeTeamMember.bind(null, member.id)}>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remove
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
