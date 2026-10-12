const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

async function initDB() {
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      nom TEXT NOT NULL,
      couleur TEXT DEFAULT '#6366f1',
      ordre INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS routines (
      id SERIAL PRIMARY KEY,
      nom TEXT NOT NULL,
      categorie TEXT NOT NULL,
      type TEXT DEFAULT 'checkbox',
      objectif_hebdo REAL DEFAULT 7,
      objectif_mensuel REAL DEFAULT 30,
      objectif_jour REAL DEFAULT 1,
      icone TEXT DEFAULT '',
      actif INTEGER DEFAULT 1,
      ordre INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS logs (
      id SERIAL PRIMARY KEY,
      routine_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      valeur REAL DEFAULT 1,
      UNIQUE(routine_id, date),
      FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS journal (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      victoires TEXT DEFAULT '[]',
      objectifs TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS themes (
      id SERIAL PRIMARY KEY,
      nom TEXT NOT NULL,
      couleur_principale TEXT DEFAULT '#6366f1',
      couleur_secondaire TEXT DEFAULT '#8b5cf6',
      couleur_fond TEXT DEFAULT '#0f172a',
      couleur_cartes TEXT DEFAULT '#1e293b',
      couleur_texte TEXT DEFAULT '#f1f5f9',
      couleur_boutons TEXT DEFAULT '#6366f1',
      couleur_graphiques TEXT DEFAULT '#6366f1',
      preinstalle INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS badges (
      id SERIAL PRIMARY KEY,
      nom TEXT NOT NULL,
      description TEXT,
      icone TEXT DEFAULT '🏅',
      condition_type TEXT,
      condition_valeur INTEGER,
      debloque INTEGER DEFAULT 0
    );
  `);

  // Seed catégories
  const cats = await query('SELECT COUNT(*) as c FROM categories');
  if (parseInt(cats.rows[0].c) === 0) {
    await query(`INSERT INTO categories (nom, couleur, ordre) VALUES
      ('Santé', '#10b981', 1),
      ('Travail', '#6366f1', 2),
      ('Personnel', '#f59e0b', 3)`);
  }

  // Seed thèmes
  const themes = await query('SELECT COUNT(*) as c FROM themes WHERE preinstalle=1');
  if (parseInt(themes.rows[0].c) === 0) {
    await query(`INSERT INTO themes (nom, couleur_principale, couleur_secondaire, couleur_fond, couleur_cartes, couleur_texte, couleur_boutons, couleur_graphiques, preinstalle) VALUES
      ('Indigo Nuit', '#6366f1', '#8b5cf6', '#0f172a', '#1e293b', '#f1f5f9', '#6366f1', '#6366f1', 1),
      ('Émeraude', '#10b981', '#059669', '#0f172a', '#1e293b', '#f1f5f9', '#10b981', '#10b981', 1),
      ('Coucher de soleil', '#f59e0b', '#ef4444', '#0f172a', '#1e293b', '#f1f5f9', '#f59e0b', '#f59e0b', 1),
      ('Océan', '#0ea5e9', '#6366f1', '#0c1a2e', '#1e3a5f', '#e0f2fe', '#0ea5e9', '#0ea5e9', 1),
      ('AMOLED Black', '#6366f1', '#8b5cf6', '#000000', '#111111', '#ffffff', '#6366f1', '#6366f1', 1)`);
  }

  // Seed badges
  const bdg = await query('SELECT COUNT(*) as c FROM badges');
  if (parseInt(bdg.rows[0].c) === 0) {
    await query(`INSERT INTO badges (nom, description, icone, condition_type, condition_valeur) VALUES
      ('Premier pas', 'Complète ta première routine', '🌱', 'total_done', 1),
      ('Semaine parfaite', '7 jours consécutifs', '⭐', 'streak', 7),
      ('Mois de feu', '30 jours consécutifs', '🔥', 'streak', 30),
      ('Centenaire', '100 routines complétées', '💯', 'total_done', 100),
      ('Régulier', '50 routines complétées', '🎯', 'total_done', 50),
      ('Machine', '200 routines complétées', '🤖', 'total_done', 200)`);
  }

  console.log('✅ DB initialisée');
}

module.exports = { query, initDB };
