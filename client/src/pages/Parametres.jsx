import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { Modal, Input, Select } from '../components/UI';

// ─── Routines Manager ───────────────────────────────────────────────────────

const EMOJIS = ['💪','🏃','🧘','🥗','💧','😴','📚','✍️','🎯','🎵','🎨','💻','🏋️','🚴','🧠','❤️','🔥','⚡','🌟','🏆','🥊','🧘‍♂️','🍎','☕','🚶','🤸','🏊','🎸','📝','🙏','🌅','🌙','💊','🫁','🦷','🪴','🐕','📖','🎮','🛏️'];

function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <label className="text-xs text-white/50 block mb-1">Icône</label>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-12 h-10 rounded-lg text-xl flex items-center justify-center border border-white/10 hover:border-white/30 transition-colors"
        style={{ background: 'rgba(255,255,255,0.05)' }}>
        {value || '➕'}
      </button>
      {open && (
        <div className="absolute z-50 top-14 left-0 p-3 rounded-xl border border-white/10 shadow-xl"
          style={{ background: 'var(--color-card)', width: 280 }}>
          <div className="grid grid-cols-8 gap-1">
            {EMOJIS.map(e => (
              <button key={e} type="button"
                onClick={() => { onChange(e); setOpen(false); }}
                className="w-8 h-8 text-lg rounded hover:bg-white/10 flex items-center justify-center transition-colors">
                {e}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => { onChange(''); setOpen(false); }}
            className="mt-2 w-full text-xs text-white/30 hover:text-white/60 py-1">
            Effacer l'icône
          </button>
        </div>
      )}
    </div>
  );
}

