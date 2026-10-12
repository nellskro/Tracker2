import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/routines', label: 'Track', icon: '✅' },
  { to: '/journal', label: 'Wins', icon: '🏆' },
  { to: '/parametres', label: 'Paramètres', icon: '⚙️' },
];

export default function Sidebar() {
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      height: 60,
      background: 'rgba(7,8,15,0.6)',
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.3)',
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, overflow: 'hidden',
          background: 'var(--color-primary)',
          boxShadow: '0 0 16px rgba(99,102,241,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <img src="/logo.png" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '⚡'; }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2, color: 'var(--color-text)' }}>1% Better</div>
          <div style={{ fontSize: 10, opacity: 0.4, color: 'var(--color-text)', letterSpacing: '0.05em' }}>TRACKER</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {LINKS.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 14px', borderRadius: 12,
              fontSize: 13, fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s',
              ...(isActive ? {
                background: 'rgba(99,102,241,0.25)',
                color: '#a5b4fc',
                border: '1px solid rgba(99,102,241,0.4)',
                boxShadow: '0 0 12px rgba(99,102,241,0.2)',
              } : {
                background: 'transparent',
                color: 'rgba(255,255,255,0.45)',
                border: '1px solid transparent',
              }),
            })}
          >
            <span style={{ fontSize: 14 }}>{link.icon}</span>
            <span className="hidden sm:inline">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
