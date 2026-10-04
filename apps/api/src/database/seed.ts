import fs from 'fs';
import path from 'path';
import { db } from './db';
import { runMigrations } from './migrate';

export async function runSeeds() {
  console.log('[Seed] Ensuring schema exists...');
  await runMigrations();

  console.log('[Seed] Seeding database with initial Tapza Care data...');
  const seedPath = path.resolve(__dirname, '../../../../database/seeds/001_seed_data.sql');
  if (!fs.existsSync(seedPath)) {
    throw new Error(`Seed file not found at ${seedPath}`);
  }

  const sqlContent = fs.readFileSync(seedPath, 'utf8');
  const statements = sqlContent
    .split(';')
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

  try {
    const batchStatements = statements.map((sql) => ({ sql, args: [] }));
    await db.batch(batchStatements, 'write');
    console.log('[Seed] Batch seed data successfully populated in Turso DB!');
  } catch (err) {
    console.error('[Seed Batch Error] Retrying statements sequentially:', err);
    for (const statement of statements) {
      try {
        await db.execute({ sql: statement, args: [] });
      } catch (subErr) {
        // Log individual errors
      }
    }
  }
}

if (require.main === module) {
  runSeeds()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
