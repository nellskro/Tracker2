const express = require('express');
const router = express.Router();
const { query } = require('../database');

// GET categories
router.get('/categories', async (req, res) => {
  const r = await query('SELECT * FROM categories ORDER BY ordre, id');
  res.json(r.rows);
});

// POST category
router.post('/categories', async (req, res) => {
  const { nom, couleur } = req.body;
  const r = await query('INSERT INTO categories (nom, couleur) VALUES ($1,$2) RETURNING id', [nom, couleur || '#6366f1']);
  res.json({ id: r.rows[0].id });
});

// PUT category
router.put('/categories/:id', async (req, res) => {
  const { nom, couleur } = req.body;
  await query('UPDATE categories SET nom=$1, couleur=$2 WHERE id=$3', [nom, couleur, req.params.id]);
  res.json({ ok: true });
});

// DELETE category
router.delete('/categories/:id', async (req, res) => {
  await query('DELETE FROM categories WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

// GET all routines
router.get('/', async (req, res) => {
  const r = await query('SELECT * FROM routines WHERE actif=1 ORDER BY ordre, id');
  res.json(r.rows);
});

// POST routine
router.post('/', async (req, res) => {
  const { nom, categorie, type, objectif_hebdo, objectif_mensuel, objectif_jour, icone, ordre } = req.body;
  const r = await query(
    `INSERT INTO routines (nom, categorie, type, objectif_hebdo, objectif_mensuel, objectif_jour, icone, ordre)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [nom, categorie, type || 'checkbox', objectif_hebdo || 7, objectif_mensuel || 30, parseFloat(objectif_jour) || 1, icone || '', ordre || 0]
  );
  res.json({ id: r.rows[0].id });
});

// PUT routine
router.put('/:id', async (req, res) => {
  const { nom, categorie, type, objectif_hebdo, objectif_mensuel, objectif_jour, icone, ordre } = req.body;
  await query(
    `UPDATE routines SET nom=$1, categorie=$2, type=$3, objectif_hebdo=$4, objectif_mensuel=$5, objectif_jour=$6, icone=$7, ordre=$8 WHERE id=$9`,
    [nom, categorie, type || 'checkbox', objectif_hebdo || 7, objectif_mensuel || 30, parseFloat(objectif_jour) || 1, icone || '', ordre || 0, req.params.id]
  );
  res.json({ ok: true });
});

// DELETE routine
router.delete('/:id', async (req, res) => {
  await query('UPDATE routines SET actif=0 WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
