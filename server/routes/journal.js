const express = require('express');
const router = express.Router();
const { query } = require('../database');

router.get('/:date', async (req, res) => {
  const r = await query('SELECT * FROM journal WHERE date=$1', [req.params.date]);
  if (!r.rows[0]) return res.json({ date: req.params.date, victoires: [], objectifs: [] });
  const row = r.rows[0];
  res.json({ ...row, victoires: JSON.parse(row.victoires || '[]'), objectifs: JSON.parse(row.objectifs || '[]') });
});

router.put('/:date', async (req, res) => {
  const { victoires, objectifs } = req.body;
  await query(
    `INSERT INTO journal (date, victoires, objectifs) VALUES ($1,$2,$3)
     ON CONFLICT (date) DO UPDATE SET victoires=EXCLUDED.victoires, objectifs=EXCLUDED.objectifs`,
    [req.params.date, JSON.stringify(victoires || []), JSON.stringify(objectifs || [])]
  );
  res.json({ ok: true });
});

module.exports = router;
