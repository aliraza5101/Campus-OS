import { Router, Request, Response } from 'express';
import { query } from '../db/pg';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// ==========================================
// 1. GET ALL ANNOUNCEMENTS
// ==========================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    let sql = `SELECT * FROM announcements WHERE status = 'Published'`;
    const params: any[] = [];
    let paramIdx = 1;

    if (category && category !== 'All') {
      sql += ` AND category = $${paramIdx}`;
      params.push(category);
      paramIdx++;
    }

    if (search) {
      sql += ` AND (title ILIKE $${paramIdx} OR content ILIKE $${paramIdx} OR author ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    sql += ` ORDER BY published_date DESC`;

    const result = await query(sql, params);

    const formatted = result.rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      targetAudience: r.target_audience,
      category: r.category,
      status: r.status,
      author: r.author,
      publishedDate: new Date(r.published_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      viewCount: r.view_count,
      priority: r.priority,
    }));

    return res.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Announcements fetch error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch announcements' });
  }
});

// ==========================================
// 2. CREATE ANNOUNCEMENT (ADMIN)
// ==========================================
router.post('/', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { title, content, targetAudience = 'All Students', category = 'Academic', priority = 'Normal' } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required.' });
    }

    const result = await query(
      `INSERT INTO announcements (title, content, target_audience, category, priority, author)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title.trim(), content.trim(), targetAudience, category, priority, req.user?.email || 'Office of Academic Affairs']
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. UPDATE ANNOUNCEMENT (ADMIN)
// ==========================================
router.put('/:id', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, targetAudience, category, status, priority } = req.body;

    const result = await query(
      `UPDATE announcements
       SET
         title = COALESCE($1, title),
         content = COALESCE($2, content),
         target_audience = COALESCE($3, target_audience),
         category = COALESCE($4, category),
         status = COALESCE($5, status),
         priority = COALESCE($6, priority)
       WHERE id = $7
       RETURNING *`,
      [title, content, targetAudience, category, status, priority, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Announcement not found.' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 4. DELETE ANNOUNCEMENT (ADMIN)
// ==========================================
router.delete('/:id', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM announcements WHERE id = $1 RETURNING id`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Announcement not found.' });
    }
    return res.json({ success: true, message: 'Announcement deleted.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
