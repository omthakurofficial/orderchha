
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import Image from 'next/image';
import type { UserFormData, UserRole } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const staffFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(['admin', 'staff', 'cashier', 'accountant', 'waiter', 'kitchen'], { required_error: "Please select a role."}),
  mobile: z.string().min(10, { message: "Please enter a valid mobile number." }),
  address: z.string().min(5, { message: "Please enter a complete address." }),
  designation: z.string().min(2, { message: "Please enter designation." }),
  emergencyContact: z.string().min(10, { message: "Please enter emergency contact number." }),
  employeeId: z.string().optional(),
  department: z.string().optional(),
  salary: z.number().min(0, { message: "Salary must be a positive number." }).optional(),
  dateOfBirth: z.string().optional(),
  bloodGroup: z.string().optional(),
  
  // International & Location
  country: z.string().optional(),
  nationality: z.string().optional(),
  
  // Document Information (flexible for different countries)
  nationalId: z.string().optional(),
  taxId: z.string().optional(),
  passportNumber: z.string().optional(),
  drivingLicense: z.string().optional(),
  
  // Bank Information
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  accountType: z.enum(['savings', 'checking', 'current']).optional(),
  bankBranch: z.string().optional(),
  
  // Education Details
  highestEducation: z.enum(['primary', 'secondary', 'higher_secondary', 'bachelor', 'master', 'doctorate', 'diploma', 'certificate']).optional(),
  instituteName: z.string().optional(),
  graduationYear: z.string().optional(),
  specialization: z.string().optional(),
  additionalCertifications: z.string().optional(),
  
  // Experience & Skills
  previousExperience: z.string().optional(),
  skills: z.string().optional(),
  languagesSpoken: z.string().optional(),
  
  // Additional Information
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  religion: z.string().optional(),
  notes: z.string().optional(),
  
  photo: z.any().optional(),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

interface AddStaffFormProps {
    onFormSubmit: (data: UserFormData, photoFile: File | null) => Promise<void>;
    onSuccess: () => void;
}

