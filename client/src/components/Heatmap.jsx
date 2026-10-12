import { useEffect, useState } from 'react';
import { api } from '../utils/api';

export default function Heatmap() {
  const [data, setData] = useState({});

  useEffect(() => {
    api.get('/logs/stats').then(s => {
      const map = {};
      (s?.last30 || []).forEach(d => { map[d.date] = d.count; });
      setData(map);
    });
  }, []);

  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const ds = d.toISOString().slice(0, 10);
    days.push({ date: ds, count: data[ds] || 0, label: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) });
  }

  const max = Math.max(...days.map(d => d.count), 1);

  return (
    <div>
      <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: 16 }}>🗓 Activité sur 30 jours</h3>
      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(15, 1fr)' }}>
        {days.map(d => {
          const intensity = d.count / max;
          return (
            <div key={d.date} title={`${d.label}: ${d.count}`}
              className="aspect-square rounded-sm cursor-pointer transition-all hover:opacity-80"
              style={{
                background: d.count === 0
                  ? 'rgba(255,255,255,0.06)'
                  : `rgba(99,102,241,${0.2 + intensity * 0.8})`
              }} />
          );
        })}
      </div>
      <div className="flex items-center justify-end gap-2 mt-2">
        <span className="text-xs text-white/30">Moins</span>
        {[0.1, 0.3, 0.5, 0.7, 1].map(i => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ background: `rgba(99,102,241,${i})` }} />
        ))}
        <span className="text-xs text-white/30">Plus</span>
      </div>
    </div>
  );
}
