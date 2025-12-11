import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useOnlineGameStore } from '../store/onlineGameStore';
import * as gameService from '../lib/gameService';

type Tab = 'game' | 'groups' | 'players' | 'challenges' | 'couples' | 'assignments' | 'messages';

interface Conversation {
  playerId: string;
  playerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: string;
  sender: 'player' | 'admin';
  text: string;
  createdAt: string;
}

export function OnlineAdminPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const store = useOnlineGameStore();

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('game');

  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#6366f1');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [bulkPlayers, setBulkPlayers] = useState('');
  const [newChallengeText, setNewChallengeText] = useState('');
  const [bulkChallenges, setBulkChallenges] = useState('');
  const [couple1, setCouple1] = useState('');
  const [couple2, setCouple2] = useState('');

  // Messaging states
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Load conversations periodically
  useEffect(() => {
    if (authenticated && store.game) {
      loadConversations();
      const interval = setInterval(loadConversations, 10000);
      return () => clearInterval(interval);
    }
  }, [authenticated, store.game]);

  // Load messages when a player is selected
  useEffect(() => {
    if (selectedPlayer && store.game) {
      loadMessages(selectedPlayer.id);
      const interval = setInterval(() => loadMessages(selectedPlayer.id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedPlayer, store.game]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    if (!store.game) return;
    try {
      const convos = await gameService.getAllConversations(store.game.id);
      setConversations(convos);
      setUnreadTotal(convos.reduce((sum, c) => sum + c.unreadCount, 0));
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (playerId: string) => {
    if (!store.game) return;
    try {
      const msgs = await gameService.getMessages(store.game.id, playerId);
      setMessages(msgs);
      // Mark as read
      await gameService.markMessagesAsRead(store.game.id, playerId);
      loadConversations();
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store.game || !selectedPlayer || !newMessage.trim()) return;

    setIsSendingMessage(true);
    try {
      await gameService.sendMessage(store.game.id, selectedPlayer.id, 'admin', newMessage.trim());
      setNewMessage('');
      await loadMessages(selectedPlayer.id);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

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
      <div className="player-page">
        <div className="home-card card-glass">
          <div className="home-logo">❓</div>
          <h2>No Game Code</h2>
          <p>Please provide a game code in the URL.</p>
          <button className="btn-primary btn-large" onClick={() => navigate('/')}>
            🏠 Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (store.isLoading) {
    return (
      <div className="player-page">
        <div className="home-card card-glass">
          <div className="home-logo">⏳</div>
          <h2>Loading...</h2>
          <p>Connecting to game...</p>
        </div>
      </div>
    );
  }

  if (!store.game) {
    return (
      <div className="player-page">
        <div className="home-card card-glass">
          <div className="home-logo">🔍</div>
          <h2>Game Not Found</h2>
          <p>The game code <span className="game-code game-code-small">{code}</span> was not found.</p>
          <button className="btn-primary btn-large" onClick={() => navigate('/')}>
            🏠 Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="admin-login">
        <div className="home-logo">🔐</div>
        <h2>Admin Access</h2>
        <p>{store.game.title}</p>
        <div className="game-code-display">
          <span className="game-code">{store.game.code}</span>
        </div>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary btn-large">
            🔓 Login
          </button>
        </form>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string; badge?: number }[] = [
    { id: 'game', label: 'Game', icon: '🎮' },
    { id: 'groups', label: 'Groups', icon: '👥' },
    { id: 'players', label: 'Players', icon: '🧑' },
    { id: 'challenges', label: 'Challenges', icon: '⚡' },
    { id: 'couples', label: 'Constraints', icon: '💑' },
    { id: 'assignments', label: 'Ring', icon: '🎯' },
    { id: 'messages', label: 'Messages', icon: '💬', badge: unreadTotal },
  ];

  const gameStarted = store.game.started;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>🎯 {store.game.title}</h1>
          <div className="game-code-display">
            <span className="game-code game-code-small">{store.game.code}</span>
          </div>
        </div>
        <button className="btn-secondary btn-small" onClick={() => { setAuthenticated(false); store.leaveGame(); navigate('/'); }}>
          🚪 Logout
        </button>
      </div>

      {store.error && (
        <div className="error-banner">
          <span>{store.error}</span>
          <button onClick={store.clearError}>✕</button>
        </div>
      )}

      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''} ${tab.badge && tab.badge > 0 ? 'has-badge' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-content">
              {tab.icon}
              <span className="tab-label">{tab.label}</span>
            </span>
            {tab.badge && tab.badge > 0 && (
              <span className="tab-badge">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {/* Game Tab */}
        {activeTab === 'game' && (
          <div className="card">
            <h3>📊 Game Status</h3>
            <div className="game-status">
              <div className="status-item">
                <div className="status-value">{store.players.length}</div>
                <div className="status-label">Players</div>
              </div>
              <div className="status-item">
                <div className="status-value">{store.challenges.length}</div>
                <div className="status-label">Challenges</div>
              </div>
              <div className="status-item">
                <div className="status-value" style={{ color: gameStarted ? '#10b981' : '#f59e0b' }}>
                  {gameStarted ? store.assignments.filter(a => !a.completed).length : '—'}
                </div>
                <div className="status-label">{gameStarted ? 'Active' : 'Not Started'}</div>
              </div>
            </div>
            <div style={{ marginTop: '24px' }}>
              {!gameStarted ? (
                <button
                  className="btn-primary btn-large"
                  onClick={() => store.startGame()}
                  disabled={store.players.length < 3 || store.challenges.length === 0}
                >
                  🚀 Start Game
                </button>
              ) : (
                <button className="btn-danger btn-large" onClick={() => store.resetGame()}>
                  🔄 Reset Game
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
            <h3>👥 Groups ({store.groups.length})</h3>
            {!gameStarted && (
              <div className="add-form">
                <input type="color" value={newGroupColor} onChange={(e) => setNewGroupColor(e.target.value)} style={{ width: '50px' }} />
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
                  ➕ Add
                </button>
              </div>
            )}
            <div className="item-list">
              {store.groups.map((group) => (
                <div key={group.id} className="list-item">
                  <input
                    type="color"
                    value={group.color}
                    onChange={(e) => store.updateGroup(group.id, { color: e.target.value })}
                    disabled={gameStarted}
                    style={{ width: '40px' }}
                  />
                  <input
                    type="text"
                    value={group.name}
                    onChange={(e) => store.updateGroup(group.id, { name: e.target.value })}
                    disabled={gameStarted}
                    style={{ flex: 1 }}
                  />
                  <span className="player-count">{store.players.filter(p => p.groupId === group.id).length} players</span>
                  {!gameStarted && (
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => store.removeGroup(group.id)}
                      disabled={store.players.filter(p => p.groupId === group.id).length > 0}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {store.groups.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <p>No groups yet. Add your first group above!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="card">
            <h3>🧑 Players ({store.players.length})</h3>
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
                    ➕ Add
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
                    📥 Import to {store.groups.find(g => g.id === selectedGroupId)?.name}
                  </button>
                </div>
              </>
            )}
            {store.groups.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <p>Create a group first before adding players.</p>
              </div>
            )}
            <div className="players-by-group">
              {store.groups.map(group => {
                const groupPlayers = store.players.filter(p => p.groupId === group.id);
                if (groupPlayers.length === 0) return null;
                return (
                  <div key={group.id} className="player-group">
                    <h4>
                      <span className="color-dot" style={{ backgroundColor: group.color }} />
                      {group.name} ({groupPlayers.length})
                    </h4>
                    <div className="item-list">
                      {groupPlayers.map(player => (
                        <div key={player.id} className="list-item">
                          <span className="color-dot" style={{ backgroundColor: group.color }} />
                          <input
                            type="text"
                            value={player.name}
                            onChange={(e) => store.updatePlayer(player.id, { name: e.target.value })}
                            disabled={gameStarted}
                            style={{ flex: 1 }}
                          />
                          {!gameStarted && (
                            <button
                              className="btn-icon btn-danger"
                              onClick={() => store.removePlayer(player.id)}
                            >
                              ✕
                            </button>
                          )}
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
            <h3>⚡ Challenges ({store.challenges.length})</h3>
            {!gameStarted && (
              <>
                <div className="add-form">
                  <input
                    type="text"
                    placeholder="Enter a challenge..."
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
                    ➕ Add
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
                    📥 Import Challenges
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
                    style={{ flex: 1 }}
                  />
                  {!gameStarted && (
                    <button className="btn-icon btn-danger" onClick={() => store.removeChallenge(challenge.id)}>
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {store.challenges.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">⚡</div>
                  <p>No challenges yet. Add your first challenge above!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Couples Tab */}
        {activeTab === 'couples' && (
          <div className="card">
            <h3>💑 Constraints ({store.couples.length})</h3>
            <p className="hint">These players won't be assigned directly to each other in the ring.</p>
            {!gameStarted && store.players.length >= 2 && (
              <div className="add-form">
                <select value={couple1} onChange={(e) => setCouple1(e.target.value)}>
                  <option value="">Player 1...</option>
                  {store.players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <span style={{ padding: '0 8px' }}>↔</span>
                <select value={couple2} onChange={(e) => setCouple2(e.target.value)}>
                  <option value="">Player 2...</option>
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
                  ➕ Add
                </button>
              </div>
            )}
            <div className="couple-list">
              {store.couples.map((couple, i) => (
                <div key={i} className="couple-item">
                  <span style={{ flex: 1 }}>{store.players.find(p => p.id === couple.player1Id)?.name}</span>
                  <span style={{ color: 'var(--secondary)' }}>💕</span>
                  <span style={{ flex: 1 }}>{store.players.find(p => p.id === couple.player2Id)?.name}</span>
                  {!gameStarted && (
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => store.removeCouple(couple.player1Id, couple.player2Id)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {store.couples.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">💑</div>
                  <p>No constraints added. Couples can be targeted by each other.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="card">
            <h3>🎯 Assassination Ring</h3>
            {!gameStarted ? (
              <div className="empty-state">
                <div className="empty-state-icon">🎯</div>
                <p>Start the game to generate the assassination ring!</p>
              </div>
            ) : (
              <>
                <div className="assignments-list">
                  {store.assignments.filter(a => !a.completed).map(a => {
                    const player = store.players.find(p => p.id === a.playerId);
                    const target = store.players.find(p => p.id === a.targetId);
                    const challenge = store.challenges.find(c => c.id === a.challengeId);
                    const playerGroup = store.groups.find(g => g.id === player?.groupId);
                    return (
                      <div key={a.playerId} className="assignment-item">
                        <div className="assignment-row">
                          <span className="color-dot" style={{ backgroundColor: playerGroup?.color }} />
                          <span className="assignment-player">{player?.name}</span>
                          <span className="assignment-arrow">→</span>
                          <span className="assignment-target">{target?.name}</span>
                        </div>
                        <div className="assignment-challenge">⚡ {challenge?.text}</div>
                        <button
                          className="btn-danger btn-small"
                          onClick={() => store.markElimination(a.targetId)}
                        >
                          💀 Eliminate {target?.name}
                        </button>
                      </div>
                    );
                  })}
                </div>
                {store.assignments.filter(a => a.completed).length > 0 && (
                  <div className="eliminated-section">
                    <h4>💀 Eliminated ({store.assignments.filter(a => a.completed).length})</h4>
                    <div className="eliminated-list">
                      {store.assignments.filter(a => a.completed).map(a => (
                        <span key={a.playerId} className="eliminated-player">
                          {store.players.find(p => p.id === a.playerId)?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="card">
            <h3>💬 Player Messages</h3>
            {!selectedPlayer ? (
              <>
                <p className="hint">Players can send you questions about their challenges.</p>
                <div className="item-list" style={{ marginTop: '16px' }}>
                  {conversations.map(convo => (
                    <div
                      key={convo.playerId}
                      className="list-item"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedPlayer({ id: convo.playerId, name: convo.playerName })}
                    >
                      <span style={{ flex: 1 }}>
                        <strong>{convo.playerName}</strong>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {convo.lastMessage.length > 50 ? convo.lastMessage.slice(0, 50) + '...' : convo.lastMessage}
                        </div>
                      </span>
                      {convo.unreadCount > 0 && (
                        <span style={{
                          background: '#ef4444',
                          color: 'white',
                          borderRadius: '10px',
                          padding: '2px 8px',
                          fontSize: '12px',
                        }}>
                          {convo.unreadCount}
                        </span>
                      )}
                    </div>
                  ))}
                  {conversations.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-state-icon">💬</div>
                      <p>No messages yet. Players can contact you when they have questions!</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button className="btn-secondary btn-small" onClick={() => setSelectedPlayer(null)} style={{ marginBottom: '16px' }}>
                  ← Back to conversations
                </button>
                <h4 style={{ marginBottom: '16px' }}>Chat with {selectedPlayer.name}</h4>
                <div className="messages-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message ${msg.sender === 'admin' ? 'message-sent' : 'message-received'}`}
                    >
                      <div>{msg.text}</div>
                      <div className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="message-input-row" style={{ marginTop: '16px' }}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
                    autoFocus
                  />
                  <button type="submit" className="btn-primary" disabled={isSendingMessage || !newMessage.trim()}>
                    {isSendingMessage ? '⏳' : '📤 Send'}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
