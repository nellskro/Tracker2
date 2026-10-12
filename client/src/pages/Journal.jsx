import { useEffect, useState, useCallback } from 'react';
import { api, formatDate } from '../utils/api';

function WinItem({ index, value, onChange, onRemove, color, placeholder }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Numéro */}
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: `${color}18`, border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 800, color: color,
      }}>
        {index + 1}
      </div>
      {/* Input */}
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1, padding: '10px 14px', borderRadius: 10,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          outline: 'none', fontSize: 14,
          color: 'var(--color-text)',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = `${color}60`}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
      />
      {/* Supprimer */}
      <button onClick={onRemove} style={{
        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: 'rgba(255,255,255,0.2)', fontSize: 18, lineHeight: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'color 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
      >×</button>
    </div>
  );
}

function Section({ icon, title, subtitle, color, items, onChange, placeholder }) {
  function updateItem(i, val) {
    const next = [...items];
    next[i] = val;
    onChange(next);
  }
  function addItem() { onChange([...items, '']); }
  function removeItem(i) { onChange(items.filter((_, idx) => idx !== i)); }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.055)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.11)',
      borderRadius: 20, padding: '24px 24px 20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.09)',
      borderTop: `3px solid ${color}`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{title}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{subtitle}</div>
        </div>
        {/* Compteur */}
        <div style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: color }}>
          {items.filter(s => s.trim()).length} / {items.length}
        </div>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item, i) => (
          <WinItem key={i} index={i} value={item} color={color}
            placeholder={placeholder}
            onChange={val => updateItem(i, val)}
            onRemove={() => removeItem(i)} />
        ))}
      </div>

      {/* Ajouter */}
      <button onClick={addItem} style={{
        marginTop: 14, width: '100%', padding: '9px',
        borderRadius: 10, border: `1px dashed ${color}40`,
        background: 'transparent', cursor: 'pointer',
        fontSize: 13, color: color, fontWeight: 600,
        transition: 'background 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = `${color}0d`}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        + Ajouter
      </button>
    </div>
  );
}

export default function Journal() {
  const today = formatDate();
  const tomorrow = formatDate(new Date(Date.now() + 86400000));

  const [selectedDate, setSelectedDate] = useState(today);
  const [victoires, setVictoires] = useState(['', '', '']);
  const [objectifs, setObjectifs] = useState(['', '', '']);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/journal/${selectedDate}`).then(data => {
      const v = data.victoires || [];
      const o = data.objectifs || [];
      setVictoires(v.length > 0 ? v : ['', '', '']);
      setObjectifs(o.length > 0 ? o : ['', '', '']);
      setLoading(false);
    });
  }, [selectedDate]);

  const save = useCallback(async (v, o) => {
    const clean = arr => arr.filter(s => s.trim());
    await api.put(`/journal/${selectedDate}`, { victoires: clean(v), objectifs: clean(o) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [selectedDate]);

  function handleVictoiresChange(v) { setVictoires(v); save(v, objectifs); }
  function handleObjectifsChange(o) { setObjectifs(o); save(victoires, o); }

  const isToday = selectedDate === today;

  return (
    <div style={{ padding: '24px 16px', maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)' }}>Journal</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
            {isToday ? "Aujourd'hui · " : 'Demain · '}
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        {saved && (
          <div style={{
            fontSize: 12, fontWeight: 600,
            padding: '6px 14px', borderRadius: 20,
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981', border: '1px solid rgba(16,185,129,0.3)',
          }}>
            ✓ Sauvegardé
          </div>
        )}
      </div>

      {/* Onglets Aujourd'hui / Demain */}
      <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4 }}>
        {[{ date: today, label: "Aujourd'hui" }, { date: tomorrow, label: 'Demain' }].map(({ date, label }) => (
          <button key={date} onClick={() => setSelectedDate(date)} style={{
            flex: 1, padding: '8px 0', borderRadius: 9,
            fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
            transition: 'all 0.2s',
            background: selectedDate === date ? 'var(--color-primary)' : 'transparent',
            color: selectedDate === date ? 'white' : 'rgba(255,255,255,0.45)',
          }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '40px 0' }}>Chargement...</div>
      ) : (
        <>
          <Section
            icon="🏆"
            title={isToday ? 'Victoires du jour' : 'Victoires de demain'}
            subtitle={isToday ? 'Ce que tu as accompli aujourd\'hui' : 'Ce que tu veux accomplir'}
            color="#f59e0b"
            items={victoires}
            onChange={handleVictoiresChange}
            placeholder="Une victoire..."
          />
          <Section
            icon="🎯"
            title={isToday ? 'Objectifs pour demain' : 'Objectifs pour après-demain'}
            subtitle="Prépare ta prochaine journée"
            color="#6366f1"
            items={objectifs}
            onChange={handleObjectifsChange}
            placeholder="Un objectif..."
          />
        </>
      )}
    </div>
  );
}
