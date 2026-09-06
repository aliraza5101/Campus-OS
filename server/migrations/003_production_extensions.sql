-- =========================================================
-- Campus OS - Production Extensions
-- Migration 003: Activities, Achievements, Skill Growth,
--                Roadmap Tasks, Last Active Tracking
-- =========================================================

-- 1. STUDENT ACTIVITIES TABLE (student-facing action history)
CREATE TABLE IF NOT EXISTS student_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'updated' CHECK (type IN ('completed', 'added', 'updated', 'milestone', 'deleted')),
    title TEXT NOT NULL,
    target TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_activities_student_id ON student_activities(student_id);
CREATE INDEX IF NOT EXISTS idx_student_activities_created_at ON student_activities(created_at DESC);

-- 2. ACHIEVEMENTS TABLE (definition + student unlocks)
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_key TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'Trophy',
    status TEXT NOT NULL DEFAULT 'Locked' CHECK (status IN ('Completed', 'Locked')),
    earned_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, achievement_key)
);

CREATE INDEX IF NOT EXISTS idx_achievements_student_id ON achievements(student_id);

-- 3. SKILL GROWTH HISTORY TABLE (monthly snapshots)
CREATE TABLE IF NOT EXISTS skill_growth_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    year INT NOT NULL,
    points INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_skill_growth_student_id ON skill_growth_history(student_id);

-- 4. ROADMAP TASKS TABLE (persistent next steps)
CREATE TABLE IF NOT EXISTS roadmap_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    number TEXT NOT NULL DEFAULT '01',
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Project' CHECK (category IN ('Project', 'Skill', 'Career', 'Academic', 'Research')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
    estimated_time TEXT DEFAULT '1 week',
    action_type TEXT DEFAULT 'Build Project',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'skipped')),
    source TEXT DEFAULT 'ai' CHECK (source IN ('ai', 'manual', 'system')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_student_id ON roadmap_tasks(student_id);

-- 5. ADD last_active_at TO USERS TABLE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'last_active_at'
    ) THEN
        ALTER TABLE users ADD COLUMN last_active_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;
