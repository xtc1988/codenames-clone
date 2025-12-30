const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  const prisma = new PrismaClient();

  try {
    console.log('Connecting to database...');
    console.log('✅ Connected successfully');

    const migrationPath = path.join(__dirname, 'prisma', 'migrations', '20251227_lowercase_enums', 'migration.sql');
    console.log(`Reading migration file: ${migrationPath}`);

    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log('✅ Migration file loaded');

    console.log('Applying migration...');
    console.log('---');
    console.log(sql.substring(0, 200) + '...');
    console.log('---');

    // Remove comments and split SQL by semicolons
    const sqlWithoutComments = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = sqlWithoutComments
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
      console.log(statement.substring(0, 80) + '...');

      try {
        await prisma.$executeRawUnsafe(statement + ';');
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (err) {
        console.error(`❌ Statement ${i + 1} failed:`);
        console.error(err.message);
        throw err;
      }
    }

    console.log('\n✅ Migration applied successfully');

  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed');
  }
}

applyMigration();
