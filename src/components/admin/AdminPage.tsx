import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { GroupEditor } from './GroupEditor';
import { PlayerEditor } from './PlayerEditor';
import { ChallengeEditor } from './ChallengeEditor';
import { CoupleEditor } from './CoupleEditor';
import { GameManager } from './GameManager';
import { AssignmentsView } from './AssignmentsView';

type Tab = 'game' | 'groups' | 'players' | 'challenges' | 'couples' | 'assignments';

export function AdminPage() {
  const { config } = useGameStore();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('game');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === config.adminPassword) {
      setAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  if (!authenticated) {
    return (
      <div className="admin-login">
        <h2>Admin Access</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary">
            Login
          </button>
        </form>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'game', label: 'Game' },
    { id: 'groups', label: 'Groups' },
    { id: 'players', label: 'Players' },
    { id: 'challenges', label: 'Challenges' },
    { id: 'couples', label: 'Constraints' },
    { id: 'assignments', label: 'Assignments' },
  ];

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <button className="btn-secondary" onClick={() => setAuthenticated(false)}>
          Logout
        </button>
      </div>

      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === 'game' && <GameManager />}
        {activeTab === 'groups' && <GroupEditor />}
        {activeTab === 'players' && <PlayerEditor />}
        {activeTab === 'challenges' && <ChallengeEditor />}
        {activeTab === 'couples' && <CoupleEditor />}
        {activeTab === 'assignments' && <AssignmentsView />}
      </div>
    </div>
  );
}
