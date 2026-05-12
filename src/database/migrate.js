const fs = require('fs/promises');
const path = require('path');

const MIGRATIONS_DIR = path.resolve(__dirname, './migrations');
const TABLE_NAME = 'migrations';

const ensureMigrationsTable = async (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
            nome_arquivo VARCHAR(200) PRIMARY KEY
        )
    `;

    await db.query(sql);
};

const getMigrationFiles = async () => {
    const files = await fs.readdir(MIGRATIONS_DIR);

    return files
        .filter((fileName) => fileName.toLowerCase().endsWith('.sql'))
        .sort((a, b) => a.localeCompare(b));
};

const getAppliedMigrations = async (db) => {
    const result = await db.query(`SELECT nome_arquivo FROM ${TABLE_NAME}`);
    return new Set(result.rows.map((row) => row.nome_arquivo));
};

const run = async () => {
    const { default: db } = await import('../pages/api/config/connectDB.js');

    try {
        await ensureMigrationsTable(db);

        const [files, applied] = await Promise.all([
            getMigrationFiles(),
            getAppliedMigrations(db),
        ]);

        for (const fileName of files) {
            if (applied.has(fileName)) {
                console.log(`[skip] ${fileName}`);
                continue;
            }

            const migrationPath = path.join(MIGRATIONS_DIR, fileName);
            const sql = await fs.readFile(migrationPath, 'utf8');

            await db.query('BEGIN');
            try {
                await db.query(sql);
                await db.query(
                    `INSERT INTO ${TABLE_NAME} (nome_arquivo) VALUES ($1)`,
                    [fileName]
                );
                await db.query('COMMIT');
                console.log(`[ok] ${fileName}`);
            } catch (error) {
                await db.query('ROLLBACK');
                throw error;
            }
        }

        console.log('Migrações finalizadas');
    } catch (error) {
        console.error('Erro ao executar migrações:', error);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
};

run();