export function AddStaffForm({ onFormSubmit, onSuccess }: AddStaffFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const { toast } = useToast();

    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffFormSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            role: 'staff',
            mobile: '',
            address: '',
            designation: '',
            emergencyContact: '',
            employeeId: '',
            department: '',
            salary: 0,
            dateOfBirth: '',
            bloodGroup: '',
            country: 'Nepal',
            nationality: '',
            nationalId: '',
            taxId: '',
            passportNumber: '',
            drivingLicense: '',
            bankName: '',
            accountNumber: '',
            routingNumber: '',
            accountType: 'savings',
            bankBranch: '',
            highestEducation: 'secondary',
            instituteName: '',
            graduationYear: '',
            specialization: '',
            additionalCertifications: '',
            previousExperience: '',
            skills: '',
            languagesSpoken: '',
            maritalStatus: 'single',
            religion: '',
            notes: '',
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
          setPreview(null);
          setPhotoFile(null);
        }
    };

    const onSubmit: SubmitHandler<StaffFormValues> = async (data) => {
        setIsSubmitting(true);
        try {
            const formData: UserFormData = {
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                mobile: data.mobile,
                address: data.address,
                designation: data.designation,
                emergencyContact: data.emergencyContact,
                employeeId: data.employeeId,
                department: data.department,
                salary: data.salary,
                dateOfBirth: data.dateOfBirth,
                bloodGroup: data.bloodGroup,
                country: data.country,
                nationality: data.nationality,
                nationalId: data.nationalId,
                taxId: data.taxId,
                passportNumber: data.passportNumber,
                drivingLicense: data.drivingLicense,
                bankName: data.bankName,
                accountNumber: data.accountNumber,
                routingNumber: data.routingNumber,
                accountType: data.accountType,
                bankBranch: data.bankBranch,
                highestEducation: data.highestEducation,
                instituteName: data.instituteName,
                graduationYear: data.graduationYear,
                specialization: data.specialization,
                additionalCertifications: data.additionalCertifications,
                previousExperience: data.previousExperience,
                skills: data.skills,
                languagesSpoken: data.languagesSpoken,
                maritalStatus: data.maritalStatus,
                religion: data.religion,
                notes: data.notes,
                joiningDate: new Date().toISOString(),
            };
            await onFormSubmit(formData, photoFile);
            toast({
                title: 'User Added Successfully',
                description: `${data.name} has been added to the system with all details.`,
            });
            onSuccess();
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error Adding User',
                description: 'Could not add the user. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                {/* User Photo Section */}
                <div className="flex flex-col items-center space-y-4 p-4 border rounded-lg bg-muted/20">
                    <FormField control={form.control} name="photo" render={() => (
                        <FormItem className="text-center">
                            <FormLabel>Staff Photo *</FormLabel>
                            <FormControl>
                                <div className="space-y-4">
                                    {preview && (
                                        <div className="flex justify-center">
                                            <Image src={preview} alt="Staff photo preview" width={120} height={120} className="rounded-full object-cover border-4 border-primary/20" />
                                        </div>
                                    )}
                                    <Input type="file" accept="image/*" onChange={handleFileChange} disabled={isSubmitting} />
                                    <p className="text-xs text-muted-foreground">Upload a clear photo (Required for ID card)</p>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                {/* Personal Information */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold text-primary">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input placeholder="Enter full name" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                             <FormItem><FormLabel>Email Address *</FormLabel><FormControl><Input placeholder="user@orderchha.cafe" type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="mobile" render={({ field }) => (
                            <FormItem><FormLabel>Mobile Number *</FormLabel><FormControl><Input placeholder="+977 9876543210" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="emergencyContact" render={({ field }) => (
                            <FormItem><FormLabel>Emergency Contact *</FormLabel><FormControl><Input placeholder="Emergency contact number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                            <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input placeholder="YYYY-MM-DD" type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                            <FormItem><FormLabel>Blood Group</FormLabel><FormControl><Input placeholder="e.g., A+, B-, O+" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
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
                        <FormField control={form.control} name="religion" render={({ field }) => (
                            <FormItem><FormLabel>Religion</FormLabel><FormControl><Input placeholder="e.g., Hindu, Buddhist, Christian" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="md:col-span-2">
                            <FormField control={form.control} name="address" render={({ field }) => (
                               <FormItem><FormLabel>Complete Address *</FormLabel><FormControl><Input placeholder="Enter complete residential address" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
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
                                <FormLabel>Country *</FormLabel>
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
                        <FormField control={form.control} name="nationality" render={({ field }) => (
                            <FormItem><FormLabel>Nationality</FormLabel><FormControl><Input placeholder="e.g., Nepali, Indian" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="languagesSpoken" render={({ field }) => (
                            <FormItem><FormLabel>Languages Spoken</FormLabel><FormControl><Input placeholder="e.g., Nepali, Hindi, English" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>

                {/* Work Information */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold text-primary">Work Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="employeeId" render={({ field }) => (
                            <FormItem><FormLabel>Employee ID</FormLabel><FormControl><Input placeholder="e.g., EMP001" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="designation" render={({ field }) => (
                             <FormItem><FormLabel>Designation *</FormLabel><FormControl><Input placeholder="e.g., Senior Waiter, Head Chef" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="department" render={({ field }) => (
                            <FormItem><FormLabel>Department</FormLabel><FormControl><Input placeholder="e.g., Kitchen, Service, Management" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>System Role *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select system role" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin (Full Access)</SelectItem>
                                        <SelectItem value="cashier">Cashier (Billing)</SelectItem>
                                        <SelectItem value="accountant">Accountant (Finance)</SelectItem>
                                        <SelectItem value="waiter">Waiter (Service)</SelectItem>
                                        <SelectItem value="kitchen">Kitchen Staff</SelectItem>
                                        <SelectItem value="staff">General Staff</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField control={form.control} name="salary" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Monthly Salary (₹)</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="25000" 
                                        type="number" 
                                        {...field} 
                                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>

                {/* Authentication */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold text-primary">Authentication</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem><FormLabel>Login Password *</FormLabel><FormControl><Input type="password" placeholder="Minimum 6 characters" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>

                {/* Education Details */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold text-primary">Education Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="highestEducation"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Highest Education</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select education level" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="primary">Primary School</SelectItem>
                                        <SelectItem value="secondary">Secondary (Class 10)</SelectItem>
                                        <SelectItem value="higher_secondary">Higher Secondary (+2)</SelectItem>
                                        <SelectItem value="diploma">Diploma</SelectItem>
                                        <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                                        <SelectItem value="master">Master's Degree</SelectItem>
                                        <SelectItem value="doctorate">Doctorate/PhD</SelectItem>
                                        <SelectItem value="certificate">Professional Certificate</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField control={form.control} name="instituteName" render={({ field }) => (
                            <FormItem><FormLabel>Institute/University Name</FormLabel><FormControl><Input placeholder="e.g., Tribhuvan University" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="graduationYear" render={({ field }) => (
                            <FormItem><FormLabel>Graduation Year</FormLabel><FormControl><Input placeholder="e.g., 2020" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="specialization" render={({ field }) => (
                            <FormItem><FormLabel>Specialization/Major</FormLabel><FormControl><Input placeholder="e.g., Hotel Management, Business" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="md:col-span-2">
                            <FormField control={form.control} name="additionalCertifications" render={({ field }) => (
                                <FormItem><FormLabel>Additional Certifications</FormLabel><FormControl><Input placeholder="e.g., Food Safety Certificate, First Aid" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    </div>
                </div>

                {/* Experience & Skills */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold text-primary">Experience & Skills</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <FormField control={form.control} name="previousExperience" render={({ field }) => (
                            <FormItem><FormLabel>Previous Work Experience</FormLabel><FormControl><Input placeholder="Brief description of previous roles and experience" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="skills" render={({ field }) => (
                            <FormItem><FormLabel>Key Skills</FormLabel><FormControl><Input placeholder="e.g., Customer service, Cooking, Cash handling" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>

                {/* Bank Information */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold text-primary">Bank Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="bankName" render={({ field }) => (
                            <FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input placeholder="e.g., Nepal Investment Bank, SBI" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="accountNumber" render={({ field }) => (
                            <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input placeholder="Enter bank account number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="routingNumber" render={({ field }) => (
                            <FormItem><FormLabel>Bank Code/SWIFT</FormLabel><FormControl><Input placeholder="Bank routing/SWIFT code" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField
                            control={form.control}
                            name="accountType"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Account Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select account type" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="savings">Savings Account</SelectItem>
                                        <SelectItem value="checking">Checking Account</SelectItem>
                                        <SelectItem value="current">Current Account</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField control={form.control} name="bankBranch" render={({ field }) => (
                            <FormItem><FormLabel>Bank Branch</FormLabel><FormControl><Input placeholder="Branch name/location" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>

                {/* Document Information */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold text-primary">Document Information (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="nationalId" render={({ field }) => (
                            <FormItem><FormLabel>National ID</FormLabel><FormControl><Input placeholder="Citizenship No. / Aadhar No." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="taxId" render={({ field }) => (
                            <FormItem><FormLabel>Tax ID</FormLabel><FormControl><Input placeholder="PAN No. / VAT No." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="passportNumber" render={({ field }) => (
                            <FormItem><FormLabel>Passport Number</FormLabel><FormControl><Input placeholder="International passport number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="drivingLicense" render={({ field }) => (
                            <FormItem><FormLabel>Driving License</FormLabel><FormControl><Input placeholder="Driving license number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold text-primary">Additional Information</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <FormField control={form.control} name="notes" render={({ field }) => (
                            <FormItem><FormLabel>Additional Notes</FormLabel><FormControl><Input placeholder="Any additional information or special requirements" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>

                <div className="flex justify-end pt-4 sticky bottom-0 bg-background border-t">
                    <Button type="submit" disabled={isSubmitting} className="min-w-32">
                        {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Save />}
                        {isSubmitting ? 'Creating...' : 'Create User'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
