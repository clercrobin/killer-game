import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useOnlineGameStore } from '../store/onlineGameStore';

type Tab = 'game' | 'groups' | 'players' | 'challenges' | 'couples' | 'assignments';

export function OnlineAdminPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const store = useOnlineGameStore();

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('game');

  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#4CAF50');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [bulkPlayers, setBulkPlayers] = useState('');
  const [newChallengeText, setNewChallengeText] = useState('');
  const [bulkChallenges, setBulkChallenges] = useState('');
  const [couple1, setCouple1] = useState('');
  const [couple2, setCouple2] = useState('');

  const code = searchParams.get('code') || '';

  useEffect(() => {
    if (code && !store.game) {
      store.joinGame(code);
    }
  }, [code, store.game]);

  useEffect(() => {
    if (store.groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(store.groups[0].id);
    }
  }, [store.groups, selectedGroupId]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (store.game && password === store.game.adminPassword) {
      setAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  if (!code) {
    return (
      <div className="admin-page">
        <div className="home-card">
          <h2>No Game Code</h2>
          <button className="btn-primary" onClick={() => navigate('/')}>Go to Home</button>
        </div>
      </div>
    );
  }

  if (store.isLoading) {
    return <div className="admin-page"><div className="home-card"><h2>Loading...</h2></div></div>;
  }

  if (!store.game) {
    return (
      <div className="admin-page">
        <div className="home-card">
          <h2>Game Not Found</h2>
          <button className="btn-primary" onClick={() => navigate('/')}>Go to Home</button>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="admin-login">
        <h2>Admin Access</h2>
        <p>Game: {store.game.title}</p>
        <p className="game-code-display">Code: <strong>{store.game.code}</strong></p>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary">Login</button>
        </form>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'game', label: 'Game' },
    { id: 'groups', label: 'Groups' },
    { id: 'players', label: 'Players' },
    { id: 'challenges', label: 'Challenges' },
    { id: 'couples', label: 'Constraints' },
    { id: 'assignments', label: 'Assignments' },
  ];

  const gameStarted = store.game.started;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>{store.game.title}</h1>
          <p className="game-code-display">Share this code: <strong>{store.game.code}</strong></p>
        </div>
        <button className="btn-secondary" onClick={() => { setAuthenticated(false); store.leaveGame(); navigate('/'); }}>
          Logout
        </button>
      </div>

      {store.error && (
        <div className="error-banner">
          {store.error}
          <button onClick={store.clearError}>&times;</button>
        </div>
      )}

      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {/* Game Tab */}
        {activeTab === 'game' && (
          <div className="card">
            <h3>Game Status</h3>
            <div className="game-status">
              <p><strong>Players:</strong> {store.players.length}</p>
              <p><strong>Challenges:</strong> {store.challenges.length}</p>
              <p><strong>Game Started:</strong> {gameStarted ? 'Yes' : 'No'}</p>
              {gameStarted && (
                <p><strong>Active Players:</strong> {store.assignments.filter(a => !a.completed).length}</p>
              )}
            </div>
            <div className="game-actions">
              {!gameStarted ? (
                <button
                  className="btn-primary btn-large"
                  onClick={() => store.startGame()}
                  disabled={store.players.length < 3 || store.challenges.length === 0}
                >
                  Start Game
                </button>
              ) : (
                <button className="btn-danger btn-large" onClick={() => store.resetGame()}>
                  Reset Game
                </button>
              )}
            </div>
            {store.players.length < 3 && <p className="hint">Need at least 3 players to start</p>}
            {store.challenges.length === 0 && <p className="hint">Need at least 1 challenge to start</p>}
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <div className="card">
            <h3>Groups</h3>
            {!gameStarted && (
              <div className="add-form">
                <input type="color" value={newGroupColor} onChange={(e) => setNewGroupColor(e.target.value)} />
                <input
                  type="text"
                  placeholder="Group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newGroupName.trim()) {
                      store.addGroup(newGroupName.trim(), newGroupColor);
                      setNewGroupName('');
                    }
                  }}
                />
                <button
                  className="btn-primary"
                  onClick={() => {
                    if (newGroupName.trim()) {
                      store.addGroup(newGroupName.trim(), newGroupColor);
                      setNewGroupName('');
                    }
                  }}
                >
                  Add Group
                </button>
              </div>
            )}
            <div className="group-list">
              {store.groups.map((group) => (
                <div key={group.id} className="group-item">
                  <input
                    type="color"
                    value={group.color}
                    onChange={(e) => store.updateGroup(group.id, { color: e.target.value })}
                    disabled={gameStarted}
                  />
                  <input
                    type="text"
                    value={group.name}
                    onChange={(e) => store.updateGroup(group.id, { name: e.target.value })}
                    disabled={gameStarted}
                  />
                  <span className="player-count">({store.players.filter(p => p.groupId === group.id).length} players)</span>
                  <button
                    className="btn-danger"
                    onClick={() => store.removeGroup(group.id)}
                    disabled={gameStarted || store.players.filter(p => p.groupId === group.id).length > 0}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="card">
            <h3>Players ({store.players.length})</h3>
            {!gameStarted && store.groups.length > 0 && (
              <>
                <div className="add-form">
                  <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)}>
                    {store.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                  <input
                    type="text"
                    placeholder="Player name"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newPlayerName.trim()) {
                        store.addPlayer(newPlayerName.trim(), selectedGroupId);
                        setNewPlayerName('');
                      }
                    }}
                  />
                  <button
                    className="btn-primary"
                    onClick={() => {
                      if (newPlayerName.trim()) {
                        store.addPlayer(newPlayerName.trim(), selectedGroupId);
                        setNewPlayerName('');
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
                <div className="bulk-import">
                  <textarea
                    placeholder="Bulk import: paste names (one per line)"
                    value={bulkPlayers}
                    onChange={(e) => setBulkPlayers(e.target.value)}
                    rows={3}
                  />
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      const names = bulkPlayers.split('\n').filter(n => n.trim());
                      if (names.length > 0) {
                        store.addPlayers(names, selectedGroupId);
                        setBulkPlayers('');
                      }
                    }}
                  >
                    Import to {store.groups.find(g => g.id === selectedGroupId)?.name}
                  </button>
                </div>
              </>
            )}
            <div className="players-by-group">
              {store.groups.map(group => {
                const groupPlayers = store.players.filter(p => p.groupId === group.id);
                return (
                  <div key={group.id} className="player-group">
                    <h4 style={{ color: group.color }}>{group.name} ({groupPlayers.length})</h4>
                    <div className="player-list">
                      {groupPlayers.map(player => (
                        <div key={player.id} className="player-item">
                          <span className="color-dot" style={{ backgroundColor: group.color }} />
                          <input
                            type="text"
                            value={player.name}
                            onChange={(e) => store.updatePlayer(player.id, { name: e.target.value })}
                            disabled={gameStarted}
                          />
                          <button
                            className="btn-danger"
                            onClick={() => store.removePlayer(player.id)}
                            disabled={gameStarted}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <div className="card">
            <h3>Challenges ({store.challenges.length})</h3>
            {!gameStarted && (
              <>
                <div className="add-form">
                  <input
                    type="text"
                    placeholder="Challenge text"
                    value={newChallengeText}
                    onChange={(e) => setNewChallengeText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newChallengeText.trim()) {
                        store.addChallenge(newChallengeText.trim());
                        setNewChallengeText('');
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn-primary"
                    onClick={() => {
                      if (newChallengeText.trim()) {
                        store.addChallenge(newChallengeText.trim());
                        setNewChallengeText('');
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
                <div className="bulk-import">
                  <textarea
                    placeholder="Bulk import: paste challenges (one per line)"
                    value={bulkChallenges}
                    onChange={(e) => setBulkChallenges(e.target.value)}
                    rows={4}
                  />
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      const texts = bulkChallenges.split('\n').filter(t => t.trim()).map(t => t.replace(/^\d+[\.\)]\s*/, ''));
                      if (texts.length > 0) {
                        store.addChallenges(texts);
                        setBulkChallenges('');
                      }
                    }}
                  >
                    Import Challenges
                  </button>
                </div>
              </>
            )}
            <div className="challenge-list">
              {store.challenges.map((challenge, i) => (
                <div key={challenge.id} className="challenge-item">
                  <span className="challenge-number">{i + 1}.</span>
                  <textarea
                    value={challenge.text}
                    onChange={(e) => store.updateChallenge(challenge.id, e.target.value)}
                    disabled={gameStarted}
                    rows={2}
                  />
                  <button className="btn-danger" onClick={() => store.removeChallenge(challenge.id)} disabled={gameStarted}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Couples Tab */}
        {activeTab === 'couples' && (
          <div className="card">
            <h3>Constraints ({store.couples.length})</h3>
            <p className="hint">Couples won't be assigned to each other directly.</p>
            {!gameStarted && store.players.length >= 2 && (
              <div className="add-form">
                <select value={couple1} onChange={(e) => setCouple1(e.target.value)}>
                  <option value="">Select player 1...</option>
                  {store.players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <span>&harr;</span>
                <select value={couple2} onChange={(e) => setCouple2(e.target.value)}>
                  <option value="">Select player 2...</option>
                  {store.players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button
                  className="btn-primary"
                  onClick={() => {
                    if (couple1 && couple2 && couple1 !== couple2) {
                      store.addCouple(couple1, couple2);
                      setCouple1('');
                      setCouple2('');
                    }
                  }}
                  disabled={!couple1 || !couple2 || couple1 === couple2}
                >
                  Add
                </button>
              </div>
            )}
            <div className="couple-list">
              {store.couples.map((couple, i) => (
                <div key={i} className="couple-item">
                  <span>{store.players.find(p => p.id === couple.player1Id)?.name}</span>
                  <span>&harr;</span>
                  <span>{store.players.find(p => p.id === couple.player2Id)?.name}</span>
                  <button
                    className="btn-danger"
                    onClick={() => store.removeCouple(couple.player1Id, couple.player2Id)}
                    disabled={gameStarted}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="card">
            <h3>Assignments</h3>
            {!gameStarted ? (
              <p className="empty-message">Start the game to see assignments.</p>
            ) : (
              <>
                <table className="assignments-table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Target</th>
                      <th>Challenge</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.assignments.filter(a => !a.completed).map(a => (
                      <tr key={a.playerId}>
                        <td>{store.players.find(p => p.id === a.playerId)?.name}</td>
                        <td>{store.players.find(p => p.id === a.targetId)?.name}</td>
                        <td className="challenge-cell">{store.challenges.find(c => c.id === a.challengeId)?.text}</td>
                        <td>
                          <button
                            className="btn-danger btn-small"
                            onClick={() => store.markElimination(a.targetId)}
                          >
                            Eliminate Target
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {store.assignments.filter(a => a.completed).length > 0 && (
                  <>
                    <h4>Eliminated ({store.assignments.filter(a => a.completed).length})</h4>
                    <div className="eliminated-list">
                      {store.assignments.filter(a => a.completed).map(a => (
                        <span key={a.playerId} className="eliminated-player">
                          {store.players.find(p => p.id === a.playerId)?.name}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
