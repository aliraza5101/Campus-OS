import { query } from '../server/db/pg';

async function checkSchema() {
  const cols = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'admin_profiles'");
  console.log('admin_profiles columns:', cols.rows);

  const actCols = await query("SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'activity_logs_category_check'");
  console.log('activity_logs_category_check:', actCols.rows);

  const existingCats = await query("SELECT DISTINCT category FROM activity_logs");
  console.log('existing activity_logs categories:', existingCats.rows);

  process.exit(0);
}

checkSchema();
