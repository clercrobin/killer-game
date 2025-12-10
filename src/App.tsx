import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AdminPage } from './components/admin/AdminPage';
import { PublicPage } from './components/public/PublicPage';
import './App.css';

function Navigation() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <nav className="main-nav">
      <Link to="/" className={!isAdmin ? 'active' : ''}>
        Player View
      </Link>
      <Link to="/admin" className={isAdmin ? 'active' : ''}>
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
            <Route path="/" element={<PublicPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
