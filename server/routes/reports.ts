import { Router, Request, Response } from 'express';
import { query } from '../db/pg';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(requireAuth);
router.use(requireRole('admin'));

// ==========================================
// 1. LIST GENERATED / AVAILABLE REPORTS
// ==========================================
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [studentsCountRes, skillsCountRes, appsCountRes, atRiskCountRes] = await Promise.all([
      query(`SELECT COUNT(*)::int as count FROM student_profiles`),
      query(`SELECT COUNT(*)::int as count FROM skills`),
      query(`SELECT COUNT(*)::int as count FROM applications`),
      query(`SELECT COUNT(*)::int as count FROM student_profiles WHERE gpa < 2.5 OR status = 'At Risk'`),
    ]);

    const studentCount = Number(studentsCountRes.rows[0]?.count) || 0;
    const skillsCount = Number(skillsCountRes.rows[0]?.count) || 0;
    const appsCount = Number(appsCountRes.rows[0]?.count) || 0;
    const atRiskCount = Number(atRiskCountRes.rows[0]?.count) || 0;

    const reports = [
      {
        id: 'rep-01',
        title: 'Institutional Academic Performance & GPA Distribution',
        category: 'Academic',
        description: 'Comprehensive analysis of student GPAs across semesters, departments, and standing categories.',
        format: 'CSV',
        lastGenerated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        recordsCount: studentCount,
      },
      {
        id: 'rep-02',
        title: 'Industry Skill Readiness & Verification Gap Report',
        category: 'Skills & Career',
        description: 'Analysis of verified technical proficiencies vs market demand and critical skill shortages.',
        format: 'XLSX',
        lastGenerated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        recordsCount: skillsCount,
      },
      {
        id: 'rep-03',
        title: 'Corporate Placement & Internship Applications Audit',
        category: 'Placements',
        description: 'Application tracking metrics, placement conversion rates, and partner recruiter engagement.',
        format: 'PDF',
        lastGenerated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        recordsCount: appsCount,
      },
      {
        id: 'rep-04',
        title: 'Students Needing Attention & At-Risk Early Intervention',
        category: 'Advisory',
        description: 'Flagged students with CGPA < 2.50 or low career readiness requiring academic advisory intervention.',
        format: 'CSV',
        lastGenerated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        recordsCount: atRiskCount,
      },
    ];

    return res.json({ success: true, data: reports });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2. EXPORT STUDENTS DATA AS CSV
// ==========================================
router.get('/export/students', async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        p.name,
        u.email,
        p.degree,
        p.semester,
        p.gpa,
        p.career_goal,
        p.career_readiness,
        p.status,
        p.academic_standing
      FROM users u
      JOIN student_profiles p ON u.id = p.id
      WHERE u.role = 'student'
      ORDER BY p.name ASC
    `);

    // Generate CSV string
    const headers = ['Name', 'Email', 'Program', 'Semester', 'CGPA', 'Career Goal', 'Readiness Score', 'Status', 'Academic Standing'];
    const rows = result.rows.map((r: any) => [
      `"${r.name}"`,
      `"${r.email}"`,
      `"${r.degree}"`,
      r.semester,
      r.gpa,
      `"${r.career_goal}"`,
      r.career_readiness,
      `"${r.status}"`,
      `"${r.academic_standing}"`,
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="campus_os_students_report.csv"');
    return res.send(csvContent);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
