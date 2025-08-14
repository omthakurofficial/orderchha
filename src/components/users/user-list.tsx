
'use client';

import type { User } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Users } from "lucide-react";
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


interface UserListProps {
    users: User[];
}

export function UserList({ users }: UserListProps) {
    const { currentUser, deleteUser, updateUserRole } = useApp();
    const { toast } = useToast();

    const handleDeleteUser = (userId: string) => {
        deleteUser(userId);
        toast({
            title: "User Deleted",
            description: "The user account has been successfully deleted from the user list. Note: The Auth record may still exist.",
        })
    }
    
    const handleRoleChange = (userId: string, role: 'admin' | 'staff') => {
        updateUserRole(userId, role);
        toast({
            title: "Role Updated",
            description: `The user's role has been changed to ${role}.`,
        })
    }

    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-muted/40 h-64">
                <Users className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold text-muted-foreground">No Users Found</h2>
                <p className="text-muted-foreground">Add a new staff member to see them here.</p>
          </div>
        )
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map(user => (
                        <TableRow key={user.uid}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={user.photoUrl} alt={user.name} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <p className="text-sm">{user.mobile}</p>
                                <p className="text-xs text-muted-foreground">{user.address}</p>
                            </TableCell>
                            <TableCell>{user.designation}</TableCell>
                            <TableCell>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                    {user.role}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={user.uid === currentUser?.uid}>
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleRoleChange(user.uid, user.role === 'admin' ? 'staff' : 'admin')}>
                                            {`Make ${user.role === 'admin' ? 'Staff' : 'Admin'}`}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                    Delete User
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the user's information
                                                    from the user list.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteUser(user.uid)}>
                                                    Continue
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
