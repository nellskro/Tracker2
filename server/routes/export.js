const express = require('express');
const router = express.Router();
const { query } = require('../database');

router.get('/json', async (req, res) => {
  const [routines, categories, logs, journal] = await Promise.all([
    query('SELECT * FROM routines'),
    query('SELECT * FROM categories'),
    query('SELECT * FROM logs'),
    query('SELECT * FROM journal'),
  ]);
  const data = {
    routines: routines.rows,
    categories: categories.rows,
    logs: logs.rows,
    journal: journal.rows,
  };
  res.setHeader('Content-Disposition', 'attachment; filename="tracker-export.json"');
  res.json(data);
});

router.get('/csv', async (req, res) => {
  const r = await query(`
    SELECT l.date, r.nom, l.valeur, r.type, r.categorie
    FROM logs l JOIN routines r ON l.routine_id = r.id
    ORDER BY l.date DESC
  `);
  let csv = 'Date,Routine,Valeur,Type,Categorie\n';
  r.rows.forEach(l => { csv += `${l.date},"${l.nom}",${l.valeur},${l.type},${l.categorie}\n`; });
  res.setHeader('Content-Disposition', 'attachment; filename="tracker-export.csv"');
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
});

router.post('/import', async (req, res) => {
  const { routines, categories, logs, journal } = req.body;
  if (categories) {
    for (const c of categories) {
      await query('INSERT INTO categories (nom, couleur) VALUES ($1,$2) ON CONFLICT DO NOTHING', [c.nom, c.couleur]);
    }
  }
  if (routines) {
    for (const r of routines) {
      await query(
        'INSERT INTO routines (nom, categorie, type, objectif_hebdo, objectif_mensuel, objectif_jour) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING',
        [r.nom, r.categorie, r.type, r.objectif_hebdo, r.objectif_mensuel, r.objectif_jour || 1]
      );
    }
  }
  if (logs) {
    for (const l of logs) {
      await query('INSERT INTO logs (routine_id, date, valeur) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [l.routine_id, l.date, l.valeur]);
    }
  }
  if (journal) {
    for (const j of journal) {
      await query(
        'INSERT INTO journal (date, victoires, objectifs) VALUES ($1,$2,$3) ON CONFLICT (date) DO UPDATE SET victoires=EXCLUDED.victoires, objectifs=EXCLUDED.objectifs',
        [j.date, j.victoires, j.objectifs]
      );
    }
  }
  res.json({ ok: true });
});

module.exports = router;
