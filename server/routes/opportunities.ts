import { Router, Request, Response } from 'express';
import { query } from '../db/pg';
import { requireAuth, optionalAuth, requireRole } from '../middleware/auth';
import { createStudentNotification, recordStudentActivity } from '../utils/notify';

const router = Router();

// ==========================================
// 1. GET OPPORTUNITIES LIST (PUBLIC / AUTH)
// ==========================================
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { type, search, status = 'Published' } = req.query;
    const userId = req.user?.id;

    const params: any[] = [];
    let paramIdx = 1;

    let hasAppliedExpr = 'false as has_applied';
    if (userId) {
      hasAppliedExpr = `EXISTS(SELECT 1 FROM applications WHERE opportunity_id = o.id AND student_id = $${paramIdx}) as has_applied`;
      params.push(userId);
      paramIdx++;
    }

    let sql = `
      SELECT 
        o.*,
        ${hasAppliedExpr}
      FROM opportunities o
      WHERE 1=1
    `;

    // Non-admin users only see Published
    if (!req.user || req.user.role !== 'admin') {
      sql += ` AND o.status = 'Published'`;
    } else if (status && status !== 'All') {
      sql += ` AND o.status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    if (type && type !== 'All') {
      sql += ` AND o.type = $${paramIdx}`;
      params.push(type);
      paramIdx++;
    }

    if (search) {
      sql += ` AND (o.title ILIKE $${paramIdx} OR o.organization ILIKE $${paramIdx} OR o.match_requirement ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    sql += ` ORDER BY o.featured DESC, o.posted_date DESC`;

    const result = await query(sql, params);

    const formatted = result.rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      organization: r.organization,
      type: r.type,
      location: r.location,
      deadline: r.deadline,
      status: r.status,
      applicantsCount: r.applicants_count,
      matchRequirement: r.match_requirement,
      featured: r.featured,
      compensation: r.compensation,
      applyUrl: r.apply_url || '',
      description: r.description || '',
      targetRole: r.target_role || 'All',
      isExternal: r.is_external !== false,
      postedDate: new Date(r.posted_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      hasApplied: Boolean(r.has_applied),
    }));

    return res.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Opportunities fetch error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch opportunities' });
  }
});

