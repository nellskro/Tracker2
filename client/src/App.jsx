import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Routines from './pages/Routines';
import Journal from './pages/Journal';
import Parametres from './pages/Parametres';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Sidebar />
      <main style={{ paddingTop: '64px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/parametres" element={<Parametres />} />
        </Routes>
      </main>
    </div>
  );
}
