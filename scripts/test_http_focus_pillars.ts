import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { query } from '../server/db/pg';

dotenv.config();

async function testHttp() {
  const secret = process.env.JWT_SECRET || 'campus_os_jwt_super_secret_key_2025_prod';

  // Find a student with semester = 2
  const res = await query(`
    SELECT u.id, u.email, sp.name, sp.semester, sp.career_goal, sp.degree
    FROM users u
    JOIN student_profiles sp ON u.id = sp.id
    WHERE sp.semester = 2
    LIMIT 1
  `);

  if (res.rows.length === 0) {
    console.log('No student with semester 2 found');
    return;
  }

  const student = res.rows[0];
  console.log('Testing with student:', student);

  const token = jwt.sign(
    { id: student.id, email: student.email, role: 'student' },
    secret,
    { expiresIn: '7d' }
  );

  const response = await fetch('http://localhost:3000/api/student/roadmap/focus-pillars', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  console.log('HTTP Status:', response.status);
  const data = await response.json();
  console.log('Response body:', JSON.stringify(data, null, 2));
}

testHttp().catch(console.error);
