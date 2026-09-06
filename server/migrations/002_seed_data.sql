-- =========================================================
-- Campus OS - Comprehensive Supabase Seed Data
-- Migration 002: Seed Data
-- =========================================================

-- Enable pgcrypto for crypt password hashing if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. SEED USERS & PROFILES

-- Admin User
DO $$
DECLARE
    v_admin_id UUID;
    v_student_id UUID;
    v_opp1_id UUID;
    v_opp2_id UUID;
    v_opp3_id UUID;
    v_opp4_id UUID;
    v_opp5_id UUID;
BEGIN
    -- Insert Admin User (Password: admin123)
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@campus.edu' OR email = 'admin@nu.edu.pk') THEN
        INSERT INTO users (id, email, password_hash, role)
        VALUES (
            'a0000000-0000-0000-0000-000000000001',
            'admin@campus.edu',
            crypt('admin123', gen_salt('bf', 10)),
            'admin'
        )
        RETURNING id INTO v_admin_id;

        INSERT INTO admin_profiles (
            id, name, role, department, phone, office_location, office_hours, bio, staff_id, status, security_pin, clearance_level
        ) VALUES (
            v_admin_id,
            'Dr. Arshad Malik',
            'Super Admin',
            'Faculty of Computing & Information Technology',
            '+92 51 111 128 128',
            'Academic Block B, Room 402',
            'Mon - Thu, 10:00 AM - 1:00 PM',
            'Dean of Computing & Information Technology, Senior Professor of Machine Learning.',
            'ADM-2024-001',
            'Active',
            '123456',
            'Tier 1 - Super Admin'
        );
    END IF;

    -- Insert Primary Demo Student (Password: student123)
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'sarah.ahmed@student.nu.edu.pk' OR email = 'student@campus.edu') THEN
        INSERT INTO users (id, email, password_hash, role)
        VALUES (
            'b0000000-0000-0000-0000-000000000001',
            'sarah.ahmed@student.nu.edu.pk',
            crypt('student123', gen_salt('bf', 10)),
            'student'
        )
        RETURNING id INTO v_student_id;

        INSERT INTO student_profiles (
            id, name, degree, semester, total_semesters, completed_semesters, university, career_goal,
            gpa, profile_completion, career_readiness, credits_completed, total_credits, academic_standing,
            avatar, location, headline, about_me, education_dates, relevant_coursework, status, onboarding_status
        ) VALUES (
            v_student_id,
            'Sarah Ahmed',
            'BS Artificial Intelligence',
            5, 8, 4,
            'National University of Computer and Emerging Sciences',
            'AI Research Scientist',
            3.82, 85, 78, 72, 130,
            'Dean''s Honor List',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            'Islamabad, Pakistan',
            'Dean''s Honor List • AI & Deep Learning Enthusiast',
            'Passionate computer science student specializing in artificial intelligence, neural networks, and scalable web architectures. Looking for summer 2025 research internships.',
            '2022 - 2026',
            ARRAY['Data Structures & Algorithms', 'Deep Learning & Neural Networks', 'Computer Vision', 'Database Systems', 'Distributed Systems', 'Natural Language Processing'],
            'Active',
            'Completed'
        );

        -- Insert Sarah's Skills
        INSERT INTO skills (student_id, name, level, percentage, category, verified) VALUES
        (v_student_id, 'Python', 'Expert', 95, 'Programming', true),
        (v_student_id, 'PyTorch', 'Advanced', 85, 'AI/ML', true),
        (v_student_id, 'TensorFlow', 'Intermediate', 75, 'AI/ML', false),
        (v_student_id, 'React / TypeScript', 'Advanced', 82, 'Web Dev', true),
        (v_student_id, 'PostgreSQL & SQL', 'Intermediate', 78, 'Database', true),
        (v_student_id, 'Data Structures & Algorithms', 'Advanced', 88, 'Core CS', true);

        -- Insert Sarah's Projects
        INSERT INTO projects (student_id, title, category, status, progress, description, tech_stack, github_url, verified) VALUES
        (v_student_id, 'Neural Style Transfer Studio', 'AI/ML', 'Completed', 100, 'Real-time artistic style transfer on video streams using lightweight CNNs with FP16 quantization.', ARRAY['PyTorch', 'FastAPI', 'OpenCV', 'React'], 'https://github.com/sarahahmed/neural-style', true),
        (v_student_id, 'Campus Academic Agent', 'AI/ML', 'In Progress', 75, 'Autonomous academic advisor using multi-turn LLM reasoning and student performance analytics.', ARRAY['Python', 'LangChain', 'Next.js', 'PostgreSQL'], 'https://github.com/sarahahmed/campus-ai-agent', true),
        (v_student_id, 'Distributed Key-Value Store', 'Systems', 'Planned', 20, 'Raft-consensus based replicated key-value storage engine in Go.', ARRAY['Go', 'gRPC', 'Protobuf', 'Raft'], 'https://github.com/sarahahmed/distributed-raft-kv', false);

        -- Insert Sarah's Experiences
        INSERT INTO experiences (student_id, title, company, employment_type, period, location, description) VALUES
        (v_student_id, 'AI Engineering Intern', 'Afiniti AI Research Lab', 'Internship', 'Jun 2024 - Aug 2024', 'Islamabad (Hybrid)', 'Engineered transformer-based sentiment analysis pipelines optimizing customer routing latency by 28%.'),
        (v_student_id, 'Undergraduate Teaching Assistant', 'Department of Computer Science', 'Part-time', 'Jan 2024 - May 2024', 'Campus', 'Conducted weekly lab sessions for 45 students in CS201 Data Structures and graded programming assignments.');

        -- Insert Sarah's Certifications
        INSERT INTO certifications (student_id, title, organization, date, certificate_link, credential_id) VALUES
        (v_student_id, 'Deep Learning Specialization', 'DeepLearning.AI / Coursera', 'Sep 2023', 'https://coursera.org/verify/specialization/DL2023', 'DL-AI-994827'),
        (v_student_id, 'AWS Certified Cloud Practitioner', 'Amazon Web Services', 'Dec 2023', 'https://aws.amazon.com/verification', 'AWS-CCP-778219');

        -- Insert Sarah's Semester Records
        INSERT INTO semester_details (student_id, semester, status, gpa, courses_count) VALUES
        (v_student_id, 1, 'completed', 3.75, 5),
        (v_student_id, 2, 'completed', 3.80, 5),
        (v_student_id, 3, 'completed', 3.85, 6),
        (v_student_id, 4, 'completed', 3.88, 5),
        (v_student_id, 5, 'current', 3.82, 5);

        -- Insert Sarah's Notifications
        INSERT INTO notifications (user_id, title, message, type, unread) VALUES
        (v_student_id, 'New Opportunity Match', 'Google Summer Research Fellowship matches your AI Research career goal.', 'opportunity', true),
        (v_student_id, 'Roadmap Milestone Achieved', 'You completed the PyTorch Advanced milestone in your AI Career Roadmap.', 'roadmap', false),
        (v_student_id, 'Dean''s Honor List', 'Congratulations! You have been awarded Dean''s Honor List for Spring 2024.', 'achievement', false);
    END IF;

    -- 2. SEED OPPORTUNITIES
    IF NOT EXISTS (SELECT 1 FROM opportunities LIMIT 1) THEN
        INSERT INTO opportunities (id, title, organization, type, location, deadline, status, applicants_count, match_requirement, featured, compensation)
        VALUES 
        ('c0000000-0000-0000-0000-000000000001', 'Summer Machine Learning Research Fellowship', 'Google DeepMind & FAST Lab', 'Research', 'Remote / Hybrid', 'May 15, 2025', 'Published', 42, 'GPA > 3.5, PyTorch / TensorFlow proficiency', true, '$1,200 / month'),
        ('c0000000-0000-0000-0000-000000000002', 'Full-Stack Software Engineering Intern', 'Careem (an Uber Company)', 'Internship', 'Karachi / Hybrid', 'May 30, 2025', 'Published', 89, 'React, Node.js/TypeScript, SQL', true, 'PKR 80,000 / month'),
        ('c0000000-0000-0000-0000-000000000003', 'National AI Hackathon & Innovation Challenge', 'Ministry of IT & Ignite Fund', 'Hackathon', 'Islamabad Expo Center', 'June 10, 2025', 'Published', 150, 'Teams of 3-4 students from accredited universities', true, 'PKR 1,500,000 Prize Pool'),
        ('c0000000-0000-0000-0000-000000000004', 'Undergraduate Merit Scholarship 2024-25', 'HEC & Higher Education Foundation', 'Scholarship', 'Campus Wide', 'April 30, 2025', 'Published', 64, 'CGPA >= 3.65 and active semester enrollment', false, '100% Tuition Waiver'),
        ('c0000000-0000-0000-0000-000000000005', 'Junior Cloud Infrastructure Associate', 'Systems Limited', 'Job', 'Lahore / On-site', 'July 01, 2025', 'Published', 27, 'Graduating seniors with Docker, Linux, CI/CD experience', false, 'PKR 120,000 / month');

        -- Attach Sarah's sample application if student exists
        SELECT id INTO v_student_id FROM users WHERE email = 'sarah.ahmed@student.nu.edu.pk' LIMIT 1;
        IF v_student_id IS NOT NULL THEN
            INSERT INTO applications (opportunity_id, student_id, status, notes)
            VALUES ('c0000000-0000-0000-0000-000000000001', v_student_id, 'Under Review', 'Applied with published PyTorch project and recommendation letter from Faculty Advisor.')
            ON CONFLICT (opportunity_id, student_id) DO NOTHING;
        END IF;
    END IF;

    -- 3. SEED ANNOUNCEMENTS
    IF NOT EXISTS (SELECT 1 FROM announcements LIMIT 1) THEN
        INSERT INTO announcements (title, content, target_audience, category, status, author, priority, view_count)
        VALUES 
        ('Final Term Examination Schedule Released (Spring 2025)', 'The official examination timetable for all undergraduate and graduate programs has been published. Please check your personalized portal for exam dates and assigned examination halls.', 'All Students', 'Academic', 'Published', 'Controller of Examinations', 'Urgent', 1420),
        ('Annual University Hackathon 2025 Registration Open', 'Registrations are now live for the 48-hour hackathon. Tracks include Generative AI, Cloud Infrastructure, FinTech, and Smart Campus Solutions. Mentorship from industry leads provided.', 'All Students', 'Hackathon', 'Published', 'ACM Student Chapter & Faculty Advisor', 'High', 850),
        ('Campus Placement Drive & Career Fair - Over 40 Companies', 'The Career Services Center invites all 6th, 7th, and 8th semester students to the Annual Career Fair. Bring updated resumes and professional portfolios.', 'Graduating Seniors', 'Career', 'Published', 'Career Services & Placement Office', 'High', 1190),
        ('Maintenance Window: Scheduled Cloud & Database Upgrades', 'Campus OS servers will undergo scheduled infrastructure maintenance on Saturday, 2:00 AM - 4:00 AM UTC. Intermittent connectivity may occur during this window.', 'All Students', 'System', 'Published', 'IT Infrastructure Team', 'Normal', 340);
    END IF;

    -- 4. SEED ADMIN SETTINGS
    INSERT INTO admin_settings (id, institution_name, campus_domain, academic_year, current_term, allow_student_self_registration, require_admin_approval, enable_email_digests, enable_automatic_at_risk_alerts, gpa_threshold_alert, two_factor_authentication, maintenance_mode)
    VALUES (1, 'National University of Computer & Emerging Sciences', 'nu.edu.pk', '2024-2025', 'Spring 2025', true, false, true, true, 2.50, false, false)
    ON CONFLICT (id) DO NOTHING;

    -- 5. SEED INITIAL ACTIVITY LOGS
    IF NOT EXISTS (SELECT 1 FROM activity_logs LIMIT 1) THEN
        INSERT INTO activity_logs (timestamp, actor, actor_role, action, target, category, status, ip_address)
        VALUES
        (NOW() - INTERVAL '15 minutes', 'Dr. Arshad Malik', 'Super Admin', 'Approved Opportunity Posting', 'Summer Machine Learning Research Fellowship', 'Opportunities', 'Success', '192.168.1.104'),
        (NOW() - INTERVAL '1 hour', 'Admin Portal', 'System Admin', 'Database Sync & Schema Migration', 'Campus OS Core PostgreSQL v15', 'System', 'Success', '127.0.0.1'),
        (NOW() - INTERVAL '3 hours', 'Prof. Tariq Jamil', 'Academic Admin', 'Updated Student Academic Standing', 'Sarah Ahmed (BS AI - 2022)', 'Academic Data', 'Success', '192.168.1.88');
    END IF;

END $$;
