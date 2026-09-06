import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
  console.error('❌ Error: Neither DIRECT_URL nor DATABASE_URL is set in .env');
  process.exit(1);
}

const { Pool } = pg;

async function runMigrations() {
  console.log('\n🚀 Starting Campus OS Supabase Migration...\n');
  console.log(`📡 Connecting to PostgreSQL instance...`);

  // Try direct connection first, fallback to standard pool
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  const client = await pool.connect();

  try {
    const migrationsDir = path.resolve(process.cwd(), 'server', 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      throw new Error(`Migrations directory not found at: ${migrationsDir}`);
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    console.log(`📁 Found ${files.length} migration files: ${files.join(', ')}\n`);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`⏳ Executing migration: ${file}...`);
      const startTime = Date.now();

      await client.query(sql);

      const elapsed = Date.now() - startTime;
      console.log(`✅ Completed: ${file} (${elapsed}ms)`);
    }

    // Verify all created tables
    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tables = tableRes.rows.map((r: any) => r.table_name);
    console.log('\n📊 Database Tables Verified in Supabase:');
    tables.forEach((t: string) => console.log(`   ✨ ${t}`));

    // Check row counts
    const userCount = await client.query('SELECT COUNT(*) FROM users;');
    const oppCount = await client.query('SELECT COUNT(*) FROM opportunities;');
    const annCount = await client.query('SELECT COUNT(*) FROM announcements;');

    console.log('\n📈 Initial Data Counts:');
    console.log(`   👥 Users: ${userCount.rows[0].count}`);
    console.log(`   🎯 Opportunities: ${oppCount.rows[0].count}`);
    console.log(`   📢 Announcements: ${annCount.rows[0].count}`);

    console.log('\n🎉 Supabase Database Migration Completed Successfully!\n');
  } catch (error) {
    console.error('\n❌ Migration Failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
