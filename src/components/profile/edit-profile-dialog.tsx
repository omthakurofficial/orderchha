'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoaderCircle, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/context/app-context';
import type { User } from '@/types';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  mobile: z.string().optional(),
  address: z.string().optional(),
  designation: z.string().optional(),
  emergencyContact: z.string().optional(),
  dateOfBirth: z.string().optional(),
  bloodGroup: z.string().optional(),
  country: z.string().optional(),
  nationality: z.string().optional(),
  languagesSpoken: z.string().optional(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  religion: z.string().optional(),
  
  // Work Information
  employeeId: z.string().optional(),
  department: z.string().optional(),
  
  // Education
  highestEducation: z.enum(['primary', 'secondary', 'higher_secondary', 'bachelor', 'master', 'doctorate', 'diploma', 'certificate']).optional(),
  instituteName: z.string().optional(),
  graduationYear: z.string().optional(),
  specialization: z.string().optional(),
  additionalCertifications: z.string().optional(),
  
  // Experience & Skills
  previousExperience: z.string().optional(),
  skills: z.string().optional(),
  
  // Bank Information
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  accountType: z.enum(['savings', 'checking', 'current']).optional(),
  bankBranch: z.string().optional(),
  
  // Document Information
  nationalId: z.string().optional(),
  taxId: z.string().optional(),
  passportNumber: z.string().optional(),
  drivingLicense: z.string().optional(),
  
  notes: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function EditProfileDialog({ open, onOpenChange, user }: EditProfileDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(user.photoUrl || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { updateUserProfile } = useApp();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || '',
      mobile: user.mobile || '',
      address: user.address || '',
      designation: user.designation || '',
      emergencyContact: user.emergencyContact || '',
      dateOfBirth: user.dateOfBirth || '',
      bloodGroup: user.bloodGroup || '',
      country: user.country || 'Nepal',
      nationality: user.nationality || '',
      languagesSpoken: user.languagesSpoken || '',
      maritalStatus: user.maritalStatus || 'single',
      religion: user.religion || '',
      employeeId: user.employeeId || '',
      department: user.department || '',
      highestEducation: user.highestEducation || 'secondary',
      instituteName: user.instituteName || '',
      graduationYear: user.graduationYear || '',
      specialization: user.specialization || '',
      additionalCertifications: user.additionalCertifications || '',
      previousExperience: user.previousExperience || '',
      skills: user.skills || '',
      bankName: user.bankName || '',
      accountNumber: user.accountNumber || '',
      routingNumber: user.routingNumber || '',
      accountType: user.accountType || 'savings',
      bankBranch: user.bankBranch || '',
      nationalId: user.nationalId || '',
      taxId: user.taxId || '',
      passportNumber: user.passportNumber || '',
      drivingLicense: user.drivingLicense || '',
      notes: user.notes || '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setPhotoFile(file);
    } else {
      setPreview(user.photoUrl || null);
      setPhotoFile(null);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const updatedData = {
        ...data,
        uid: user.uid,
        email: user.email || undefined, // Convert null to undefined
        role: user.role,
        joiningDate: user.joiningDate,
      };
      
      await updateUserProfile(updatedData, photoFile);
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Updating Profile',
        description: 'Could not update your profile. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your comprehensive profile information including personal, work, education, and banking details.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center space-y-4 p-4 border rounded-lg bg-muted/20">
              <Avatar className="h-24 w-24">
                <AvatarImage src={preview || undefined} alt={user.name} />
                <AvatarFallback className="text-2xl">{user.name?.charAt(0) ?? 'U'}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <label htmlFor="photo-upload" className="block">
                  <Button type="button" variant="outline" className="cursor-pointer" asChild>
                    <span>Change Photo</span>
                  </Button>
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Upload a new profile photo
                </p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold text-primary">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+977 9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact</FormLabel>
                      <FormControl>
                        <Input placeholder="Emergency contact number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Group</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., A+, B-, O+" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marital Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select marital status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="divorced">Divorced</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="religion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Religion</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Hindu, Buddhist, Christian" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your complete address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Location & Nationality */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold text-primary">Location & Nationality</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Nepal">🇳🇵 Nepal</SelectItem>
                          <SelectItem value="India">🇮🇳 India</SelectItem>
                          <SelectItem value="Bangladesh">🇧🇩 Bangladesh</SelectItem>
                          <SelectItem value="Sri Lanka">🇱🇰 Sri Lanka</SelectItem>
                          <SelectItem value="Bhutan">🇧🇹 Bhutan</SelectItem>
                          <SelectItem value="Pakistan">🇵🇰 Pakistan</SelectItem>
                          <SelectItem value="China">🇨🇳 China</SelectItem>
                          <SelectItem value="USA">🇺🇸 United States</SelectItem>
                          <SelectItem value="UK">🇬🇧 United Kingdom</SelectItem>
                          <SelectItem value="Canada">🇨🇦 Canada</SelectItem>
                          <SelectItem value="Australia">🇦🇺 Australia</SelectItem>
                          <SelectItem value="Other">🌍 Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Nepali, Indian" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="languagesSpoken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Languages Spoken</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Nepali, Hindi, English" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Work Information */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold text-primary">Work Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Manager, Head Chef" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., EMP001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Kitchen, Service, Management" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Experience & Skills */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold text-primary">Experience & Skills</h3>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="previousExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Experience</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of previous work experience" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Skills</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Customer service, Cooking, Cash handling" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Read-only fields */}
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email (Read-only)</label>
                <p className="text-sm p-2 bg-muted rounded">{user.email || 'Not provided'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Role (Read-only)</label>
                <p className="text-sm p-2 bg-muted rounded capitalize">{user.role}</p>
              </div>
              {user.joiningDate && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Joining Date (Read-only)</label>
                  <p className="text-sm p-2 bg-muted rounded">
                    {new Date(user.joiningDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 sticky bottom-0 bg-background border-t">
              <Button type="submit" disabled={isSubmitting} className="min-w-32">
                {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Save />}
                {isSubmitting ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
