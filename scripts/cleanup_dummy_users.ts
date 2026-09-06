import { query } from '../server/db/pg';

async function cleanupTestUsers() {
  const del = await query(`
    DELETE FROM users 
    WHERE email LIKE 'verify.student%' 
       OR email = 'test.student.real@ajku.edu.pk'
    RETURNING id, email
  `);
  console.log('Cleaned up dummy test accounts:', del.rows);

  const remainingUsers = await query("SELECT id, email, role FROM users");
  console.log('Active remaining users:', remainingUsers.rows);

  process.exit(0);
}

cleanupTestUsers();
