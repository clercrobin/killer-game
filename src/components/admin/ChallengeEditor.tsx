import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

export function ChallengeEditor() {
  const { challenges, addChallenge, updateChallenge, removeChallenge, gameStarted } = useGameStore();
  const [newChallengeText, setNewChallengeText] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);

  const handleAddChallenge = () => {
    if (!newChallengeText.trim()) return;
    const id = `challenge-${Date.now()}`;
    addChallenge({ id, text: newChallengeText.trim() });
    setNewChallengeText('');
  };

  const handleBulkImport = () => {
    const lines = bulkInput.split('\n').filter(l => l.trim());
    lines.forEach((line, i) => {
      const id = `challenge-${Date.now()}-${i}`;
      // Remove leading numbers like "1. " or "1) "
      const text = line.trim().replace(/^\d+[\.\)]\s*/, '');
      if (text) addChallenge({ id, text });
    });
    setBulkInput('');
    setShowBulkImport(false);
  };

  const handleClearAll = () => {
    if (confirm('Remove all challenges?')) {
      challenges.forEach(c => removeChallenge(c.id));
    }
  };

  return (
    <div className="card">
      <h3>Challenges ({challenges.length})</h3>

      {!gameStarted && (
        <>
          <div className="add-form">
            <input
              type="text"
              placeholder="New challenge text"
              value={newChallengeText}
              onChange={(e) => setNewChallengeText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddChallenge()}
              style={{ flex: 1 }}
            />
            <button className="btn-primary" onClick={handleAddChallenge}>
              Add
            </button>
            <button className="btn-secondary" onClick={() => setShowBulkImport(!showBulkImport)}>
              Bulk Import
            </button>
            <button className="btn-danger" onClick={handleClearAll}>
              Clear All
            </button>
          </div>

          {showBulkImport && (
            <div className="bulk-import">
              <textarea
                placeholder="Paste challenges (one per line, numbers will be removed)"
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                rows={8}
              />
              <button className="btn-primary" onClick={handleBulkImport}>
                Import Challenges
              </button>
            </div>
          )}
        </>
      )}

      <div className="challenge-list">
        {challenges.map((challenge, index) => (
          <div key={challenge.id} className="challenge-item">
            <span className="challenge-number">{index + 1}.</span>
            <textarea
              value={challenge.text}
              onChange={(e) => updateChallenge(challenge.id, { text: e.target.value })}
              disabled={gameStarted}
              rows={2}
            />
            <button
              className="btn-danger"
              onClick={() => removeChallenge(challenge.id)}
              disabled={gameStarted}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
