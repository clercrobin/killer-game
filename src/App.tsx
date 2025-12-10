import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { OnlineAdminPage } from './components/OnlineAdminPage';
import { PlayerPage } from './components/PlayerPage';
import { AdminPage } from './components/admin/AdminPage';
import { PublicPage } from './components/public/PublicPage';
import './App.css';

function Navigation() {
  const location = useLocation();
  const path = location.pathname;

  // Only show nav for offline mode
  if (!path.startsWith('/offline')) return null;

  return (
    <nav className="main-nav">
      <Link to="/offline" className={path === '/offline' ? 'active' : ''}>
        Player View
      </Link>
      <Link to="/offline/admin" className={path === '/offline/admin' ? 'active' : ''}>
        Admin
      </Link>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navigation />
        <main>
          <Routes>
            {/* Online mode (with Supabase) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<OnlineAdminPage />} />
            <Route path="/play" element={<PlayerPage />} />

            {/* Offline mode (localStorage only) */}
            <Route path="/offline" element={<PublicPage />} />
            <Route path="/offline/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
