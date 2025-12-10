import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

export function PlayerEditor() {
  const { players, groups, addPlayer, updatePlayer, removePlayer, gameStarted } = useGameStore();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || '');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);

  const handleAddPlayer = () => {
    if (!newPlayerName.trim() || !selectedGroupId) return;
    const id = `player-${Date.now()}`;
    addPlayer({ id, name: newPlayerName.trim(), groupId: selectedGroupId });
    setNewPlayerName('');
  };

  const handleBulkImport = () => {
    const lines = bulkInput.split('\n').filter(l => l.trim());
    lines.forEach((line, i) => {
      const id = `player-${Date.now()}-${i}`;
      addPlayer({ id, name: line.trim(), groupId: selectedGroupId });
    });
    setBulkInput('');
    setShowBulkImport(false);
  };

  const getGroupName = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.name || 'Unknown';
  };

  const getGroupColor = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.color || '#888';
  };

  const playersByGroup = groups.map(g => ({
    group: g,
    players: players.filter(p => p.groupId === g.id)
  }));

  return (
    <div className="card">
      <h3>Players ({players.length})</h3>

      {!gameStarted && (
        <>
          <div className="add-form">
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Player name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            />
            <button className="btn-primary" onClick={handleAddPlayer}>
              Add
            </button>
            <button className="btn-secondary" onClick={() => setShowBulkImport(!showBulkImport)}>
              Bulk Import
            </button>
          </div>

          {showBulkImport && (
            <div className="bulk-import">
              <textarea
                placeholder="Paste names (one per line)"
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                rows={5}
              />
              <button className="btn-primary" onClick={handleBulkImport}>
                Import to {getGroupName(selectedGroupId)}
              </button>
            </div>
          )}
        </>
      )}

      <div className="players-by-group">
        {playersByGroup.map(({ group, players: groupPlayers }) => (
          <div key={group.id} className="player-group">
            <h4 style={{ color: group.color }}>{group.name} ({groupPlayers.length})</h4>
            <div className="player-list">
              {groupPlayers.map(player => (
                <div key={player.id} className="player-item">
                  <span
                    className="color-dot"
                    style={{ backgroundColor: getGroupColor(player.groupId) }}
                  />
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => updatePlayer(player.id, { name: e.target.value })}
                    disabled={gameStarted}
                  />
                  <select
                    value={player.groupId}
                    onChange={(e) => updatePlayer(player.id, { groupId: e.target.value })}
                    disabled={gameStarted}
                  >
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  <button
                    className="btn-danger"
                    onClick={() => removePlayer(player.id)}
                    disabled={gameStarted}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
