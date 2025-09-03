'use client';

import type { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, Users, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useApp } from "@/context/app-context";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ResponsiveUserListProps {
    users: User[];
}

export function ResponsiveUserList({ users }: ResponsiveUserListProps) {
    const { currentUser, deleteUser, updateUserRole } = useApp();
    const { toast } = useToast();

    const handleDeleteUser = (userId: string) => {
        deleteUser(userId);
        toast({
            title: "User Deleted",
            description: "The user account has been successfully deleted.",
        })
    }
    
    const handleRoleChange = (userId: string, role: 'admin' | 'staff') => {
        updateUserRole(userId, role);
        toast({
            title: "Role Updated",
            description: `The user's role has been changed to ${role}.`,
        })
    }

    if (!users || users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-muted/40 h-64">
                <Users className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold text-muted-foreground">No Users Found</h2>
                <p className="text-muted-foreground">Add a new staff member to see them here.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {users.map(user => (
                <Card key={user.uid} className="overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 flex-1">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={user.photoUrl} alt={user.name} />
                                    <AvatarFallback className="text-lg font-semibold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-base truncate">{user.name}</h3>
                                    <p className="text-sm text-muted-foreground truncate">{user.designation}</p>
                                    <Badge 
                                        variant={user.role === 'admin' ? 'default' : 'secondary'} 
                                        className="text-xs mt-1 capitalize"
                                    >
                                        {user.role}
                                    </Badge>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        className="h-8 w-8 p-0" 
                                        disabled={user.uid === currentUser?.uid}
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleRoleChange(user.uid, user.role === 'admin' ? 'staff' : 'admin')}>
                                        Change to {user.role === 'admin' ? 'Staff' : 'Admin'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                                Delete User
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="mx-4">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete {user.name}'s account.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction 
                                                    onClick={() => handleDeleteUser(user.uid)}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            {user.mobile && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="h-4 w-4 flex-shrink-0" />
                                    <span>{user.mobile}</span>
                                </div>
                            )}
                            {user.address && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-xs leading-relaxed">{user.address}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                <span className="text-xs">
                                    Joined {user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
