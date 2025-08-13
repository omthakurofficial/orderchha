
'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/context/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole } from '@/types';
import { collection, getDocs, doc, updateDoc, setDoc, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users as UsersIcon, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AddStaffDialog } from '@/components/users/add-staff-dialog';
import { Button } from '@/components/ui/button';

export default function UserManagementPage() {
  const { currentUser } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // This page is for admins only.
    if (currentUser?.role !== 'admin') {
      router.push('/');
      return;
    }

    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersList = querySnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as User[];
      setUsers(usersList);
    }, (error) => {
        console.error("Error fetching users: ", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch user data.',
        });
    });

    return () => unsubscribe();
  }, [currentUser, router, toast]);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, { role: newRole });
      
      toast({
        title: 'Success',
        description: 'User role has been updated.',
      });

    } catch (error) {
       console.error("Error updating role: ", error);
       toast({
         variant: 'destructive',
         title: 'Error',
         description: 'Failed to update user role.',
       });
    }
  };
  
  if (currentUser?.role !== 'admin') {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Redirecting...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
                <UsersIcon />
                User Management
            </h1>
            <p className="text-muted-foreground">Add new staff and manage user roles for your application.</p>
        </div>
        <AddStaffDialog />
      </header>
      <main className="flex-1 p-4 md:p-6 overflow-auto bg-muted/20">
        <Card>
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
            <CardDescription>
              Assign roles to users. The 'admin' role has full access, while 'staff' has limited access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="hidden lg:table-cell">Designation</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image src={user.photoUrl || 'https://placehold.co/40x40.png'} alt={user.name} width={40} height={40} className="rounded-full" />
                        <div className="font-medium">
                          <p>{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        <div>
                            <p>{user.mobile}</p>
                            <p className="text-sm text-muted-foreground">{user.address}</p>
                        </div>
                    </TableCell>
                     <TableCell className="hidden lg:table-cell">{user.designation}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(newRole: UserRole) => handleRoleChange(user.uid, newRole)}
                        disabled={user.email === 'admin@orderchha.com'}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
