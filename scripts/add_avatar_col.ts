import { query } from '../server/db/pg';

async function addAvatar() {
  await query('ALTER TABLE admin_profiles ADD COLUMN IF NOT EXISTS avatar text');
  console.log('ALTER TABLE admin_profiles ADD COLUMN avatar completed successfully.');
  process.exit(0);
}

addAvatar();
