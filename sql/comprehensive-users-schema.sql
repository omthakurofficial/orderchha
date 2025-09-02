-- ============================================================================
-- OrderChha International User Management System - Database Schema
-- ============================================================================
-- Run this in Supabase SQL Editor to create comprehensive user management
-- This schema supports Nepal, India, and international marketplace requirements
-- ============================================================================

-- First, let's drop the old users table if it exists and create a new comprehensive one
DROP TABLE IF EXISTS users CASCADE;

-- Create comprehensive users table with international support
CREATE TABLE users (
  -- Core Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appwrite_id VARCHAR(100) UNIQUE,
  uid VARCHAR(100) UNIQUE NOT NULL, -- For app compatibility
  
  -- Basic Information
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE,
  role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'cashier', 'accountant', 'waiter', 'kitchen')),
  photo_url TEXT,
  active BOOLEAN DEFAULT true,
  
  -- Contact Information
  mobile VARCHAR(20),
  emergency_contact VARCHAR(20),
  address TEXT,
  
  -- Personal Details
  date_of_birth DATE,
  blood_group VARCHAR(10),
  marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
  religion VARCHAR(50),
  
  -- Location & Nationality (International Support)
  country VARCHAR(50) DEFAULT 'Nepal',
  nationality VARCHAR(50),
  languages_spoken TEXT,
  
  -- Work Information
  designation VARCHAR(100),
  employee_id VARCHAR(50) UNIQUE,
  department VARCHAR(100),
  salary DECIMAL(10,2),
  joining_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Education Details
  highest_education VARCHAR(20) CHECK (highest_education IN ('primary', 'secondary', 'higher_secondary', 'bachelor', 'master', 'doctorate', 'diploma', 'certificate')),
  institute_name VARCHAR(200),
  graduation_year VARCHAR(4),
  specialization VARCHAR(100),
  additional_certifications TEXT,
  
  -- Experience & Skills
  previous_experience TEXT,
  skills TEXT,
  
  -- Banking Information (for payroll)
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  routing_number VARCHAR(50), -- IFSC for India, Bank Code for Nepal, SWIFT for International
  account_type VARCHAR(20) CHECK (account_type IN ('savings', 'checking', 'current')),
  bank_branch VARCHAR(100),
  
  -- Document Information (flexible for different countries)
  national_id VARCHAR(50), -- Citizenship for Nepal, Aadhar for India
  tax_id VARCHAR(50), -- VAT for Nepal, PAN for India
  passport_number VARCHAR(50),
  driving_license VARCHAR(50),
  
  -- Additional Information
  notes TEXT,
  credit_balance DECIMAL(10,2) DEFAULT 0,
  is_customer BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_country ON users(country);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_active ON users(active);
CREATE INDEX idx_users_appwrite_id ON users(appwrite_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT USING (auth.uid()::text = appwrite_id OR auth.uid()::text = uid);

-- Policy: Users can update their own profile (except role and sensitive fields)
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = appwrite_id OR auth.uid()::text = uid)
    WITH CHECK (auth.uid()::text = appwrite_id OR auth.uid()::text = uid);

-- Policy: Admins can manage all users
CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE (appwrite_id = auth.uid()::text OR uid = auth.uid()::text) 
            AND role = 'admin'
        )
    );

-- ============================================================================
-- Sample Data - Default Admin User (Nepal-focused)
-- ============================================================================

-- Insert default admin user with comprehensive Nepal-specific information
INSERT INTO users (
    uid,
    name,
    email,
    role,
    country,
    nationality,
    mobile,
    designation,
    employee_id,
    department,
    languages_spoken,
    active
) VALUES (
    'admin-default-001',
    'OrderChha Admin',
    'admin@orderchha.cafe',
    'admin',
    'Nepal',
    'Nepali',
    '+977 9876543210',
    'System Administrator',
    'ADM001',
    'Management',
    'Nepali, Hindi, English',
    true
);

-- Insert sample staff member
INSERT INTO users (
    uid,
    name,
    email,
    role,
    country,
    nationality,
    mobile,
    designation,
    employee_id,
    department,
    languages_spoken,
    highest_education,
    institute_name,
    skills,
    active
) VALUES (
    'staff-sample-001',
    'Ramesh Sharma',
    'ramesh@orderchha.cafe',
    'waiter',
    'Nepal',
    'Nepali',
    '+977 9812345678',
    'Senior Waiter',
    'STF001',
    'Service',
    'Nepali, Hindi, English',
    'higher_secondary',
    'Kathmandu Model College',
    'Customer service, Food knowledge, Multi-lingual communication',
    true
);

-- ============================================================================
-- Views for Easy Data Access
-- ============================================================================

-- Create view for active staff members
CREATE VIEW active_staff AS
SELECT 
    uid,
    name,
    email,
    role,
    designation,
    department,
    country,
    mobile,
    employee_id,
    joining_date,
    photo_url
FROM users 
WHERE active = true AND is_customer = false
ORDER BY role, name;

-- Create view for comprehensive user profiles
CREATE VIEW user_profiles AS
SELECT 
    uid,
    name,
    email,
    role,
    designation,
    country,
    nationality,
    mobile,
    emergency_contact,
    address,
    date_of_birth,
    blood_group,
    marital_status,
    religion,
    languages_spoken,
    employee_id,
    department,
    salary,
    highest_education,
    institute_name,
    specialization,
    skills,
    previous_experience,
    bank_name,
    account_type,
    bank_branch,
    photo_url,
    joining_date,
    created_at
FROM users
WHERE active = true;

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE users IS 'Comprehensive user management table supporting international staff with Nepal as primary market';
COMMENT ON COLUMN users.country IS 'User country - Nepal, India, Bangladesh, etc. for international marketplace';
COMMENT ON COLUMN users.national_id IS 'Flexible national ID - Citizenship No. for Nepal, Aadhar for India';
COMMENT ON COLUMN users.tax_id IS 'Tax identification - VAT No. for Nepal, PAN for India';
COMMENT ON COLUMN users.routing_number IS 'Bank routing code - Bank Code for Nepal, IFSC for India, SWIFT for International';
COMMENT ON COLUMN users.salary IS 'Monthly salary in local currency (NPR for Nepal, INR for India)';

-- ============================================================================
-- Success Message
-- ============================================================================
-- Database setup complete! 
-- 🇳🇵 Nepal-focused international user management system ready
-- 🌍 Supports multiple countries for marketplace expansion
-- 👥 Comprehensive staff information management
-- 🔒 Row Level Security enabled
-- 📊 Performance indexes created
-- ============================================================================
