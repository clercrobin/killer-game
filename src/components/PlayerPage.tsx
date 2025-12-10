import { useState, useEffect } from 'react';
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

export function PlayerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { game, joinGame, isLoading } = useOnlineGameStore();

  const [playerName, setPlayerName] = useState('');
  const [assignment, setAssignment] = useState<PlayerAssignment | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const code = searchParams.get('code') || '';

  useEffect(() => {
    if (code && !game) {
      joinGame(code);
    }
  }, [code, game, joinGame]);

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
        <div className="home-card">
          <h2>No Game Code</h2>
          <p>Please enter a game code to look up your assignment.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="player-page">
        <div className="home-card">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="player-page">
        <div className="home-card">
          <h2>Game Not Found</h2>
          <p>The game code "{code}" was not found.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!game.started) {
    return (
      <div className="player-page">
        <div className="home-card">
          <h2>{game.title}</h2>
          <p className="game-code-display">Code: <strong>{game.code}</strong></p>
          <div className="not-started">
            <p>The game has not started yet.</p>
            <p>Check back later for your assignment!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="player-page">
      <div className="home-card">
        <h2>{game.title}</h2>
        <p className="game-code-display">Code: <strong>{game.code}</strong></p>

        {!assignment ? (
          <form onSubmit={handleLookup} className="lookup-form">
            <p>Enter your name to see your assignment:</p>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your name"
              className="search-input"
              autoFocus
            />
            {lookupError && <p className="error-text">{lookupError}</p>}
            <button type="submit" className="btn-primary btn-large" disabled={isLookingUp}>
              {isLookingUp ? 'Looking up...' : 'Find My Assignment'}
            </button>
          </form>
        ) : (
          <div className="assignment-display">
            {assignment.completed ? (
              <div className="eliminated-card">
                <h3>You have been eliminated!</h3>
                <p>Better luck next time, {assignment.player.name}!</p>
              </div>
            ) : (
              <>
                <div className="player-card">
                  <div className="player-header">
                    <span
                      className="group-badge"
                      style={{ backgroundColor: assignment.group.color }}
                    >
                      {assignment.group.name}
                    </span>
                    <h3>{assignment.player.name}</h3>
                  </div>
                </div>

                <div className="target-card">
                  <h4>Your Target</h4>
                  <p className="target-name">{assignment.target?.name || 'Unknown'}</p>
                </div>

                <div className="challenge-card">
                  <h4>Your Challenge</h4>
                  <p className="challenge-text">{assignment.challenge?.text || 'No challenge assigned'}</p>
                </div>

                <div className="rules-reminder">
                  <h4>Remember</h4>
                  <ul>
                    <li>Complete the challenge with your target</li>
                    <li>Once completed, they are eliminated</li>
                    <li>You will inherit their target</li>
                    <li>Last player standing wins!</li>
                  </ul>
                </div>
              </>
            )}

            <button className="btn-secondary" onClick={handleClear}>
              Look up another player
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
