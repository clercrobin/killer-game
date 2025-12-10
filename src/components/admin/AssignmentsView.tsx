import { useGameStore } from '../../store/gameStore';

export function AssignmentsView() {
  const {
    assignments,
    players,
    challenges,
    groups,
    gameStarted,
    markElimination,
  } = useGameStore();

  if (!gameStarted || assignments.length === 0) {
    return (
      <div className="card">
        <h3>Assignments</h3>
        <p className="empty-message">Start the game to see assignments.</p>
      </div>
    );
  }

  const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || 'Unknown';
  const getChallenge = (id: string) => challenges.find(c => c.id === id)?.text || 'Unknown';
  const getGroupColor = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return groups.find(g => g.id === player?.groupId)?.color || '#888';
  };

  const handleEliminate = (playerId: string) => {
    const playerName = getPlayerName(playerId);
    if (confirm(`Mark ${playerName} as eliminated?`)) {
      markElimination(playerId);
    }
  };

  const activeAssignments = assignments.filter(a => !a.completed);
  const completedAssignments = assignments.filter(a => a.completed);

  return (
    <div className="card">
      <h3>Assignments ({activeAssignments.length} active)</h3>

      <h4>Active Players</h4>
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
          {activeAssignments.map(assignment => (
            <tr key={assignment.playerId}>
              <td>
                <span
                  className="color-dot"
                  style={{ backgroundColor: getGroupColor(assignment.playerId) }}
                />
                {getPlayerName(assignment.playerId)}
              </td>
              <td>
                <span
                  className="color-dot"
                  style={{ backgroundColor: getGroupColor(assignment.targetId) }}
                />
                {getPlayerName(assignment.targetId)}
              </td>
              <td className="challenge-cell">{getChallenge(assignment.challengeId)}</td>
              <td>
                <button
                  className="btn-danger btn-small"
                  onClick={() => handleEliminate(assignment.targetId)}
                >
                  Eliminate Target
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {completedAssignments.length > 0 && (
        <>
          <h4>Eliminated ({completedAssignments.length})</h4>
          <div className="eliminated-list">
            {completedAssignments.map(assignment => (
              <span key={assignment.playerId} className="eliminated-player">
                {getPlayerName(assignment.playerId)}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
