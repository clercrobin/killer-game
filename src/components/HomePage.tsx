import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnlineGameStore } from '../store/onlineGameStore';
import { isSupabaseConfigured } from '../lib/gameService';

export function HomePage() {
  const navigate = useNavigate();
  const { createGame, joinGame, isLoading, error, clearError } = useOnlineGameStore();

  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [gameCode, setGameCode] = useState('');
  const [gameTitle, setGameTitle] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const isConfigured = isSupabaseConfigured();

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameTitle || !adminPassword) return;

    try {
      const code = await createGame(gameTitle, adminPassword);
      navigate(`/admin?code=${code}`);
    } catch {
      // Error is handled by store
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameCode) return;

    const success = await joinGame(gameCode);
    if (success) {
      navigate(`/play?code=${gameCode}`);
    }
  };

  if (!isConfigured) {
    return (
      <div className="home-page">
        <div className="home-card card-glass">
          <div className="home-logo">🎯</div>
          <h1>Killer Game</h1>
          <p className="subtitle">Assassination party game</p>
          <div className="offline-notice">
            <h3>⚠️ Database Not Configured</h3>
            <p>To enable online multiplayer:</p>
            <ol>
              <li>Create a free Supabase account at <a href="https://supabase.com" target="_blank" rel="noopener">supabase.com</a></li>
              <li>Create a new project</li>
              <li>Run the SQL schema in the SQL Editor (see <code>supabase-schema.sql</code>)</li>
              <li>Add your credentials to <code>.env</code></li>
            </ol>
            <p>For now, you can use the <a href="/offline">offline mode</a> (single device only).</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-card card-glass">
        <div className="home-logo">🎯</div>
        <h1>Killer Game</h1>
        <p className="subtitle">Assassination party game</p>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={clearError}>✕</button>
          </div>
        )}

        {mode === 'choose' && (
          <div className="home-buttons">
            <button className="btn-primary btn-large" onClick={() => setMode('create')}>
              🎮 Create New Game
            </button>
            <button className="btn-secondary btn-large" onClick={() => setMode('join')}>
              🔗 Join Existing Game
            </button>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreateGame} className="home-form">
            <h3>🎮 Create New Game</h3>
            <div className="input-group">
              <label>Game Name</label>
              <input
                type="text"
                value={gameTitle}
                onChange={(e) => setGameTitle(e.target.value)}
                placeholder="e.g., Birthday Party"
                autoFocus
                required
              />
            </div>
            <div className="input-group">
              <label>Admin Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Choose a password"
                required
              />
              <span className="hint">You'll need this to manage the game</span>
            </div>
            <div className="form-buttons">
              <button type="button" className="btn-secondary" onClick={() => setMode('choose')}>
                ← Back
              </button>
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? '⏳ Creating...' : '✨ Create Game'}
              </button>
            </div>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoinGame} className="home-form">
            <h3>🔗 Join Game</h3>
            <div className="input-group">
              <label>Enter Game Code</label>
              <input
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
                className="game-code-input"
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  fontSize: '28px',
                  textAlign: 'center',
                  fontFamily: "'SF Mono', Monaco, monospace",
                  fontWeight: 700
                }}
                autoFocus
                required
              />
              <span className="hint">Ask the game master for the code</span>
            </div>
            <div className="form-buttons">
              <button type="button" className="btn-secondary" onClick={() => setMode('choose')}>
                ← Back
              </button>
              <button type="submit" className="btn-primary" disabled={isLoading || gameCode.length !== 6}>
                {isLoading ? '⏳ Joining...' : '🚀 Join Game'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
