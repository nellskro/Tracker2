const express = require('express');
const router = express.Router();
const { query } = require('../database');

router.get('/', async (req, res) => {
  const r = await query('SELECT * FROM badges ORDER BY id');
  res.json(r.rows);
});

module.exports = router;
