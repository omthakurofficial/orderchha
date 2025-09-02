'use client';

import { useApp } from '@/context/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Mail, MapPin, Phone, Settings, User, UserCheck, Globe, GraduationCap, CreditCard, FileText } from 'lucide-react';
import { useState } from 'react';
import { EditProfileDialog } from '@/components/profile/edit-profile-dialog';

export default function ProfilePage() {
  const { currentUser, isLoaded } = useApp();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
              <User />
              My Profile
            </h1>
            <p className="text-muted-foreground">View and manage your account information</p>
          </div>
          <Button onClick={() => setEditDialogOpen(true)}>
            <Settings />
            Edit Profile
          </Button>
        </div>
      </header>
      
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={currentUser.photoUrl} alt={currentUser.name} />
                  <AvatarFallback className="text-xl">{currentUser.name?.charAt(0) ?? 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl font-headline">{currentUser.name}</CardTitle>
                  <CardDescription className="text-lg">{currentUser.designation || currentUser.role}</CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={currentUser.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                      {currentUser.role}
                    </Badge>
                    <UserCheck className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Active</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">{currentUser.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Mobile</p>
                    <p className="text-muted-foreground">{currentUser.mobile || 'Not provided'}</p>
                  </div>
                </div>
                {currentUser.emergencyContact && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Emergency Contact</p>
                      <p className="text-muted-foreground">{currentUser.emergencyContact}</p>
                    </div>
                  </div>
                )}
              </div>
              {currentUser.address && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-muted-foreground">{currentUser.address}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Location & Personal Details */}
          {(currentUser.country || currentUser.nationality || currentUser.dateOfBirth || currentUser.bloodGroup || currentUser.maritalStatus) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe />
                  Personal & Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentUser.country && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Country</p>
                      <p className="text-lg">{currentUser.country}</p>
                    </div>
                  )}
                  {currentUser.nationality && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Nationality</p>
                      <p className="text-lg">{currentUser.nationality}</p>
                    </div>
                  )}
                  {currentUser.dateOfBirth && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Date of Birth</p>
                      <p className="text-lg">{new Date(currentUser.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                  )}
                  {currentUser.bloodGroup && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Blood Group</p>
                      <p className="text-lg">{currentUser.bloodGroup}</p>
                    </div>
                  )}
                  {currentUser.maritalStatus && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Marital Status</p>
                      <p className="text-lg capitalize">{currentUser.maritalStatus}</p>
                    </div>
                  )}
                  {currentUser.languagesSpoken && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Languages</p>
                      <p className="text-lg">{currentUser.languagesSpoken}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education & Experience */}
          {(currentUser.highestEducation || currentUser.instituteName || currentUser.previousExperience || currentUser.skills) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap />
                  Education & Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentUser.highestEducation && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Education Level</p>
                      <p className="text-lg capitalize">{currentUser.highestEducation.replace('_', ' ')}</p>
                    </div>
                  )}
                  {currentUser.instituteName && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Institute</p>
                      <p className="text-lg">{currentUser.instituteName}</p>
                    </div>
                  )}
                  {currentUser.specialization && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Specialization</p>
                      <p className="text-lg">{currentUser.specialization}</p>
                    </div>
                  )}
                  {currentUser.graduationYear && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Graduation Year</p>
                      <p className="text-lg">{currentUser.graduationYear}</p>
                    </div>
                  )}
                </div>
                {currentUser.previousExperience && (
                  <>
                    <Separator />
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Previous Experience</p>
                      <p className="text-muted-foreground">{currentUser.previousExperience}</p>
                    </div>
                  </>
                )}
                {currentUser.skills && (
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Skills</p>
                    <p className="text-muted-foreground">{currentUser.skills}</p>
                  </div>
                )}
                {currentUser.additionalCertifications && (
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Certifications</p>
                    <p className="text-muted-foreground">{currentUser.additionalCertifications}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Bank Information */}
          {(currentUser.bankName || currentUser.accountNumber) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard />
                  Bank Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentUser.bankName && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Bank Name</p>
                      <p className="text-lg">{currentUser.bankName}</p>
                    </div>
                  )}
                  {currentUser.accountType && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Account Type</p>
                      <p className="text-lg capitalize">{currentUser.accountType}</p>
                    </div>
                  )}
                  {currentUser.accountNumber && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Account Number</p>
                      <p className="text-lg font-mono">****{currentUser.accountNumber.slice(-4)}</p>
                    </div>
                  )}
                  {currentUser.bankBranch && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Branch</p>
                      <p className="text-lg">{currentUser.bankBranch}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Document Information */}
          {(currentUser.nationalId || currentUser.taxId || currentUser.passportNumber || currentUser.drivingLicense) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText />
                  Document Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentUser.nationalId && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">National ID</p>
                      <p className="text-lg font-mono">****{currentUser.nationalId.slice(-4)}</p>
                    </div>
                  )}
                  {currentUser.taxId && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Tax ID</p>
                      <p className="text-lg font-mono">****{currentUser.taxId.slice(-4)}</p>
                    </div>
                  )}
                  {currentUser.passportNumber && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Passport</p>
                      <p className="text-lg font-mono">****{currentUser.passportNumber.slice(-4)}</p>
                    </div>
                  )}
                  {currentUser.drivingLicense && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Driving License</p>
                      <p className="text-lg font-mono">****{currentUser.drivingLicense.slice(-4)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Work Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck />
                Work Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Role</p>
                  <p className="text-lg capitalize">{currentUser.role}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Designation</p>
                  <p className="text-lg">{currentUser.designation || 'Not specified'}</p>
                </div>
                {currentUser.employeeId && (
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Employee ID</p>
                    <p className="text-lg font-mono">{currentUser.employeeId}</p>
                  </div>
                )}
                {currentUser.department && (
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Department</p>
                    <p className="text-lg">{currentUser.department}</p>
                  </div>
                )}
                {currentUser.salary && (
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Monthly Salary</p>
                    <p className="text-lg">NPR {currentUser.salary.toLocaleString()}</p>
                  </div>
                )}
              </div>
              {currentUser.joiningDate && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Joining Date</p>
                      <p className="text-muted-foreground">
                        {new Date(currentUser.joiningDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Account Information (Admin Only) */}
          {currentUser.role === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings />
                  Account Privileges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>User Management</span>
                    <Badge variant="default">Full Access</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Settings Configuration</span>
                    <Badge variant="default">Full Access</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Financial Reports</span>
                    <Badge variant="default">Full Access</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Kitchen Operations</span>
                    <Badge variant="default">Full Access</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Edit Profile Dialog */}
      <EditProfileDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen}
        user={currentUser}
      />
    </div>
  );
}
