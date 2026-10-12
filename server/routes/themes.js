const express = require('express');
const router = express.Router();
const { query } = require('../database');

router.get('/', async (req, res) => {
  const r = await query('SELECT * FROM themes ORDER BY preinstalle DESC, id');
  res.json(r.rows);
});

router.post('/', async (req, res) => {
  const { nom, couleur_principale, couleur_secondaire, couleur_fond, couleur_cartes, couleur_texte, couleur_boutons, couleur_graphiques } = req.body;
  const r = await query(
    `INSERT INTO themes (nom,couleur_principale,couleur_secondaire,couleur_fond,couleur_cartes,couleur_texte,couleur_boutons,couleur_graphiques,preinstalle)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,0) RETURNING id`,
    [nom, couleur_principale, couleur_secondaire, couleur_fond, couleur_cartes, couleur_texte, couleur_boutons, couleur_graphiques]
  );
  res.json({ id: r.rows[0].id });
});

router.put('/:id', async (req, res) => {
  const { nom, couleur_principale, couleur_secondaire, couleur_fond, couleur_cartes, couleur_texte, couleur_boutons, couleur_graphiques } = req.body;
  await query(
    `UPDATE themes SET nom=$1,couleur_principale=$2,couleur_secondaire=$3,couleur_fond=$4,couleur_cartes=$5,couleur_texte=$6,couleur_boutons=$7,couleur_graphiques=$8 WHERE id=$9`,
    [nom, couleur_principale, couleur_secondaire, couleur_fond, couleur_cartes, couleur_texte, couleur_boutons, couleur_graphiques, req.params.id]
  );
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  await query('DELETE FROM themes WHERE id=$1 AND preinstalle=0', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
