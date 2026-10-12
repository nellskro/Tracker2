import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../utils/api';
import { getQuoteOfDay } from '../utils/quotes';
import { CircleProgress, Badge, XPBar, LoadingSpinner } from '../components/UI';
import Heatmap from '../components/Heatmap';

const G = {
  card: {
    background: 'rgba(255,255,255,0.055)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.11)',
    borderRadius: 20,
    boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.09)',
    position: 'relative', overflow: 'hidden',
  },
  label: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' },
};

function GlassCard({ children, style, ...props }) {
  return (
    <div style={{ ...G.card, ...style }} {...props}>
      {/* shimmer top-left */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 20, background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 45%)', pointerEvents: 'none' }} />
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [journal, setJournal] = useState({ victoires: [] });
  const [monthlyProgress, setMonthlyProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const quote = getQuoteOfDay();
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    Promise.all([
      api.get('/logs/stats'),
      api.get('/badges'),
      api.get(`/journal/${today}`),
      api.get('/logs/monthly-progress')
    ]).then(([s, b, j, mp]) => {
      setStats(s); setBadges(b); setJournal(j); setMonthlyProgress(mp);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return <div style={{ padding: 40, color: 'rgba(255,255,255,0.4)' }}>Erreur de chargement</div>;

  const primary = '#6366f1';

  const last30Map = {};
  (stats.last30 || []).forEach(d => { last30Map[d.date] = d.count; });
  const chartData = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const ds = d.toISOString().slice(0, 10);
    chartData.push({ date: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), done: last30Map[ds] || 0 });
  }

  const deblockedBadges = badges.filter(b => b.debloque);

  return (
    <div style={{ padding: '24px 16px', maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Citation */}
      <GlassCard style={{ padding: '18px 22px', borderLeft: `3px solid ${primary}` }}>
        <div style={G.label}>✨ Citation du jour</div>
        <p style={{ marginTop: 8, fontSize: 14, fontStyle: 'italic', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>"{quote}"</p>
      </GlassCard>

      {/* Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Score du jour', pct: stats.scoreJour, color: primary },
          { label: 'Score semaine', pct: stats.scoreSemaine, color: '#10b981' },
          { label: 'Score mois', pct: stats.scoreMois, color: '#f59e0b' },
        ].map(s => (
          <GlassCard key={s.label} style={{ padding: '22px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={G.label}>{s.label}</div>
            <CircleProgress pct={s.pct} size={110} color={s.color} />
          </GlassCard>
        ))}
        {/* Streak */}
        <GlassCard style={{ padding: '22px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={G.label}>Série actuelle</div>
          <div style={{ fontSize: 48, lineHeight: 1, filter: 'drop-shadow(0 0 12px rgba(239,68,68,0.6))' }}>🔥</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>{stats.streak}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>jours consécutifs</div>
        </GlassCard>
      </div>

      {/* Total + Victoires */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <GlassCard style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={G.label}>Total réalisé</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--color-text)', marginTop: 6, lineHeight: 1 }}>{stats.totalDone}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>routines validées</div>
          </div>
          <div style={{ fontSize: 48, opacity: 0.15 }}>🎯</div>
        </GlassCard>

        <GlassCard style={{ padding: '20px 22px' }}>
          <div style={{ ...G.label, marginBottom: 14 }}>🏆 Victoires du jour</div>
          {(journal.victoires || []).length === 0 ? (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>Aucune victoire enregistrée.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {journal.victoires.map((v, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
                  <span style={{ color: primary, fontWeight: 700, marginTop: 1 }}>→</span>
                  <span style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Chart 30j */}
      <GlassCard style={{ padding: '22px' }}>
        <div style={{ ...G.label, marginBottom: 16 }}>Évolution sur 30 jours</div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primary} stopOpacity={0.35} />
                <stop offset="95%" stopColor={primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: 'rgba(15,16,28,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, backdropFilter: 'blur(12px)' }}
              labelStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              itemStyle={{ color: primary }} />
            <Area type="monotone" dataKey="done" stroke={primary} fill="url(#areaGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Stats catégories */}
      {stats.catStats?.length > 0 && (
        <GlassCard style={{ padding: '22px' }}>
          <div style={{ ...G.label, marginBottom: 18 }}>Statistiques par catégorie (aujourd'hui)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20 }}>
            {stats.catStats.map(cat => (
              <div key={cat.nom}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: cat.couleur }}>{cat.nom}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{cat.done}/{cat.total}</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{ height: '100%', borderRadius: 3, width: `${cat.pct}%`, background: cat.couleur, transition: 'width 0.7s ease', boxShadow: `0 0 8px ${cat.couleur}60` }} />
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{cat.pct}%</div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Progression mensuelle */}
      {monthlyProgress.length > 0 && (
        <GlassCard style={{ padding: '22px' }}>
          <div style={{ ...G.label, marginBottom: 18 }}>📊 Progression mensuelle</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {monthlyProgress.map(r => (
              <div key={r.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{r.nom}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    {r.total}{r.type === 'temps' ? 'min' : ''} / {r.objectif_mensuel}{r.type === 'temps' ? 'min' : ''}
                  </span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 5 }}>
                  <div style={{ height: '100%', borderRadius: 3, width: `${r.pct}%`, background: primary, transition: 'width 0.7s ease', boxShadow: `0 0 8px ${primary}50` }} />
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{r.pct}%</div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Heatmap */}
      <GlassCard style={{ padding: '22px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <Heatmap />
      </GlassCard>

      {/* XP */}
      <GlassCard style={{ padding: '20px 22px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <XPBar niveau={stats.niveau} xpCurrent={stats.xpCurrent} xpNext={stats.xpNext} />
      </GlassCard>

      {/* Badges */}
      <div>
        <div style={{ ...G.label, marginBottom: 14 }}>Badges ({deblockedBadges.length}/{badges.length})</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {badges.map(b => (
            <GlassCard key={b.id} style={{ padding: '16px', opacity: b.debloque ? 1 : 0.45 }}>
              <Badge icon={b.icone} nom={b.nom} description={b.description} debloque={b.debloque} />
            </GlassCard>
          ))}
        </div>
      </div>

    </div>
  );
}
