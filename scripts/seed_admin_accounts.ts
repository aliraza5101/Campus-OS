import { query } from '../server/db/pg';
import bcrypt from 'bcryptjs';

import dotenv from 'dotenv';

dotenv.config();

async function seedAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminSecurityPin = process.env.ADMIN_SECURITY_PIN;

    if (!adminEmail || !adminPassword || !adminSecurityPin) {
      console.error('❌ Missing required environment variables: ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_SECURITY_PIN must be set.');
      process.exit(1);
    }

    const adminId = 'a0000000-0000-0000-0000-000000000001';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Upsert users
    await query(
      `INSERT INTO users (id, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE 
       SET password_hash = $3, role = 'admin'`,
      [adminId, adminEmail, passwordHash]
    );

    // Upsert admin_profiles
    await query(
      `INSERT INTO admin_profiles (
        id, name, role, department, staff_id, clearance_level, status, security_pin, phone, office_location, bio
       ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
       )
       ON CONFLICT (id) DO UPDATE SET
        name = $2, role = $3, department = $4, staff_id = $5, clearance_level = $6, status = $7, security_pin = $8`,
      [
        adminId,
        'Dr. Sarah Malik',
        'Super Admin',
        'Faculty of Computing & Information Technology',
        'ADM-2024-001',
        'Tier 1 - Super Admin',
        'Active',
        adminSecurityPin,
        '+92 51 111 128 128',
        'Academic Block B, Room 402',
        'Dean of Computing & Information Technology, Senior Professor of AI & Systems.'
      ]
    );

    console.log('✅ Admin user and profile seeded successfully!');
    const checkUser = await query("SELECT id, email, role FROM users WHERE email = $1", [adminEmail]);
    console.log('User:', checkUser.rows[0]);
    const checkProfile = await query("SELECT * FROM admin_profiles WHERE id = $1", [adminId]);
    console.log('Profile:', checkProfile.rows[0]);
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
  } finally {
    process.exit(0);
  }
}

seedAdmin();
