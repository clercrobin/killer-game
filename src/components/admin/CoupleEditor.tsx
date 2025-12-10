import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

export function CoupleEditor() {
  const { couples, players, addCouple, removeCouple, gameStarted } = useGameStore();
  const [player1Id, setPlayer1Id] = useState('');
  const [player2Id, setPlayer2Id] = useState('');

  const handleAddCouple = () => {
    if (!player1Id || !player2Id || player1Id === player2Id) return;
    // Check if couple already exists
    const exists = couples.some(
      c => (c.player1Id === player1Id && c.player2Id === player2Id) ||
           (c.player1Id === player2Id && c.player2Id === player1Id)
    );
    if (exists) return;
    addCouple({ player1Id, player2Id });
    setPlayer1Id('');
    setPlayer2Id('');
  };

  const getPlayerName = (id: string) => {
    return players.find(p => p.id === id)?.name || 'Unknown';
  };

  return (
    <div className="card">
      <h3>Couples / Constraints ({couples.length})</h3>
      <p className="hint">
        Couples won't be assigned to each other directly in the ring.
      </p>

      {!gameStarted && (
        <div className="add-form">
          <select
            value={player1Id}
            onChange={(e) => setPlayer1Id(e.target.value)}
          >
            <option value="">Select player 1...</option>
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <span>&harr;</span>
          <select
            value={player2Id}
            onChange={(e) => setPlayer2Id(e.target.value)}
          >
            <option value="">Select player 2...</option>
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            className="btn-primary"
            onClick={handleAddCouple}
            disabled={!player1Id || !player2Id || player1Id === player2Id}
          >
            Add Constraint
          </button>
        </div>
      )}

      <div className="couple-list">
        {couples.map((couple, index) => (
          <div key={index} className="couple-item">
            <span>{getPlayerName(couple.player1Id)}</span>
            <span>&harr;</span>
            <span>{getPlayerName(couple.player2Id)}</span>
            <button
              className="btn-danger"
              onClick={() => removeCouple(couple.player1Id, couple.player2Id)}
              disabled={gameStarted}
            >
              &times;
            </button>
          </div>
        ))}
        {couples.length === 0 && (
          <p className="empty-message">No constraints defined.</p>
        )}
      </div>
    </div>
  );
}
