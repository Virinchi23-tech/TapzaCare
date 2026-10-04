import fs from 'fs';
import path from 'path';
import { db } from './db';

export async function runMigrations() {
  console.log('[Migration] Starting database migration on Turso...');
  const sqlPath = path.resolve(__dirname, '../../../../database/migrations/001_initial_schema.sql');
  if (!fs.existsSync(sqlPath)) {
    throw new Error(`Schema file not found at ${sqlPath}`);
  }

  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  const statements = sqlContent
    .split(';')
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

  // Batch execute DDL statements
  try {
    const batchStatements = statements.map((sql) => ({ sql, args: [] }));
    await db.batch(batchStatements, 'write');
    console.log('[Migration] Successfully executed database migrations via batch stream!');
  } catch (err) {
    console.error('[Migration Batch Error] Falling back to sequential execution:', err);
    for (const statement of statements) {
      try {
        await db.execute({ sql: statement, args: [] });
      } catch (subErr) {
        console.warn(`Statement warning (${statement.substring(0, 40)}):`, subErr);
      }
    }
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
