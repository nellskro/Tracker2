// ─── CircleProgress ──────────────────────────────────────────────────────────
export function CircleProgress({ pct = 0, size = 130, color = '#6366f1' }) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const center = size / 2;
  const fontSize = size / 3.8;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
        {/* Track */}
        <circle cx={center} cy={center} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        {/* Glow ring */}
        {pct > 0 && (
          <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={stroke + 4}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" opacity={0.15} />
        )}
        {/* Progress */}
        <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${color}80)` }} />
      </svg>
      {/* Texte centré en dehors du SVG pour utiliser les vraies polices web */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontSize: fontSize,
          fontWeight: 800,
          color: color,
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '-0.03em',
          lineHeight: 1,
          filter: `drop-shadow(0 0 8px ${color}60)`,
        }}>
          {pct}<span style={{ fontSize: fontSize * 0.55, fontWeight: 700, opacity: 0.8 }}>%</span>
        </span>
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, color, sub }) {
  return (
    <div className="card p-6 flex flex-col gap-3 animate-fadeIn" style={{ minHeight: 200 }}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50 uppercase tracking-wider font-medium">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>{value}</span>
      </div>
      {sub && <span className="text-xs text-white/30 text-center">{sub}</span>}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ icon, nom, description, debloque }) {
  return (
    <div className={`card p-4 flex items-center gap-3 transition-all ${debloque ? '' : 'opacity-40 grayscale'}`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: debloque ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)' }}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium" style={{ color: debloque ? 'var(--color-text)' : 'rgba(255,255,255,0.5)' }}>{nom}</div>
        <div className="text-xs text-white/30">{description}</div>
        {debloque && <div className="text-xs mt-1" style={{ color: '#10b981' }}>✓ Débloqué</div>}
      </div>
    </div>
  );
}

// ─── XPBar ───────────────────────────────────────────────────────────────────
export function XPBar({ niveau = 1, xpCurrent = 0, xpNext = 500 }) {
  const pct = Math.round((xpCurrent / xpNext) * 100);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>⚡ Niveau {niveau}</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{xpCurrent} / {xpNext} XP</span>
      </div>
      <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 6, width: `${pct}%`, background: 'var(--color-primary)', transition: 'width 0.7s ease' }} />
      </div>
    </div>
  );
}

// ─── LoadingSpinner ───────────────────────────────────────────────────────────
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="w-8 h-8 rounded-full border-2 border-white/20 animate-spin"
        style={{ borderTopColor: 'var(--color-primary)' }} />
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="card p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-white/50">{label}</label>}
      <input {...props} style={{ color: 'var(--color-text)', ...props.style }} />
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────
export function Select({ label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-white/50">{label}</label>}
      <select {...props} style={{ color: 'var(--color-text)', ...props.style }}>{children}</select>
    </div>
  );
}
