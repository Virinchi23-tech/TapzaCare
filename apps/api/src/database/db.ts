import { createClient, Client } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config(); // fallback

const databaseUrl = process.env.TURSO_DATABASE_URL || 'file:tapza_local.db';
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

console.log(`[Database Client] Initializing libSQL with URL: ${databaseUrl}`);

export const db: Client = createClient({
  url: databaseUrl,
  authToken: authToken || undefined,
});

export async function checkDbConnection(): Promise<boolean> {
  try {
    const res = await db.execute('SELECT 1 as alive');
    return res.rows.length > 0;
  } catch (err) {
    console.error('[Turso DB] Connection check failed:', err);
    return false;
  }
}
