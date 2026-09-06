import { query } from '../server/db/pg';

async function main() {
  const users = await query("SELECT id, email, role, created_at FROM users");
  console.log('--- USERS IN DB (' + users.rows.length + ') ---');
  console.table(users.rows);

  const students = await query("SELECT id, name, onboarding_status, status, gpa, career_readiness FROM student_profiles");
  console.log('--- STUDENT PROFILES IN DB (' + students.rows.length + ') ---');
  console.table(students.rows);

  const stats = await query(`
    SELECT
      (SELECT COUNT(*)::int FROM users WHERE role = 'student') as total_students,
      (SELECT COUNT(*)::int FROM users WHERE role = 'admin') as total_admins,
      (SELECT COUNT(*)::int FROM users WHERE role = 'student' AND (last_active_at >= NOW() - INTERVAL '7 days' OR last_active_at IS NOT NULL)) as active_students,
      (SELECT COUNT(*)::int FROM users WHERE role = 'student' AND created_at >= NOW() - INTERVAL '30 days') as new_students,
      (SELECT COUNT(*)::int FROM student_profiles WHERE onboarding_status = 'Completed') as onboarding_completed,
      (SELECT COUNT(*)::int FROM student_profiles WHERE status = 'At Risk' OR gpa < 2.5) as at_risk,
      (SELECT COUNT(*)::int FROM opportunities WHERE status = 'Published') as total_opportunities,
      (SELECT COUNT(*)::int FROM projects) as total_projects,
      (SELECT COALESCE(AVG(gpa), 0)::numeric(4,2) FROM student_profiles) as avg_gpa,
      (SELECT COALESCE(AVG(career_readiness), 0)::numeric(4,1) FROM student_profiles) as avg_readiness
  `);
  console.log('--- DATABASE STATS SUMMARY ---');
  console.log(stats.rows[0]);

  process.exit(0);
}

main();
