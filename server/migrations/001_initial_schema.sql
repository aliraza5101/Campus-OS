-- =========================================================
-- Campus OS - Comprehensive Supabase Database Schema
-- Migration 001: Initial Schema
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDENT PROFILES TABLE
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    degree TEXT DEFAULT 'BS Artificial Intelligence',
    semester INT DEFAULT 5,
    total_semesters INT DEFAULT 8,
    completed_semesters INT DEFAULT 4,
    university TEXT DEFAULT 'FAST NUCES',
    career_goal TEXT DEFAULT 'AI Research Scientist',
    gpa NUMERIC(4,2) DEFAULT 3.82,
    profile_completion INT DEFAULT 85,
    career_readiness INT DEFAULT 78,
    credits_completed INT DEFAULT 72,
    total_credits INT DEFAULT 130,
    academic_standing TEXT DEFAULT 'Good Standing',
    avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    location TEXT DEFAULT 'Islamabad, Pakistan',
    headline TEXT DEFAULT 'Dean''s Honor List • AI & Deep Learning Enthusiast',
    about_me TEXT DEFAULT 'Passionate computer science student specializing in artificial intelligence, neural networks, and scalable web architectures.',
    education_dates TEXT DEFAULT '2022 - 2026',
    relevant_coursework TEXT[] DEFAULT ARRAY['Data Structures', 'Algorithms', 'Deep Learning', 'Computer Vision', 'Database Systems', 'Distributed Systems'],
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Needs Attention', 'At Risk', 'Inactive')),
    onboarding_status TEXT DEFAULT 'Completed' CHECK (onboarding_status IN ('Completed', 'In Progress', 'Not Started')),
    advisor_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ADMIN PROFILES TABLE
CREATE TABLE IF NOT EXISTS admin_profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Super Admin' CHECK (role IN ('Super Admin', 'Academic Admin', 'Career Counselor', 'System Admin')),
    department TEXT DEFAULT 'Faculty of Computing & Information Technology',
    phone TEXT DEFAULT '+92 51 111 128 128',
    office_location TEXT DEFAULT 'Academic Block B, Room 402',
    office_hours TEXT DEFAULT 'Mon - Thu, 10:00 AM - 1:00 PM',
    bio TEXT DEFAULT 'Dean of Computing & Information Technology, Senior Professor of Machine Learning.',
    staff_id TEXT UNIQUE DEFAULT 'ADM-2024-001',
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    security_pin TEXT DEFAULT '123456',
    clearance_level TEXT DEFAULT 'Tier 1 - Super Admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SKILLS TABLE
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level TEXT NOT NULL DEFAULT 'Intermediate' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    percentage INT NOT NULL DEFAULT 50,
    category TEXT NOT NULL DEFAULT 'Technical',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'AI/ML',
    status TEXT NOT NULL DEFAULT 'In Progress' CHECK (status IN ('In Progress', 'Completed', 'Planned')),
    progress INT DEFAULT 0,
    description TEXT,
    tech_stack TEXT[] DEFAULT ARRAY[]::TEXT[],
    github_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EXPERIENCES TABLE
CREATE TABLE IF NOT EXISTS experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    employment_type TEXT DEFAULT 'Internship',
    period TEXT NOT NULL,
    location TEXT DEFAULT 'Remote',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CERTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    date TEXT NOT NULL,
    certificate_link TEXT,
    credential_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SEMESTER DETAILS TABLE
CREATE TABLE IF NOT EXISTS semester_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    semester INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'current', 'upcoming')),
    gpa NUMERIC(4,2),
    courses_count INT DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, semester)
);

-- 9. OPPORTUNITIES TABLE
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Internship', 'Scholarship', 'Competition', 'Research', 'Hackathon', 'Job')),
    location TEXT DEFAULT 'Remote',
    deadline TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Published', 'Draft', 'Scheduled', 'Archived')),
    applicants_count INT DEFAULT 0,
    match_requirement TEXT DEFAULT 'Relevant coursework & GPA > 3.0',
    featured BOOLEAN DEFAULT FALSE,
    compensation TEXT,
    posted_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Under Review' CHECK (status IN ('Under Review', 'Shortlisted', 'Accepted', 'Rejected')),
    applied_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(opportunity_id, student_id)
);

-- 11. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_audience TEXT NOT NULL DEFAULT 'All Students',
    category TEXT NOT NULL DEFAULT 'Academic' CHECK (category IN ('Academic', 'Career', 'Hackathon', 'System', 'Workshop')),
    status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Published', 'Draft', 'Scheduled')),
    author TEXT DEFAULT 'Office of Academic Affairs',
    priority TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('High', 'Normal', 'Urgent')),
    view_count INT DEFAULT 0,
    published_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. CHAT SESSIONS & MESSAGES TABLE
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('roadmap', 'profile', 'achievement', 'system', 'opportunity')),
    unread BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    actor TEXT NOT NULL,
    actor_role TEXT NOT NULL DEFAULT 'Super Admin',
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'System' CHECK (category IN ('User Management', 'Academic Data', 'Opportunities', 'Announcements', 'System', 'Security')),
    status TEXT NOT NULL DEFAULT 'Success' CHECK (status IN ('Success', 'Warning', 'Info')),
    ip_address TEXT DEFAULT '127.0.0.1'
);

-- 15. ADMIN SETTINGS TABLE
CREATE TABLE IF NOT EXISTS admin_settings (
    id INT PRIMARY KEY DEFAULT 1,
    institution_name TEXT DEFAULT 'National University of Computer & Emerging Sciences',
    campus_domain TEXT DEFAULT 'nu.edu.pk',
    academic_year TEXT DEFAULT '2024-2025',
    current_term TEXT DEFAULT 'Spring 2025',
    allow_student_self_registration BOOLEAN DEFAULT TRUE,
    require_admin_approval BOOLEAN DEFAULT FALSE,
    enable_email_digests BOOLEAN DEFAULT TRUE,
    enable_automatic_at_risk_alerts BOOLEAN DEFAULT TRUE,
    gpa_threshold_alert NUMERIC(4,2) DEFAULT 2.50,
    two_factor_authentication BOOLEAN DEFAULT FALSE,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_skills_student_id ON skills(student_id);
CREATE INDEX IF NOT EXISTS idx_projects_student_id ON projects(student_id);
CREATE INDEX IF NOT EXISTS idx_experiences_student_id ON experiences(student_id);
CREATE INDEX IF NOT EXISTS idx_certifications_student_id ON certifications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_opportunity_id ON applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
