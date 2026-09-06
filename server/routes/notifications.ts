import { Router, Request, Response } from 'express';
import { query } from '../db/pg';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// ==========================================
// 1. GET USER NOTIFICATIONS
// ==========================================
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30`,
      [userId]
    );

    const formatted = result.rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      message: r.message,
      time: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      unread: r.unread,
      type: r.type,
    }));

    return res.json({ success: true, data: formatted });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2. MARK NOTIFICATION AS READ
// ==========================================
router.put('/:id/read', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await query(`UPDATE notifications SET unread = false WHERE id = $1 AND user_id = $2`, [id, userId]);
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. MARK ALL AS READ
// ==========================================
router.put('/read-all', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    await query(`UPDATE notifications SET unread = false WHERE user_id = $1`, [userId]);
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 4. BROADCAST NOTIFICATION (ADMIN)
// ==========================================
router.post('/broadcast', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { title, message, type = 'system', targetAudience = 'All Students' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Title and message are required.' });
    }

    // Fetch target user IDs with smart cohort detection
    let userQuery = `SELECT id FROM users WHERE role = 'student'`;
    let queryParams: any[] = [];
    if (targetAudience && targetAudience !== 'All Students' && !targetAudience.startsWith('All')) {
      if (targetAudience.includes('Semester')) {
        const semMatch = targetAudience.match(/(\d+)/g);
        if (semMatch) {
          const sems = semMatch.map(Number);
          userQuery = `SELECT u.id FROM users u JOIN student_profiles p ON u.id = p.id WHERE u.role = 'student' AND p.semester = ANY($1)`;
          queryParams = [sems];
        }
      } else if (targetAudience.includes('Attention') || targetAudience.includes('Risk')) {
        userQuery = `SELECT u.id FROM users u JOIN student_profiles p ON u.id = p.id WHERE u.role = 'student' AND (p.status = 'At Risk' OR p.status = 'Needs Attention' OR p.gpa < 2.5)`;
        queryParams = [];
      } else {
        const cleanAudience = targetAudience.replace(/\s*\(\d+.*?\)/, '').trim();
        userQuery = `SELECT u.id FROM users u JOIN student_profiles p ON u.id = p.id WHERE u.role = 'student' AND (p.degree ILIKE $1 OR p.career_goal ILIKE $1)`;
        queryParams = [`%${cleanAudience}%`];
      }
    }

    const students = await query(userQuery, queryParams);

    const validNotificationTypes = ['roadmap', 'profile', 'achievement', 'system', 'opportunity'];
    const notifType = validNotificationTypes.includes(type) ? type : 'system';

    for (const student of students.rows) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, $2, $3, $4)`,
        [student.id, title, message, notifType]
      );
    }

    // Log admin activity
    await query(
      `INSERT INTO activity_logs (actor, actor_role, action, target, category, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.user?.email || 'Admin',
        'Super Admin',
        `Broadcast Push Notification: "${title}"`,
        `${students.rows.length} Students (${targetAudience})`,
        'Announcements',
        'Success',
      ]
    );

    return res.json({
      success: true,
      message: `Broadcast delivered to ${students.rows.length} students.`,
      count: students.rows.length,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