// ==========================================
// 2. CREATE OPPORTUNITY (ADMIN)
// ==========================================
router.post('/', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const {
      title,
      organization,
      type,
      location,
      deadline,
      status = 'Published',
      matchRequirement,
      featured = false,
      compensation,
      applyUrl,
      description,
      targetRole = 'All',
      isExternal = true,
    } = req.body;

    if (!title || !organization || !type || !deadline) {
      return res.status(400).json({ success: false, error: 'Title, organization, type, and deadline are required.' });
    }

    const result = await query(
      `INSERT INTO opportunities (
        title, organization, type, location, deadline, status, 
        match_requirement, featured, compensation, apply_url, description, 
        target_role, is_external
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        title.trim(),
        organization.trim(),
        type,
        location || 'Remote',
        deadline,
        status,
        matchRequirement || 'Relevant coursework & GPA > 3.0',
        featured,
        compensation,
        applyUrl || null,
        description || null,
        targetRole || 'All',
        isExternal !== false,
      ]
    );

    const newOpp = result.rows[0];

    // If published, notify students about the exciting new opportunity
    if (status === 'Published') {
      const students = await query(`SELECT id FROM users WHERE role = 'student'`);
      for (const st of students.rows) {
        createStudentNotification(
          st.id,
          'New Opportunity Available',
          `New ${type}: "${title.trim()}" at ${organization.trim()} is now accepting applications.`,
          'opportunity'
        ).catch(() => {});
      }
    }

    return res.status(201).json({ success: true, data: newOpp });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. UPDATE OPPORTUNITY (ADMIN)
// ==========================================
router.put('/:id', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, organization, type, location, deadline, status, matchRequirement, featured, compensation } = req.body;

    const result = await query(
      `UPDATE opportunities
       SET
         title = COALESCE($1, title),
         organization = COALESCE($2, organization),
         type = COALESCE($3, type),
         location = COALESCE($4, location),
         deadline = COALESCE($5, deadline),
         status = COALESCE($6, status),
         match_requirement = COALESCE($7, match_requirement),
         featured = COALESCE($8, featured),
         compensation = COALESCE($9, compensation),
         updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [title, organization, type, location, deadline, status, matchRequirement, featured, compensation, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Opportunity not found.' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 4. DELETE OPPORTUNITY (ADMIN)
// ==========================================
router.delete('/:id', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM opportunities WHERE id = $1 RETURNING id`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Opportunity not found.' });
    }
    return res.json({ success: true, message: 'Opportunity deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 5. APPLY FOR OPPORTUNITY (STUDENT)
// ==========================================
router.post('/:id/apply', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    let { id: opportunityId } = req.params;
    const { notes, title } = req.body;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(opportunityId);
    if (!isUUID) {
      // Find matching opportunity from DB by title or default to first available
      let matched = null;
      if (title) {
        const titleRes = await query(`SELECT id FROM opportunities WHERE title ILIKE $1 LIMIT 1`, [`%${title}%`]);
        if (titleRes.rows.length > 0) matched = titleRes.rows[0].id;
      }
      if (!matched) {
        const anyOpp = await query(`SELECT id FROM opportunities LIMIT 1`);
        if (anyOpp.rows.length > 0) matched = anyOpp.rows[0].id;
      }
      if (matched) {
        opportunityId = matched;
      } else {
        return res.status(400).json({ success: false, error: 'Valid opportunity ID required.' });
      }
    }

    // Check if already applied
    const existing = await query(
      `SELECT id FROM applications WHERE opportunity_id = $1 AND student_id = $2`,
      [opportunityId, studentId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'You have already submitted an application for this opportunity.' });
    }

    // Insert application
    const appRes = await query(
      `INSERT INTO applications (opportunity_id, student_id, notes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [opportunityId, studentId, notes || 'Applied via Campus OS portal.']
    );

    // Increment applicants_count
    await query(
      `UPDATE opportunities SET applicants_count = applicants_count + 1 WHERE id = $1`,
      [opportunityId]
    );

    // Get opportunity title
    const oppDetails = await query(`SELECT title, organization FROM opportunities WHERE id = $1`, [opportunityId]);
    const oppTitle = oppDetails.rows[0]?.title || 'Opportunity';

    // Record activity
    await recordStudentActivity(studentId, 'applied', 'Submitted Application', oppTitle);

    // Notify student
    await createStudentNotification(
      studentId,
      'Application Submitted',
      `Your application for "${oppTitle}" has been received and is now under review.`,
      'opportunity'
    );

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      data: appRes.rows[0],
    });
  } catch (error: any) {
    console.error('Apply error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to submit application' });
  }
});

// ==========================================
// 6. GET ALL APPLICATIONS (ADMIN)
// ==========================================
router.get('/admin/applications', requireAuth, requireRole('admin'), async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        a.id,
        a.student_id,
        a.opportunity_id,
        a.status,
        a.applied_date,
        a.notes,
        COALESCE(p.name, u.email) as student_name,
        u.email as student_email,
        COALESCE(p.degree, 'Undecided') as student_program,
        COALESCE(p.career_readiness, 0) as readiness_score,
        COALESCE(p.gpa, 0) as gpa,
        o.title as opportunity_title,
        o.organization as company
      FROM applications a
      JOIN users u ON a.student_id = u.id
      LEFT JOIN student_profiles p ON a.student_id = p.id
      JOIN opportunities o ON a.opportunity_id = o.id
      ORDER BY a.applied_date DESC
    `);

    const formatted = result.rows.map((r: any) => ({
      id: r.id,
      studentId: r.student_id,
      opportunityId: r.opportunity_id,
      studentName: r.student_name,
      studentEmail: r.student_email,
      studentProgram: r.student_program,
      opportunityTitle: r.opportunity_title,
      company: r.company,
      appliedDate: new Date(r.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readinessScore: r.readiness_score,
      gpa: r.gpa !== null && r.gpa !== undefined ? Number(r.gpa) : 0,
      status: r.status,
      notes: r.notes,
    }));

    return res.json({ success: true, data: formatted });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 7. UPDATE APPLICATION STATUS (ADMIN)
// ==========================================
router.put('/admin/applications/:id/status', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const result = await query(
      `UPDATE applications
       SET status = COALESCE($1, status),
           notes = COALESCE($2, notes)
       WHERE id = $3
       RETURNING *`,
      [status, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }

    const app = result.rows[0];

    // Notify student about status change
    await query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4)`,
      [
        app.student_id,
        `Application Status Update: ${status}`,
        `Your application status has been updated to "${status}".`,
        'opportunity',
      ]
    );

    return res.json({ success: true, message: 'Status updated successfully', data: app });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
