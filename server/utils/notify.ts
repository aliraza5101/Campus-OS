import { query } from '../db/pg';

export type NotificationType = 'roadmap' | 'profile' | 'achievement' | 'system' | 'opportunity';

export async function createStudentNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = 'profile'
) {
  try {
    const res = await query(
      `INSERT INTO notifications (user_id, title, message, type, unread)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING *`,
      [userId, title.trim(), message.trim(), type]
    );
    return res.rows[0];
  } catch (err) {
    console.warn('Failed to insert student notification:', err);
    return null;
  }
}

export async function recordStudentActivity(
  studentId: string,
  type: 'added' | 'updated' | 'completed' | 'milestone' | 'applied',
  title: string,
  target: string
) {
  try {
    const res = await query(
      `INSERT INTO student_activities (student_id, type, title, target)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [studentId, type, title.trim(), target.trim()]
    );
    return res.rows[0];
  } catch (err) {
    console.warn('Failed to insert student activity:', err);
    return null;
  }
}
