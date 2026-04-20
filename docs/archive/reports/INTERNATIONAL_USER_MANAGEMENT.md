# International User Management System

## Overview
OrderChha now supports comprehensive international user management with support for multiple countries, complete staff information, and marketplace-ready features.

## Key Features Implemented

### 🌍 International Support
- **Country Selection**: Nepal (default), India, Bangladesh, Sri Lanka, Bhutan, Pakistan, China, USA, UK, Canada, Australia, and Other
- **Multi-National ID Support**: Flexible document system supporting different countries
  - Nepal: Citizenship Number
  - India: Aadhar Number
  - International: Passport Number
- **Tax ID Support**: 
  - Nepal: VAT Number
  - India: PAN Number
  - Other countries: Tax ID
- **Mobile Number Format**: Updated to show +977 (Nepal) instead of +91 (India)

### 👤 Comprehensive User Information

#### Personal Details
- Full Name, Email, Mobile Number
- Date of Birth, Blood Group
- Emergency Contact
- Complete Address
- Marital Status (Single, Married, Divorced, Widowed)
- Religion
- Nationality and Country
- Languages Spoken

#### Work Information
- Employee ID
- Designation and Department
- System Role (Admin, Staff, Cashier, etc.)
- Monthly Salary
- Joining Date
- Previous Work Experience
- Key Skills

#### Education Details
- Education Level (Primary to Doctorate)
- Institute/University Name
- Graduation Year
- Specialization/Major
- Additional Certifications

#### Banking Information
- Bank Name
- Account Number (masked for security)
- Bank Code/SWIFT Code
- Account Type (Savings, Checking, Current)
- Bank Branch

#### Document Information
- National ID (Citizenship/Aadhar)
- Tax ID (VAT/PAN)
- Passport Number
- Driving License Number
- All sensitive data is masked in profile view

### 🔒 Security Features
- Sensitive information (Account numbers, IDs) are masked in profile display
- Only last 4 digits shown for security
- Photo upload with local preview (ready for cloud integration)

### 🎨 User Interface Enhancements
- Organized form sections with clear headings
- Country selection with flag emojis
- Dropdown selections for structured data
- Responsive grid layout
- Enhanced profile page with comprehensive information display
- Conditional sections (only show if data exists)

## File Structure

### Type Definitions
- `src/types/index.ts` - Enhanced User and UserFormData interfaces

### Components
- `src/components/users/add-staff-form.tsx` - Comprehensive user creation form
- `src/components/profile/edit-profile-dialog.tsx` - Profile editing interface
- `src/app/profile/page.tsx` - Enhanced profile display page

### Context
- `src/context/app-context.tsx` - Updated to handle all new user fields

## Marketplace Ready Features

### Multi-Country Support
✅ Support for South Asian countries (Nepal, India, Bangladesh, etc.)
✅ International country options for global expansion
✅ Flexible document ID system for different countries
✅ Currency display (NPR for Nepal, adaptable for other countries)

### Comprehensive Staff Management
✅ Complete employee information collection
✅ Education and experience tracking
✅ Banking information for payroll
✅ Document management for compliance
✅ Multi-language support tracking

### Data Security
✅ Sensitive information masking
✅ Secure data handling
✅ Privacy-compliant information display

## Usage Instructions

### Creating New Staff
1. Navigate to Users page
2. Click "Add Staff User"
3. Fill out comprehensive form with sections:
   - Staff Photo
   - Personal Information
   - Location & Nationality (select Nepal or other countries)
   - Work Information
   - Education Details
   - Experience & Skills
   - Bank Information
   - Document Information
   - Additional Notes

### Viewing Profile
1. Click on avatar in top navigation
2. View comprehensive profile with all sections
3. Edit profile to update information

### Country-Specific Features
- **Nepal**: Citizenship Number, VAT Number, NPR currency
- **India**: Aadhar Number, PAN Number, INR currency
- **Other Countries**: Flexible ID system, international passport

## Future Cloud Integration Ready
- Photo upload system ready for AWS S3/Cloudinary integration
- Comprehensive data structure ready for database storage
- API endpoints prepared for real user management
- International compliance features implemented

## Benefits for Marketplace
1. **Global Scalability**: Support for multiple countries from day one
2. **Compliance Ready**: Document management for different countries
3. **Professional Management**: Complete staff information tracking
4. **Security First**: Sensitive data protection built-in
5. **User Experience**: Intuitive forms and comprehensive profiles

This system positions OrderChha as a professional, international-ready restaurant management solution suitable for marketplace distribution.
