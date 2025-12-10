import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

export function GroupEditor() {
  const { groups, addGroup, updateGroup, removeGroup, players, gameStarted } = useGameStore();
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#4CAF50');

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    const id = `group-${Date.now()}`;
    addGroup({ id, name: newGroupName.trim(), color: newGroupColor });
    setNewGroupName('');
  };

  const getPlayerCount = (groupId: string) => {
    return players.filter(p => p.groupId === groupId).length;
  };

  return (
    <div className="card">
      <h3>Groups</h3>

      <div className="group-list">
        {groups.map((group) => (
          <div key={group.id} className="group-item">
            <input
              type="color"
              value={group.color}
              onChange={(e) => updateGroup(group.id, { color: e.target.value })}
              disabled={gameStarted}
            />
            <input
              type="text"
              value={group.name}
              onChange={(e) => updateGroup(group.id, { name: e.target.value })}
              disabled={gameStarted}
            />
            <span className="player-count">({getPlayerCount(group.id)} players)</span>
            <button
              className="btn-danger"
              onClick={() => removeGroup(group.id)}
              disabled={gameStarted || getPlayerCount(group.id) > 0}
              title={getPlayerCount(group.id) > 0 ? 'Remove players first' : 'Remove group'}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {!gameStarted && (
        <div className="add-form">
          <input
            type="color"
            value={newGroupColor}
            onChange={(e) => setNewGroupColor(e.target.value)}
          />
          <input
            type="text"
            placeholder="New group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
          />
          <button className="btn-primary" onClick={handleAddGroup}>
            Add Group
          </button>
        </div>
      )}
    </div>
  );
}
