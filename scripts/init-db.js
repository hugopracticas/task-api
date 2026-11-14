const pool = require('../db');

async function initDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                completed BOOLEAN NOT NULL DEFAULT FALSE
            )
        `);

        console.log('Tabla tasks preparada correctamente');

    } catch (error) {
        console.error('Error preparando la base de datos:', error);
        process.exitCode = 1;

    } finally {
        await pool.end();
    }
}

initDatabase();
