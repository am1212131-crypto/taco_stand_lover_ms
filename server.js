require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS now');
    res.json({ ok: true, dbTime: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id, email, name',
      [email, name || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`taco_stand_lover_ms server listening on port ${port}`);
});
