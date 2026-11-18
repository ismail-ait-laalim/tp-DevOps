const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'app',
  password: process.env.DB_PASSWORD || 'app',
  database: process.env.DB_NAME || 'tasks',
  port: 5432,
});

async function initDb(retries = 20) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW())`);
      return;
    } catch (e) {
      console.log('DB pas prête, nouvelle tentative...');
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  throw new Error('DB injoignable');
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', env: process.env.APP_ENV || 'dev' }));

app.get('/api/tasks', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM tasks ORDER BY id');
  res.json(rows);
});

app.post('/api/tasks', async (req, res) => {
  const title = (req.body.title || '').trim();
  if (!title) return res.status(400).json({ error: 'title requis' });
  const { rows } = await pool.query('INSERT INTO tasks(title) VALUES($1) RETURNING *', [title]);
  res.status(201).json(rows[0]);
});

module.exports = app;

if (require.main === module) {
  initDb().then(() => app.listen(3000, () => console.log('API sur :3000')));
}
