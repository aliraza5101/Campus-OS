import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
  console.warn('⚠️ DATABASE_URL or DIRECT_URL is not configured in .env');
}

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function query<T = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && duration > 500) {
      console.log(`[DB Slow Query] ${duration}ms - ${text.substring(0, 100)}`);
    }
    return res;
  } catch (error) {
    console.error(`[DB Query Error] on "${text.substring(0, 100)}":`, error);
    throw error;
  }
}