function RoutineForm({ initial, categories, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { nom: '', categorie: '', type: 'checkbox', objectif_hebdo: 7, objectif_mensuel: 30, objectif_jour: 1, icone: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3 items-end">
        <EmojiPicker value={form.icone} onChange={v => set('icone', v)} />
        <div className="flex-1">
          <Input label="Nom de la routine" value={form.nom} onChange={e => set('nom', e.target.value)} placeholder="ex: Sport" />
        </div>
      </div>
      <Select label="Catégorie" value={form.categorie} onChange={e => set('categorie', e.target.value)}>
        <option value="">Choisir...</option>
        {categories.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
      </Select>
      <Select label="Type" value={form.type} onChange={e => set('type', e.target.value)}>
        <option value="checkbox">Checkbox (oui/non)</option>
        <option value="nombre">Nombre</option>
        <option value="temps">Temps (minutes)</option>
      </Select>
      <div className="grid grid-cols-3 gap-3">
        <Input label="Objectif / jour" type="number" value={form.objectif_jour} onChange={e => set('objectif_jour', e.target.value)} />
        <Input label="Objectif hebdo" type="number" value={form.objectif_hebdo} onChange={e => set('objectif_hebdo', e.target.value)} />
        <Input label="Objectif mensuel" type="number" value={form.objectif_mensuel} onChange={e => set('objectif_mensuel', e.target.value)} />
      </div>
      <div className="flex gap-2 justify-end mt-2">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-white/10 text-sm">Annuler</button>
        <button className="btn-primary text-sm" onClick={() => form.nom && form.categorie && onSave(form)}>
          {initial ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </div>
  );
}

function RoutinesSection({ routines, categories, onReload }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);

  async function handleAdd(form) {
    await api.post('/routines', form);
    setShowAdd(false);
    onReload();
  }

  async function handleEdit(id, form) {
    await api.put(`/routines/${id}`, { ...form, ordre: form.ordre || 0 });
    setEditingId(null);
    onReload();
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette routine ?')) return;
    await api.delete(`/routines/${id}`);
    onReload();
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Routines</h3>
        <button className="btn-primary text-sm" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? '✕ Annuler' : '+ Ajouter'}
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <RoutineForm categories={categories} onSave={handleAdd} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {routines.map(r => (
          <div key={r.id}>
            {editingId === r.id ? (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <RoutineForm initial={r} categories={categories}
                  onSave={form => handleEdit(r.id, form)}
                  onCancel={() => setEditingId(null)} />
              </div>
            ) : (
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 group">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{r.nom}</div>
                  <div className="text-xs text-white/40">{r.categorie} · {r.type} · hebdo: {r.objectif_hebdo}</div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingId(r.id)} className="px-2 py-1 rounded text-xs bg-white/10 hover:bg-white/20">✏️</button>
                  <button onClick={() => handleDelete(r.id)} className="px-2 py-1 rounded text-xs bg-red-500/20 hover:bg-red-500/40 text-red-400">🗑</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Categories Manager ─────────────────────────────────────────────────────

function CategoriesSection({ categories, onReload }) {
  const [form, setForm] = useState({ nom: '', couleur: '#6366f1' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  async function handleAdd() {
    if (!form.nom) return;
    await api.post('/routines/categories', form);
    setForm({ nom: '', couleur: '#6366f1' });
    onReload();
  }

  async function handleEdit(id) {
    await api.put(`/routines/categories/${id}`, editForm);
    setEditingId(null);
    onReload();
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette catégorie ?')) return;
    await api.delete(`/routines/categories/${id}`);
    onReload();
  }

  return (
    <div className="card p-5">
      <h3 className="font-medium mb-4">Catégories</h3>
      <div className="flex gap-2 mb-4">
        <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
          placeholder="Nom de la catégorie"
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none text-sm"
          style={{ color: 'var(--color-text)' }} />
        <input type="color" value={form.couleur} onChange={e => setForm(f => ({ ...f, couleur: e.target.value }))}
          className="w-10 h-10 rounded-lg cursor-pointer border-0" />
        <button onClick={handleAdd} className="btn-primary text-sm">Ajouter</button>
      </div>
      <div className="flex flex-col gap-2">
        {categories.map(c => (
          <div key={c.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 group">
            {editingId === c.id ? (
              <>
                <input value={editForm.nom || ''} onChange={e => setEditForm(f => ({ ...f, nom: e.target.value }))}
                  className="flex-1 px-2 py-1 rounded bg-white/10 text-sm outline-none" style={{ color: 'var(--color-text)' }} />
                <input type="color" value={editForm.couleur || c.couleur} onChange={e => setEditForm(f => ({ ...f, couleur: e.target.value }))}
                  className="w-8 h-8 rounded cursor-pointer border-0" />
                <button onClick={() => handleEdit(c.id)} className="text-xs px-2 py-1 rounded bg-green-500/30 text-green-300">✓</button>
                <button onClick={() => setEditingId(null)} className="text-xs px-2 py-1 rounded bg-white/10">✕</button>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.couleur }} />
                <span className="flex-1 text-sm">{c.nom}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingId(c.id); setEditForm({ nom: c.nom, couleur: c.couleur }); }}
                    className="px-2 py-1 rounded text-xs bg-white/10 hover:bg-white/20">✏️</button>
                  <button onClick={() => handleDelete(c.id)} className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">🗑</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Theme Editor ────────────────────────────────────────────────────────────

const COLOR_FIELDS = [
  { key: 'couleur_principale', label: 'Couleur principale' },
  { key: 'couleur_secondaire', label: 'Couleur secondaire' },
  { key: 'couleur_fond', label: 'Fond' },
  { key: 'couleur_cartes', label: 'Cartes' },
  { key: 'couleur_texte', label: 'Texte' },
  { key: 'couleur_boutons', label: 'Boutons' },
  { key: 'couleur_graphiques', label: 'Graphiques' },
];

function ThemeSection() {
  const { activateTheme, colorMode, setColorMode } = useTheme();
  const [themes, setThemes] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editorForm, setEditorForm] = useState({
    nom: 'Mon thème',
    couleur_principale: '#6366f1', couleur_secondaire: '#8b5cf6',
    couleur_fond: '#0f172a', couleur_cartes: '#1e293b',
    couleur_texte: '#f1f5f9', couleur_boutons: '#6366f1', couleur_graphiques: '#6366f1'
  });
  const [editingThemeId, setEditingThemeId] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadThemes(); }, []);

  async function loadThemes() {
    const t = await api.get('/themes');
    setThemes(t);
  }

  function previewTheme(theme) {
    activateTheme(theme);
  }

  async function saveTheme() {
    if (editingThemeId) {
      await api.put(`/themes/${editingThemeId}`, editorForm);
    } else {
      await api.post('/themes', editorForm);
    }
    await loadThemes();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setShowEditor(false);
    setEditingThemeId(null);
  }

  async function deleteTheme(id) {
    if (!confirm('Supprimer ce thème ?')) return;
    await api.delete(`/themes/${id}`);
    loadThemes();
  }

  function startEdit(theme) {
    setEditorForm({ nom: theme.nom, couleur_principale: theme.couleur_principale, couleur_secondaire: theme.couleur_secondaire, couleur_fond: theme.couleur_fond, couleur_cartes: theme.couleur_cartes, couleur_texte: theme.couleur_texte, couleur_boutons: theme.couleur_boutons, couleur_graphiques: theme.couleur_graphiques });
    setEditingThemeId(theme.id);
    setShowEditor(true);
  }

  const preinstalled = themes.filter(t => t.preinstalle);
  const custom = themes.filter(t => !t.preinstalle);

  return (
    <div className="card p-5">
      <h3 className="font-medium mb-4">Apparence & Thèmes</h3>

      {/* Color mode */}
      <div className="mb-5">
        <div className="text-sm text-white/60 mb-2">Mode de couleur</div>
        <div className="flex gap-2">
          {[['dark', '🌙 Sombre'], ['light', '☀️ Clair'], ['system', '💻 Système']].map(([val, label]) => (
            <button key={val} onClick={() => setColorMode(val)}
              className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
              style={colorMode === val ? { background: 'var(--color-primary)', color: 'white' } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Preinstalled themes */}
      <div className="text-sm text-white/60 mb-2">Thèmes préinstallés</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {preinstalled.map(t => (
          <button key={t.id} onClick={() => previewTheme(t)}
            className="p-3 rounded-xl border border-white/10 hover:border-white/30 transition-all text-left"
            style={{ background: t.couleur_fond }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ background: t.couleur_principale }} />
              <div className="w-3 h-3 rounded-full" style={{ background: t.couleur_secondaire }} />
            </div>
            <div className="text-xs font-medium" style={{ color: t.couleur_texte }}>{t.nom}</div>
          </button>
        ))}
      </div>

      {/* Custom themes */}
      {custom.length > 0 && (
        <>
          <div className="text-sm text-white/60 mb-2">Mes thèmes</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {custom.map(t => (
              <div key={t.id} className="p-3 rounded-xl border border-white/10 relative group"
                style={{ background: t.couleur_fond }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: t.couleur_principale }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: t.couleur_secondaire }} />
                </div>
                <div className="text-xs font-medium" style={{ color: t.couleur_texte }}>{t.nom}</div>
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => previewTheme(t)} className="text-xs px-1 py-0.5 rounded bg-white/20">✓</button>
                  <button onClick={() => startEdit(t)} className="text-xs px-1 py-0.5 rounded bg-white/20">✏️</button>
                  <button onClick={() => deleteTheme(t.id)} className="text-xs px-1 py-0.5 rounded bg-red-500/40">✕</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <button onClick={() => { setShowEditor(!showEditor); setEditingThemeId(null); setEditorForm({ nom: 'Mon thème', couleur_principale: '#6366f1', couleur_secondaire: '#8b5cf6', couleur_fond: '#0f172a', couleur_cartes: '#1e293b', couleur_texte: '#f1f5f9', couleur_boutons: '#6366f1', couleur_graphiques: '#6366f1' }); }}
        className="btn-primary text-sm w-full">
        {showEditor ? '✕ Fermer l\'éditeur' : '+ Créer un thème'}
      </button>

      {showEditor && (
        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <Input label="Nom du thème" value={editorForm.nom} onChange={e => setEditorForm(f => ({ ...f, nom: e.target.value }))} className="mb-3" />
          <div className="grid grid-cols-2 gap-3 mb-4">
            {COLOR_FIELDS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <input type="color" value={editorForm[key]}
                  onChange={e => {
                    const val = e.target.value;
                    setEditorForm(f => ({ ...f, [key]: val }));
                    // Live preview
                    const map = { couleur_principale: '--color-primary', couleur_secondaire: '--color-secondary', couleur_fond: '--color-bg', couleur_cartes: '--color-card', couleur_texte: '--color-text', couleur_boutons: '--color-buttons', couleur_graphiques: '--color-graphs' };
                    document.documentElement.style.setProperty(map[key], val);
                  }}
                  className="w-8 h-8 rounded cursor-pointer border-0" />
                <span className="text-xs text-white/60">{label}</span>
              </div>
            ))}
          </div>
          <button onClick={saveTheme} className="btn-primary text-sm w-full">
            {editingThemeId ? 'Modifier le thème' : 'Sauvegarder le thème'}
          </button>
          {saved && <div className="text-xs text-green-400 text-center mt-2">✓ Sauvegardé</div>}
        </div>
      )}
    </div>
  );
}

// ─── Export/Import ───────────────────────────────────────────────────────────

function ExportSection() {
  const [importStatus, setImportStatus] = useState('');

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await api.post('/export/import', data);
      setImportStatus('✓ Import réussi !');
      setTimeout(() => setImportStatus(''), 3000);
    } catch {
      setImportStatus('❌ Erreur lors de l\'import');
    }
  }

  return (
    <div className="card p-5">
      <h3 className="font-medium mb-4">Export / Import</h3>
      <div className="flex flex-col gap-3">
        <a href="/api/export/csv" download className="btn-primary text-sm text-center block">
          📥 Exporter CSV
        </a>
        <a href="/api/export/json" download className="btn-primary text-sm text-center block" style={{ background: 'rgba(99,102,241,0.3)' }}>
          📥 Exporter JSON
        </a>
        <label className="px-4 py-2 rounded-lg border border-white/20 text-sm text-center cursor-pointer hover:bg-white/5 transition-colors">
          📤 Importer JSON
          <input type="file" accept=".json" className="hidden" onChange={handleImport} />
        </label>
        {importStatus && <div className="text-sm text-center" style={{ color: importStatus.startsWith('✓') ? '#10b981' : '#ef4444' }}>{importStatus}</div>}
      </div>
    </div>
  );
}

// ─── Notifications ───────────────────────────────────────────────────────────

function NotificationsSection() {
  const [times, setTimes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('notifTimes') || '["09:00","20:00"]'); } catch { return ['09:00', '20:00']; }
  });
  const [enabled, setEnabled] = useState(() => localStorage.getItem('notifEnabled') === 'true');

  async function requestPermission() {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setEnabled(true);
        localStorage.setItem('notifEnabled', 'true');
      }
    }
  }

  function saveTimes(t) {
    setTimes(t);
    localStorage.setItem('notifTimes', JSON.stringify(t));
  }

  function addTime() { saveTimes([...times, '12:00']); }
  function removeTime(i) { saveTimes(times.filter((_, idx) => idx !== i)); }
  function updateTime(i, val) { const t = [...times]; t[i] = val; saveTimes(t); }

  return (
    <div className="card p-5">
      <h3 className="font-medium mb-4">Notifications de rappel</h3>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-white/60">Activer les rappels</span>
        <button onClick={enabled ? () => { setEnabled(false); localStorage.setItem('notifEnabled', 'false'); } : requestPermission}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={enabled ? { background: '#10b981', color: 'white' } : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
          {enabled ? '✓ Activé' : 'Activer'}
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {times.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="time" value={t} onChange={e => updateTime(i, e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none text-sm"
              style={{ color: 'var(--color-text)' }} />
            <button onClick={() => removeTime(i)} className="text-white/30 hover:text-white/70 text-lg">×</button>
          </div>
        ))}
        <button onClick={addTime} className="text-sm px-3 py-2 rounded-lg border border-dashed border-white/15 hover:border-white/30"
          style={{ color: 'var(--color-primary)' }}>
          + Ajouter un rappel
        </button>
      </div>
      <p className="text-xs text-white/30 mt-3">Les rappels fonctionnent si l'onglet est ouvert dans votre navigateur.</p>
    </div>
  );
}

// ─── Main Parametres Page ────────────────────────────────────────────────────

export default function Parametres() {
  const [routines, setRoutines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('routines');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [r, c] = await Promise.all([api.get('/routines'), api.get('/routines/categories')]);
    setRoutines(r);
    setCategories(c);
  }

  const TABS = [
    { id: 'routines', label: '✅ Routines' },
    { id: 'categories', label: '🏷 Catégories' },
    { id: 'apparence', label: '🎨 Apparence' },
    { id: 'export', label: '📦 Export' },
    { id: 'notifications', label: '🔔 Rappels' },
  ];

  return (
    <div className="p-6 flex flex-col gap-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold">Paramètres</h1>

      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={activeTab === tab.id ? { background: 'var(--color-primary)', color: 'white' } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'routines' && <RoutinesSection routines={routines} categories={categories} onReload={loadData} />}
      {activeTab === 'categories' && <CategoriesSection categories={categories} onReload={loadData} />}
      {activeTab === 'apparence' && <ThemeSection />}
      {activeTab === 'export' && <ExportSection />}
      {activeTab === 'notifications' && <NotificationsSection />}
    </div>
  );
}
