import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useOnlineGameStore } from '../store/onlineGameStore';
import * as gameService from '../lib/gameService';

interface PlayerAssignment {
  player: { id: string; name: string; groupId: string };
  group: { name: string; color: string };
  target: { id: string; name: string; group_id: string } | null;
  challenge: { id: string; text: string } | null;
  completed: boolean;
}

interface Message {
  id: string;
  sender: 'player' | 'admin';
  text: string;
  createdAt: string;
}

export function PlayerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { game, joinGame, isLoading } = useOnlineGameStore();

  const [playerName, setPlayerName] = useState('');
  const [assignment, setAssignment] = useState<PlayerAssignment | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Messaging state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const code = searchParams.get('code') || '';

  useEffect(() => {
    if (code && !game) {
      joinGame(code);
    }
  }, [code, game, joinGame]);

  // Load messages when modal opens
  useEffect(() => {
    if (showMessageModal && game && assignment) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [showMessageModal, game, assignment]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!game || !assignment) return;
    try {
      const msgs = await gameService.getMessages(game.id, assignment.player.id);
      setMessages(msgs);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!game || !assignment || !newMessage.trim()) return;

    setIsSendingMessage(true);
    try {
      await gameService.sendMessage(game.id, assignment.player.id, 'player', newMessage.trim());
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!game || !playerName.trim()) return;

    setIsLookingUp(true);
    setLookupError(null);

    try {
      const result = await gameService.getPlayerAssignment(game.id, playerName.trim());
      if (result) {
        setAssignment(result);
      } else {
        setLookupError('Player not found. Check your name spelling.');
      }
    } catch (error) {
      setLookupError((error as Error).message);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleClear = () => {
    setAssignment(null);
    setPlayerName('');
    setLookupError(null);
  };

  if (!code) {
    return (
      <div className="player-page">
        <div className="home-card card-glass">
          <div className="home-logo">❓</div>
          <h2>No Game Code</h2>
          <p>Please enter a game code to look up your assignment.</p>
          <button className="btn-primary btn-large" onClick={() => navigate('/')}>
            🏠 Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
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

  if (!game) {
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

  if (!game.started) {
    return (
      <div className="player-page">
        <div className="home-card card-glass">
          <div className="home-logo">⏰</div>
          <h2>{game.title}</h2>
          <div className="game-code-display">
            <span className="game-code">{game.code}</span>
          </div>
          <div className="not-started">
            <p>🎮 The game has not started yet.</p>
            <p>Check back later for your assignment!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="player-page">
      <div className="home-card card-glass">
        <h2>{game.title}</h2>
        <div className="game-code-display">
          <span className="game-code game-code-small">{game.code}</span>
        </div>

        {!assignment ? (
          <form onSubmit={handleLookup} className="lookup-form">
            <p>Enter your name to see your secret assignment:</p>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your name"
              autoFocus
            />
            {lookupError && <p className="error-text">{lookupError}</p>}
            <button type="submit" className="btn-primary btn-large" disabled={isLookingUp}>
              {isLookingUp ? '⏳ Looking up...' : '🔍 Find My Assignment'}
            </button>
          </form>
        ) : (
          <div className="assignment-card">
            {assignment.completed ? (
              <div className="eliminated-badge">
                <h3>💀 You have been eliminated!</h3>
                <p>Better luck next time, {assignment.player.name}!</p>
              </div>
            ) : (
              <>
                <div className="player-info">
                  <span
                    className="group-badge"
                    style={{ backgroundColor: assignment.group.color, color: '#fff' }}
                  >
                    {assignment.group.name}
                  </span>
                  <h3 className="player-name">{assignment.player.name}</h3>
                </div>

                <div className="target-section">
                  <div className="target-label">🎯 Your Target</div>
                  <div className="target-name">{assignment.target?.name || 'Unknown'}</div>
                </div>

                <div className="challenge-section">
                  <div className="challenge-label">⚡ Your Challenge</div>
                  <div className="challenge-text">
                    {assignment.challenge?.text || 'No challenge assigned'}
                  </div>
                </div>

                <div className="rules-card">
                  <h4>📋 Rules</h4>
                  <ul>
                    <li>Complete the challenge with your target</li>
                    <li>Once completed, they are eliminated</li>
                    <li>You will inherit their target and challenge</li>
                    <li>Last player standing wins!</li>
                  </ul>
                </div>
              </>
            )}

            <button className="btn-secondary btn-large" onClick={handleClear} style={{ marginTop: '20px' }}>
              🔄 Look up another player
            </button>
          </div>
        )}
      </div>

      {/* Contact Game Master floating button */}
      {assignment && !assignment.completed && (
        <button
          className="contact-master-btn"
          onClick={() => setShowMessageModal(true)}
          title="Contact Game Master"
        >
          💬
        </button>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💬 Contact Game Master</h3>
              <button className="btn-icon btn-secondary" onClick={() => setShowMessageModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                Have a question about your challenge? Ask the game master!
              </p>
              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="empty-state">
                    <p>No messages yet. Send a message to start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message ${msg.sender === 'player' ? 'message-sent' : 'message-received'}`}
                    >
                      <div>{msg.text}</div>
                      <div className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="modal-footer">
              <form onSubmit={handleSendMessage} className="message-input-row">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  autoFocus
                />
                <button type="submit" className="btn-primary" disabled={isSendingMessage || !newMessage.trim()}>
                  {isSendingMessage ? '⏳' : '📤'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
