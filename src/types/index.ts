export interface Player {
  id: string;
  name: string;
  groupId: string;
}

export interface Group {
  id: string;
  name: string;
  color: string;
}

export interface Challenge {
  id: string;
  text: string;
}

export interface Couple {
  player1Id: string;
  player2Id: string;
}

export interface Assignment {
  playerId: string;
  targetId: string;
  challengeId: string;
  completed: boolean;
  completedAt?: number;
}

export interface GameConfig {
  title: string;
  spreadFactor: number; // 0-1, how dispersed groups should be in the ring
  adminPassword: string;
}

export interface GameState {
  config: GameConfig;
  groups: Group[];
  players: Player[];
  challenges: Challenge[];
  couples: Couple[];
  assignments: Assignment[];
  ringOrder: string[]; // Player IDs in ring order
  gameStarted: boolean;
  gameStartedAt?: number;
}
