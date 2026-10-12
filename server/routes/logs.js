const express = require('express');
const router = express.Router();
const { query } = require('../database');

function getDateStr(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

// IMPORTANT: routes spécifiques avant /:date
// GET stats
router.get('/stats', async (req, res) => {
  try {
  const today = getDateStr(0);
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  const monday = d.toISOString().slice(0, 10);
  const monthStart = today.slice(0, 8) + '01';

  const routines = (await query('SELECT * FROM routines WHERE actif=1')).rows;

  let scoreJourNum = 0;
  const catMap = {};
  for (const r of routines) {
    const log = (await query('SELECT valeur FROM logs WHERE routine_id=$1 AND date=$2', [r.id, today])).rows[0];
    const val = log ? parseFloat(log.valeur) : 0;
    const obj = r.objectif_jour > 0 ? r.objectif_jour : 1;
    const pct = Math.min(val / obj, 1);
    scoreJourNum += pct;
    if (!catMap[r.categorie]) catMap[r.categorie] = { done: 0, total: 0 };
    catMap[r.categorie].total++;
    if (pct >= 1) catMap[r.categorie].done++;
  }
  const scoreJour = routines.length > 0 ? Math.round((scoreJourNum / routines.length) * 100) : 0;

  let sWeekNum = 0;
  for (const r of routines) {
    const logs = (await query('SELECT SUM(valeur) as total FROM logs WHERE routine_id=$1 AND date>=$2 AND date<=$3', [r.id, monday, today])).rows[0];
    const val = parseFloat(logs.total) || 0;
    sWeekNum += Math.min(val / (r.objectif_hebdo || 7), 1);
  }
  const scoreSemaine = routines.length > 0 ? Math.round((sWeekNum / routines.length) * 100) : 0;

  let sMonthNum = 0;
  for (const r of routines) {
    const logs = (await query('SELECT SUM(valeur) as total FROM logs WHERE routine_id=$1 AND date>=$2 AND date<=$3', [r.id, monthStart, today])).rows[0];
    const val = parseFloat(logs.total) || 0;
    sMonthNum += Math.min(val / (r.objectif_mensuel || 30), 1);
  }
  const scoreMois = routines.length > 0 ? Math.round((sMonthNum / routines.length) * 100) : 0;

  // Streak
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const dStr = getDateStr(-i);
    const count = (await query('SELECT COUNT(*) as c FROM logs WHERE date=$1', [dStr])).rows[0];
    if (parseInt(count.c) > 0) streak++;
    else break;
  }

  const totalDone = parseInt((await query('SELECT COUNT(*) as c FROM logs')).rows[0].c);

  const last30 = (await query(`
    SELECT date, COUNT(*) as count FROM logs
    WHERE date >= CURRENT_DATE - INTERVAL '29 days'
    GROUP BY date ORDER BY date
  `)).rows;

  const xpPerAction = 10;
  const totalXP = totalDone * xpPerAction + streak * 5;
  const niveau = Math.floor(totalXP / 500) + 1;
  const xpCurrent = totalXP % 500;
  const xpNext = 500;

  const cats = (await query('SELECT * FROM categories')).rows;
  const catStats = cats.map(c => {
    const data = catMap[c.nom] || { done: 0, total: 0 };
    return { nom: c.nom, couleur: c.couleur, done: data.done, total: data.total, pct: data.total > 0 ? Math.round((data.done / data.total) * 100) : 0 };
  }).filter(c => c.total > 0);

  // Update badges
  const badges = (await query('SELECT * FROM badges')).rows;
  for (const b of badges) {
    let unlocked = false;
    if (b.condition_type === 'streak' && streak >= b.condition_valeur) unlocked = true;
    if (b.condition_type === 'total_done' && totalDone >= b.condition_valeur) unlocked = true;
    await query('UPDATE badges SET debloque=$1 WHERE id=$2', [unlocked ? 1 : 0, b.id]);
  }

  res.json({ scoreJour, scoreSemaine, scoreMois, streak, totalDone, last30, niveau, xpCurrent, xpNext, catStats });
  } catch(e) {
    console.error('Stats error:', e.message);
    res.json({ scoreJour: 0, scoreSemaine: 0, scoreMois: 0, streak: 0, totalDone: 0, last30: [], niveau: 1, xpCurrent: 0, xpNext: 500, catStats: [] });
  }
});

// GET monthly-progress
router.get('/monthly-progress', async (req, res) => {
  const today = getDateStr(0);
  const monthStart = today.slice(0, 8) + '01';
  const routines = (await query("SELECT * FROM routines WHERE actif=1 AND type != 'checkbox'")).rows;
  const progress = await Promise.all(routines.map(async r => {
    const log = (await query('SELECT SUM(valeur) as total FROM logs WHERE routine_id=$1 AND date>=$2 AND date<=$3', [r.id, monthStart, today])).rows[0];
    const total = parseFloat(log.total) || 0;
    const pct = r.objectif_mensuel > 0 ? Math.min(100, Math.round((total / r.objectif_mensuel) * 100)) : 0;
    return { id: r.id, nom: r.nom, type: r.type, total, objectif_mensuel: r.objectif_mensuel, pct };
  }));
  res.json(progress);
});

// GET logs pour une date
router.get('/:date', async (req, res) => {
  const r = await query('SELECT * FROM logs WHERE date=$1', [req.params.date]);
  res.json(r.rows);
});

// POST/PUT log
router.post('/', async (req, res) => {
  const { routine_id, date, valeur } = req.body;
  if (valeur === null || valeur === undefined || valeur === 0) {
    await query('DELETE FROM logs WHERE routine_id=$1 AND date=$2', [routine_id, date]);
  } else {
    await query(
      `INSERT INTO logs (routine_id, date, valeur) VALUES ($1,$2,$3)
       ON CONFLICT (routine_id, date) DO UPDATE SET valeur=EXCLUDED.valeur`,
      [routine_id, date, valeur]
    );
  }
  res.json({ ok: true });
});

// DELETE log
router.delete('/:routine_id/:date', async (req, res) => {
  await query('DELETE FROM logs WHERE routine_id=$1 AND date=$2', [req.params.routine_id, req.params.date]);
  res.json({ ok: true });
});

module.exports = router;
