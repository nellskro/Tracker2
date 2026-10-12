import { useEffect, useRef, useState, useCallback } from 'react';
import { api, formatDate } from '../utils/api';

const CAT_COLORS = { 'Santé': '#10b981', 'Travail': '#6366f1', 'Personnel': '#f59e0b' };
const CAT_ORDER = ['Santé', 'Travail', 'Personnel'];
const CHECK_COLOR = '#7c3aed';

function getWeekDays() {
  const days = [];
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const ds = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('fr-FR', { weekday: 'short' });
    days.push({
      date: ds,
      label: label.charAt(0).toUpperCase() + label.slice(1, 3),
      num: d.getDate(),
      isToday: ds === formatDate()
    });
  }
  return days;
}

function DayCell({ routine, log, day, onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('');
  const done = log && log.valeur > 0;
  const color = CHECK_COLOR;
  const holdTimer = useRef(null);
  const holdInterval = useRef(null);

  function startHold(delta) {
    holdTimer.current = setTimeout(() => {
      holdInterval.current = setInterval(() => {
        setVal(v => String(Math.max(0, (parseFloat(v) || 0) + delta)));
      }, 80);
    }, 400);
  }

  function stopHold() {
    clearTimeout(holdTimer.current);
    clearInterval(holdInterval.current);
  }

  function commit() {
    setEditing(false);
    const v = parseFloat(val);
    onSave(routine.id, day.date, isNaN(v) || v <= 0 ? null : v);
  }

  if (routine.type === 'checkbox') {
    return (
      <button
        onClick={() => onSave(routine.id, day.date, done ? null : 1)}
        style={{
          width: 56, height: 56, flexShrink: 0,
          borderRadius: 15,
          background: done ? color : 'rgba(255,255,255,0.06)',
          border: day.isToday ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.15s',
          boxShadow: done ? `0 0 12px ${color}60` : 'none',
        }}>
        {done && <span style={{ color: 'white', fontSize: 22, fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
      </button>
    );
  }

  if (editing) {
    return (
      <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
        <input autoFocus type="number" value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={e => e.key === 'Enter' && commit()}
          style={{
            width: '100%', height: '100%',
            borderRadius: 15, textAlign: 'center', fontSize: 15, fontWeight: 700,
            outline: 'none', background: 'rgba(255,255,255,0.1)',
            border: `2px solid ${color}`, color: 'white',
            WebkitAppearance: 'none', MozAppearance: 'textfield',
            appearance: 'none', padding: 0,
          }}
        />
        <style>{`
          input[type=number]::-webkit-inner-spin-button,
          input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
          input[type=number] { -moz-appearance: textfield; }
        `}</style>
        {/* Boutons +/- custom */}
        <div style={{ position: 'absolute', right: -28, top: 0, height: 44, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button type="button"
            onMouseDown={e => { e.preventDefault(); setVal(v => String((parseFloat(v) || 0) + 1)); startHold(1); }}
            onMouseUp={stopHold} onMouseLeave={stopHold}
            onTouchStart={e => { e.preventDefault(); setVal(v => String((parseFloat(v) || 0) + 1)); startHold(1); }}
            onTouchEnd={stopHold}
            style={{ width: 24, height: 20, borderRadius: 6, background: `${color}33`, border: `1px solid ${color}55`, color: color, fontSize: 13, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', lineHeight: 1 }}>
            +
          </button>
          <button type="button"
            onMouseDown={e => { e.preventDefault(); setVal(v => String(Math.max(0, (parseFloat(v) || 0) - 1))); startHold(-1); }}
            onMouseUp={stopHold} onMouseLeave={stopHold}
            onTouchStart={e => { e.preventDefault(); setVal(v => String(Math.max(0, (parseFloat(v) || 0) - 1))); startHold(-1); }}
            onTouchEnd={stopHold}
            style={{ width: 24, height: 20, borderRadius: 6, background: `${color}33`, border: `1px solid ${color}55`, color: color, fontSize: 15, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', lineHeight: 1 }}>
            −
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setVal(done ? String(log.valeur) : ''); setEditing(true); }}
      style={{
        width: 56, height: 56, flexShrink: 0,
        borderRadius: 15,
        background: done ? color : 'rgba(255,255,255,0.06)',
        border: day.isToday ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.15s',
        color: done ? 'white' : 'rgba(255,255,255,0.2)',
        fontSize: 13, fontWeight: 800,
        boxShadow: done ? `0 0 14px ${color}60` : 'none',
      }}>
      {done ? (routine.type === 'temps' ? `${log.valeur}m` : log.valeur) : '·'}
    </button>
  );
}

const EMOJI_PALETTE = [
  '💧','🥗','🍎','🥦','💊','🏃','💪','🧘','😴','🛏️',
  '📚','✏️','💡','🎯','🧠','💼','💻','📊','📝','🎵',
  '🎸','🎹','🎤','🏋️','⚽','🏊','🚴','🧗','🥊','🤸',
  '🌅','☀️','🌙','⭐','🔥','❤️','🙏','😊','🌿','🍵',
  '☕','🧘','🚶','🏆','🎉','💰','🛒','🧹','🚿','🪥',
];

// ─── RoutineRow ──────────────────────────────────────────────────────────────
function RoutineRow({ r, cat, days, logs, onSave, onUpdate }) {
  const color = CAT_COLORS[cat];

  // Extraire emoji du nom si icone vide
  const emojiMatch = r.nom.match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*/u);
  const baseEmoji = r.icone || (emojiMatch ? emojiMatch[1] : '');
  const baseNom = emojiMatch ? r.nom.replace(emojiMatch[0], '').trim() : r.nom;

  const [editEmoji, setEditEmoji] = useState(false);
  const [editNom, setEditNom] = useState(false);
  const [emojiVal, setEmojiVal] = useState(baseEmoji);
  const [nomVal, setNomVal] = useState(baseNom);
  const nomRef = useRef(null);
  const emojiRef = useRef(null);

  useEffect(() => { setEmojiVal(r.icone || (emojiMatch ? emojiMatch[1] : '')); }, [r.icone, r.nom]);
  useEffect(() => { setNomVal(emojiMatch ? r.nom.replace(emojiMatch[0], '').trim() : r.nom); }, [r.nom]);

  async function saveEmoji(val) {
    setEditEmoji(false);
    if (val === baseEmoji) return;
    await onUpdate(r.id, { ...r, icone: val, nom: baseNom });
  }

  async function saveNom() {
    setEditNom(false);
    if (nomVal.trim() === baseNom) return;
    await onUpdate(r.id, { ...r, nom: nomVal.trim(), icone: baseEmoji });
  }

  useEffect(() => { if (editNom && nomRef.current) nomRef.current.focus(); }, [editNom]);
  useEffect(() => { if (editEmoji && emojiRef.current) emojiRef.current.focus(); }, [editEmoji]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', borderRadius: 16, padding: '10px 12px', transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

      {/* Emoji badge — cliquable */}
      <div style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          onClick={() => setEditEmoji(true)}
          title="Changer l'emoji"
          style={{
            width: 50, height: 50, borderRadius: 14, flexShrink: 0,
            background: `${color}18`, border: `1px solid ${color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, cursor: 'pointer', transition: 'all 0.15s',
            boxShadow: `0 0 12px ${color}20`, position: 'relative',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${color}30`; e.currentTarget.style.borderColor = `${color}80`; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${color}18`; e.currentTarget.style.borderColor = `${color}40`; }}
        >
          {emojiVal || '✏️'}
          {/* Picker emoji */}
          {editEmoji && (
            <div onClick={e => e.stopPropagation()} style={{
              position: 'absolute', top: '110%', left: 0, zIndex: 100,
              background: 'rgba(12,13,22,0.98)', backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.13)', borderRadius: 16,
              padding: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
              width: 226,
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Choisir un emoji</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, maxHeight: 180, overflowY: 'auto', paddingRight: 2 }}>
                {EMOJI_PALETTE.map(e => (
                  <button key={e} onClick={() => saveEmoji(e)} style={{
                    width: 30, height: 30, borderRadius: 7, border: 'none',
                    background: e === emojiVal ? `${color}40` : 'rgba(255,255,255,0.05)',
                    cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.1s', outline: e === emojiVal ? `2px solid ${color}` : 'none',
                  }}
                    onMouseEnter={ev => ev.currentTarget.style.background = `${color}30`}
                    onMouseLeave={ev => ev.currentTarget.style.background = e === emojiVal ? `${color}40` : 'rgba(255,255,255,0.05)'}
                  >{e}</button>
                ))}
              </div>
              <button onClick={() => setEditEmoji(false)} style={{
                marginTop: 8, width: '100%', padding: '6px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer',
              }}>Fermer</button>
            </div>
          )}
        </div>

        {/* Nom — cliquable */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {editNom ? (
            <input
              ref={nomRef}
              value={nomVal}
              onChange={e => setNomVal(e.target.value)}
              onBlur={saveNom}
              onKeyDown={e => { if (e.key === 'Enter') saveNom(); if (e.key === 'Escape') { setNomVal(baseNom); setEditNom(false); } }}
              style={{
                fontSize: 17, fontWeight: 700, color: '#ffffff',
                letterSpacing: '-0.02em', fontFamily: "'Inter', sans-serif",
                background: 'rgba(255,255,255,0.07)', border: `1px solid ${color}60`,
                borderRadius: 8, padding: '4px 8px', outline: 'none',
                width: 140,
              }}
            />
          ) : (
            <div
              onClick={() => setEditNom(true)}
              title="Modifier le nom"
              style={{
                fontSize: 17, fontWeight: 700, color: '#ffffff',
                letterSpacing: '-0.02em', lineHeight: 1.2,
                fontFamily: "'Inter', sans-serif",
                cursor: 'text', borderRadius: 6, padding: '2px 4px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {nomVal || r.nom}
            </div>
          )}
          <div style={{ fontSize: 10, fontWeight: 600, color: `${color}90`, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{r.type}</div>
        </div>
      </div>

      {/* Cases jours */}
      <div style={{ display: 'flex', gap: 4 }}>
        {days.map(d => (
          <DayCell key={d.date} routine={r} log={logs[d.date]?.[r.id]} day={d} onSave={onSave} />
        ))}
      </div>
    </div>
  );
}

export default function Routines() {
  const [routines, setRoutines] = useState([]);
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const days = getWeekDays();
  const todayStr = formatDate();

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const r = await api.get('/routines');
    setRoutines(r || []);
    const allLogs = await Promise.all(days.map(d => api.get(`/logs/${d.date}`)));
    const logMap = {};
    days.forEach((d, i) => {
      logMap[d.date] = {};
      (allLogs[i] || []).forEach(l => { logMap[d.date][l.routine_id] = l; });
    });
    setLogs(logMap);
    setLoading(false);
  }

  async function handleSave(routineId, date, valeur) {
    await api.post('/logs', { routine_id: routineId, date, valeur });
    const l = await api.get(`/logs/${date}`);
    const dayMap = {};
    (l || []).forEach(log => { dayMap[log.routine_id] = log; });
    setLogs(prev => ({ ...prev, [date]: dayMap }));
  }

  async function handleUpdateRoutine(id, data) {
    await api.put(`/routines/${id}`, data);
    const r = await api.get('/routines');
    setRoutines(r || []);
  }

  // Barre de complétion par jour
  const dayCompletions = days.map(d => {
    const total = routines.length;
    if (total === 0) return { ...d, pct: 0 };
    const done = routines.filter(r => logs[d.date]?.[r.id]?.valeur > 0).length;
    return { ...d, pct: Math.round((done / total) * 100) };
  });

  // Stats par catégorie (semaine entière)
  const catStats = CAT_ORDER.map(cat => {
    const catRoutines = routines.filter(r => r.categorie === cat);
    let done = 0, total = 0;
    days.forEach(d => {
      catRoutines.forEach(r => {
        total++;
        if (logs[d.date]?.[r.id]?.valeur > 0) done++;
      });
    });
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { cat, done, total, pct, color: CAT_COLORS[cat] };
  }).filter(s => s.total > 0);

  const grouped = {};
  CAT_ORDER.forEach(c => { grouped[c] = []; });
  routines.forEach(r => {
    if (!grouped[r.categorie]) grouped[r.categorie] = [];
    grouped[r.categorie].push(r);
  });

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Chargement...</div>;

  return (
    <div style={{ padding: '20px 16px', maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Barre de complétion journalière ── */}
      <div style={{ background: 'rgba(255,255,255,0.055)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(255,255,255,0.11)', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.09)', padding: '18px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 14 }}>
          Complétion de la semaine
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          {dayCompletions.map(d => (
            <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: d.isToday ? CHECK_COLOR : 'rgba(255,255,255,0.4)' }}>
                {d.label}
              </span>
              {/* Barre verticale */}
              <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${d.pct}%`,
                  background: d.isToday ? CHECK_COLOR : 'rgba(255,255,255,0.25)',
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: d.isToday ? 'white' : 'rgba(255,255,255,0.5)' }}>
                {d.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Grille semaine ── */}
      <div>
        {/* Header jours */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6, paddingRight: 0 }}>
          <div style={{ flex: 1, minWidth: 160 }} />
          <div style={{ display: 'flex', gap: 4 }}>
            {days.map(d => (
              <div key={d.date} style={{ width: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 13, color: d.isToday ? CHECK_COLOR : 'rgba(255,255,255,0.5)', fontWeight: 700 }}>{d.label}</span>
                <span style={{
                  fontSize: 14, fontWeight: 800,
                  width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%',
                  background: d.isToday ? CHECK_COLOR : 'rgba(255,255,255,0.07)',
                  color: d.isToday ? 'white' : 'rgba(255,255,255,0.6)',
                  boxShadow: d.isToday ? `0 0 12px ${CHECK_COLOR}80` : 'none',
                }}>
                  {d.num}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Routines par catégorie */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {CAT_ORDER.filter(cat => (grouped[cat] || []).length > 0).map(cat => (
            <div key={cat}>
              {/* Titre catégorie */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: `${CAT_COLORS[cat]}20`,
                  border: `1px solid ${CAT_COLORS[cat]}50`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: CAT_COLORS[cat], boxShadow: `0 0 8px ${CAT_COLORS[cat]}` }} />
                </div>
                <span style={{
                  fontSize: 13, fontWeight: 800,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: CAT_COLORS[cat],
                  textShadow: `0 0 20px ${CAT_COLORS[cat]}60`,
                }}>
                  {cat}
                </span>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${CAT_COLORS[cat]}40, transparent)`, marginLeft: 4 }} />
              </div>

              {/* Lignes de routines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {grouped[cat].map(r => (
                  <RoutineRow key={r.id} r={r} cat={cat} days={days} logs={logs}
                    onSave={handleSave} onUpdate={handleUpdateRoutine} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Cartes récap par catégorie (en bas) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {catStats.map(s => (
          <div key={s.cat} style={{ background: 'rgba(255,255,255,0.055)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(255,255,255,0.11)', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.09)', padding: '18px 20px', borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.cat}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1.1, marginBottom: 4 }}>{s.pct}%</div>
            {/* Barre de progression */}
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', marginBottom: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, width: `${s.pct}%`, background: s.color, transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{s.done} / {s.total} cette semaine</div>
          </div>
        ))}
      </div>

    </div>
  );
}
