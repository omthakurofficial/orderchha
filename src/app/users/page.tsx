
'use client';

import { AddStaffForm } from "@/components/users/add-staff-form";
import { UserList } from "@/components/users/user-list";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useApp } from "@/context/app-context";
import { PlusCircle, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function UsersPage() {
    const { users, addUser, currentUser } = useApp();
    const [dialogOpen, setDialogOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (currentUser?.role !== 'admin') {
            router.push('/');
        }
    }, [currentUser, router]);

    if (currentUser?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-full">
                <p>You do not have permission to view this page.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
                        <Users />
                        User Management
                    </h1>
                    <p className="text-muted-foreground">Add, view, and manage staff accounts.</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle />
                            Add New Staff
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Staff Member</DialogTitle>
                            <DialogDescription>
                                Fill in the details below to create a new staff account. They will be able to log in with the email and password you provide.
                            </DialogDescription>
                        </DialogHeader>
                        <AddStaffForm 
                            onFormSubmit={addUser} 
                            onSuccess={() => setDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-auto">
                <UserList users={users} />
            </main>
        </div>
    );
}
