import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

export function GameManager() {
  const {
    config,
    updateConfig,
    players,
    challenges,
    assignments,
    ringOrder,
    gameStarted,
    startGame,
    resetGame,
    exportData,
    importData,
    groups,
  } = useGameStore();

  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  const handleStartGame = () => {
    if (players.length < 3) {
      alert('Need at least 3 players to start');
      return;
    }
    if (challenges.length === 0) {
      alert('Need at least 1 challenge');
      return;
    }
    if (confirm('Start the game? Assignments will be generated.')) {
      startGame();
    }
  };

  const handleResetGame = () => {
    if (confirm('Reset the game? All assignments will be cleared.')) {
      resetGame();
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `killer-game-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (importData(importText)) {
      setImportText('');
      setShowImport(false);
      alert('Data imported successfully!');
    } else {
      alert('Failed to import data. Check the JSON format.');
    }
  };

  const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || 'Unknown';
  const getGroupColor = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return groups.find(g => g.id === player?.groupId)?.color || '#888';
  };

  const activePlayers = assignments.filter(a => !a.completed).length;

  return (
    <div className="card game-manager">
      <h3>Game Configuration</h3>

      <div className="config-form">
        <label>
          Game Title:
          <input
            type="text"
            value={config.title}
            onChange={(e) => updateConfig({ title: e.target.value })}
            disabled={gameStarted}
          />
        </label>

        <label>
          Group Spread ({(config.spreadFactor * 100).toFixed(0)}%):
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.spreadFactor}
            onChange={(e) => updateConfig({ spreadFactor: parseFloat(e.target.value) })}
            disabled={gameStarted}
          />
          <span className="hint">Higher = more dispersed groups in ring</span>
        </label>

        <label>
          Admin Password:
          <input
            type="password"
            value={config.adminPassword}
            onChange={(e) => updateConfig({ adminPassword: e.target.value })}
          />
        </label>
      </div>

      <div className="game-status">
        <h4>Status</h4>
        <p><strong>Players:</strong> {players.length}</p>
        <p><strong>Challenges:</strong> {challenges.length}</p>
        <p><strong>Game Started:</strong> {gameStarted ? 'Yes' : 'No'}</p>
        {gameStarted && (
          <p><strong>Active Players:</strong> {activePlayers}</p>
        )}
      </div>

      <div className="game-actions">
        {!gameStarted ? (
          <button className="btn-primary btn-large" onClick={handleStartGame}>
            Start Game
          </button>
        ) : (
          <button className="btn-danger btn-large" onClick={handleResetGame}>
            Reset Game
          </button>
        )}

        <div className="secondary-actions">
          <button className="btn-secondary" onClick={handleExport}>
            Export Data
          </button>
          <button className="btn-secondary" onClick={() => setShowImport(!showImport)}>
            Import Data
          </button>
        </div>
      </div>

      {showImport && (
        <div className="import-section">
          <textarea
            placeholder="Paste JSON data here..."
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={6}
          />
          <button className="btn-primary" onClick={handleImport}>
            Import
          </button>
        </div>
      )}

      {gameStarted && ringOrder.length > 0 && (
        <div className="ring-visualization">
          <h4>Ring Order</h4>
          <div className="ring-display">
            {ringOrder.map((playerId, index) => {
              const assignment = assignments.find(a => a.playerId === playerId);
              const isActive = assignment && !assignment.completed;
              return (
                <div
                  key={playerId}
                  className={`ring-node ${isActive ? 'active' : 'eliminated'}`}
                  style={{ borderColor: getGroupColor(playerId) }}
                >
                  <span className="ring-index">{index + 1}</span>
                  <span className="ring-name">{getPlayerName(playerId)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
