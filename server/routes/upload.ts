import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../db/supabase';
import { requireAuth } from '../middleware/auth';
import { query } from '../db/pg';

const router = Router();

// ==========================================
// AVATAR / FILE UPLOAD ENDPOINT
// ==========================================
router.post('/avatar', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { imageBase64, fileName = `avatar-${Date.now()}.jpg` } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'No image data provided.' });
    }

    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const path = `${userId}/${fileName}`;

    let avatarUrl = imageBase64;

    // Try uploading to Supabase Storage bucket 'avatars' if bucket exists
    try {
      const { data, error } = await supabaseAdmin.storage
        .from('avatars')
        .upload(path, buffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabaseAdmin.storage.from('avatars').getPublicUrl(path);
        if (publicUrlData?.publicUrl) {
          avatarUrl = publicUrlData.publicUrl;
        }
      }
    } catch (storageErr) {
      console.warn('Supabase storage upload fallback to base64/direct:', storageErr);
    }

    // Update user profile avatar in DB
    if (req.user!.role === 'admin') {
      await query(`UPDATE admin_profiles SET avatar = $1, updated_at = NOW() WHERE id = $2`, [avatarUrl, userId]);
    } else {
      await query(`UPDATE student_profiles SET avatar = $1, updated_at = NOW() WHERE id = $2`, [avatarUrl, userId]);
    }

    return res.json({
      success: true,
      message: 'Avatar uploaded and updated successfully!',
      avatarUrl,
    });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to upload avatar' });
  }
});

export default router;
