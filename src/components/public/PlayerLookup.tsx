import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';

export function PlayerLookup() {
  const { players, assignments, challenges, groups, gameStarted, config } = useGameStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const filteredPlayers = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return players.filter(p => p.name.toLowerCase().includes(term));
  }, [players, searchTerm]);

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);
  const playerAssignment = assignments.find(a => a.playerId === selectedPlayerId);
  const targetPlayer = playerAssignment
    ? players.find(p => p.id === playerAssignment.targetId)
    : null;
  const challenge = playerAssignment
    ? challenges.find(c => c.id === playerAssignment.challengeId)
    : null;
  const playerGroup = selectedPlayer
    ? groups.find(g => g.id === selectedPlayer.groupId)
    : null;

  const handleSelectPlayer = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSelectedPlayerId(null);
    setSearchTerm('');
  };

  if (!gameStarted) {
    return (
      <div className="player-lookup">
        <div className="not-started">
          <h2>{config.title}</h2>
          <p>The game has not started yet.</p>
          <p>Check back later for your assignment!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="player-lookup">
      <h2>{config.title}</h2>

      {!selectedPlayerId ? (
        <div className="search-section">
          <p>Find your assignment by entering your name:</p>
          <input
            type="text"
            placeholder="Type your name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="search-input"
          />

          {filteredPlayers.length > 0 && (
            <div className="search-results">
              {filteredPlayers.map(player => (
                <button
                  key={player.id}
                  className="search-result-item"
                  onClick={() => handleSelectPlayer(player.id)}
                >
                  {player.name}
                </button>
              ))}
            </div>
          )}

          {searchTerm && filteredPlayers.length === 0 && (
            <p className="no-results">No player found with that name.</p>
          )}
        </div>
      ) : (
        <div className="assignment-display">
          {playerAssignment?.completed ? (
            <div className="eliminated-card">
              <h3>You have been eliminated!</h3>
              <p>Better luck next time, {selectedPlayer?.name}!</p>
            </div>
          ) : (
            <>
              <div className="player-card">
                <div className="player-header">
                  <span
                    className="group-badge"
                    style={{ backgroundColor: playerGroup?.color }}
                  >
                    {playerGroup?.name}
                  </span>
                  <h3>{selectedPlayer?.name}</h3>
                </div>
              </div>

              <div className="target-card">
                <h4>Your Target</h4>
                <p className="target-name">{targetPlayer?.name}</p>
              </div>

              <div className="challenge-card">
                <h4>Your Challenge</h4>
                <p className="challenge-text">{challenge?.text}</p>
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
  );
}
