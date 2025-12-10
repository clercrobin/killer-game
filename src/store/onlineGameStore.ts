import { create } from 'zustand';
import type { Group, Player, Challenge, Couple, Assignment } from '../types';
import * as gameService from '../lib/gameService';
import { generateRingAssignments } from '../utils/gameLogic';

interface GameData {
  id: string;
  code: string;
  title: string;
  adminPassword: string;
  spreadFactor: number;
  started: boolean;
  startedAt?: number;
}

interface OnlineGameState {
  // Connection state
  isOnline: boolean;
  isLoading: boolean;
  error: string | null;

  // Current game
  game: GameData | null;
  groups: Group[];
  players: Player[];
  challenges: Challenge[];
  couples: Couple[];
  assignments: Assignment[];
  ringOrder: string[];

  // Actions
  setError: (error: string | null) => void;
  clearError: () => void;

  // Game actions
  createGame: (title: string, adminPassword: string) => Promise<string>;
  joinGame: (code: string) => Promise<boolean>;
  leaveGame: () => void;
  loadGameData: () => Promise<void>;

  // Group actions
  addGroup: (name: string, color: string) => Promise<void>;
  updateGroup: (id: string, updates: { name?: string; color?: string }) => Promise<void>;
  removeGroup: (id: string) => Promise<void>;

  // Player actions
  addPlayer: (name: string, groupId: string) => Promise<void>;
  addPlayers: (names: string[], groupId: string) => Promise<void>;
  updatePlayer: (id: string, updates: { name?: string; groupId?: string }) => Promise<void>;
  removePlayer: (id: string) => Promise<void>;

  // Challenge actions
  addChallenge: (text: string) => Promise<void>;
  addChallenges: (texts: string[]) => Promise<void>;
  updateChallenge: (id: string, text: string) => Promise<void>;
  removeChallenge: (id: string) => Promise<void>;

  // Couple actions
  addCouple: (player1Id: string, player2Id: string) => Promise<void>;
  removeCouple: (player1Id: string, player2Id: string) => Promise<void>;

  // Game control
  startGame: () => Promise<void>;
  resetGame: () => Promise<void>;
  markElimination: (eliminatedPlayerId: string) => Promise<void>;
}

export const useOnlineGameStore = create<OnlineGameState>((set, get) => ({
  isOnline: gameService.isSupabaseConfigured(),
  isLoading: false,
  error: null,

  game: null,
  groups: [],
  players: [],
  challenges: [],
  couples: [],
  assignments: [],
  ringOrder: [],

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  createGame: async (title, adminPassword) => {
    set({ isLoading: true, error: null });
    try {
      const game = await gameService.createGame(title, adminPassword);
      set({
        game: {
          id: game.id,
          code: game.code,
          title: game.title,
          adminPassword: game.admin_password,
          spreadFactor: Number(game.spread_factor),
          started: game.started,
          startedAt: game.started_at ? new Date(game.started_at).getTime() : undefined,
        },
        groups: [],
        players: [],
        challenges: [],
        couples: [],
        assignments: [],
        ringOrder: [],
        isLoading: false,
      });
      return game.code;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  joinGame: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const game = await gameService.getGameByCode(code);
      if (!game) {
        set({ error: 'Game not found', isLoading: false });
        return false;
      }
      set({
        game: {
          id: game.id,
          code: game.code,
          title: game.title,
          adminPassword: game.admin_password,
          spreadFactor: Number(game.spread_factor),
          started: game.started,
          startedAt: game.started_at ? new Date(game.started_at).getTime() : undefined,
        },
        isLoading: false,
      });
      await get().loadGameData();
      return true;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return false;
    }
  },

  leaveGame: () => {
    set({
      game: null,
      groups: [],
      players: [],
      challenges: [],
      couples: [],
      assignments: [],
      ringOrder: [],
    });
  },

  loadGameData: async () => {
    const { game } = get();
    if (!game) return;

    set({ isLoading: true });
    try {
      const [groups, players, challenges, couples, assignments] = await Promise.all([
        gameService.getGroups(game.id),
        gameService.getPlayers(game.id),
        gameService.getChallenges(game.id),
        gameService.getCouples(game.id),
        gameService.getAssignments(game.id),
      ]);

      const ringOrder = assignments
        .filter(a => !a.completed)
        .sort((a, b) => {
          const aIdx = assignments.findIndex(x => x.playerId === a.playerId);
          const bIdx = assignments.findIndex(x => x.playerId === b.playerId);
          return aIdx - bIdx;
        })
        .map(a => a.playerId);

      set({ groups, players, challenges, couples, assignments, ringOrder, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addGroup: async (name, color) => {
    const { game } = get();
    if (!game) return;

    try {
      const group = await gameService.createGroup(game.id, name, color);
      set(state => ({ groups: [...state.groups, group] }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateGroup: async (id, updates) => {
    try {
      await gameService.updateGroup(id, updates);
      set(state => ({
        groups: state.groups.map(g => g.id === id ? { ...g, ...updates } : g),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  removeGroup: async (id) => {
    try {
      await gameService.deleteGroup(id);
      set(state => ({
        groups: state.groups.filter(g => g.id !== id),
        players: state.players.filter(p => p.groupId !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addPlayer: async (name, groupId) => {
    const { game } = get();
    if (!game) return;

    try {
      const player = await gameService.createPlayer(game.id, name, groupId);
      set(state => ({ players: [...state.players, player] }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addPlayers: async (names, groupId) => {
    const { game } = get();
    if (!game) return;

    try {
      for (const name of names) {
        const player = await gameService.createPlayer(game.id, name.trim(), groupId);
        set(state => ({ players: [...state.players, player] }));
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updatePlayer: async (id, updates) => {
    try {
      await gameService.updatePlayer(id, updates);
      set(state => ({
        players: state.players.map(p => p.id === id ? { ...p, ...updates } : p),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  removePlayer: async (id) => {
    try {
      await gameService.deletePlayer(id);
      set(state => ({
        players: state.players.filter(p => p.id !== id),
        couples: state.couples.filter(c => c.player1Id !== id && c.player2Id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addChallenge: async (text) => {
    const { game } = get();
    if (!game) return;

    try {
      const challenge = await gameService.createChallenge(game.id, text);
      set(state => ({ challenges: [...state.challenges, challenge] }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addChallenges: async (texts) => {
    const { game } = get();
    if (!game) return;

    try {
      for (const text of texts) {
        const challenge = await gameService.createChallenge(game.id, text.trim());
        set(state => ({ challenges: [...state.challenges, challenge] }));
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateChallenge: async (id, text) => {
    try {
      await gameService.updateChallenge(id, text);
      set(state => ({
        challenges: state.challenges.map(c => c.id === id ? { ...c, text } : c),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  removeChallenge: async (id) => {
    try {
      await gameService.deleteChallenge(id);
      set(state => ({ challenges: state.challenges.filter(c => c.id !== id) }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addCouple: async (player1Id, player2Id) => {
    const { game } = get();
    if (!game) return;

    try {
      await gameService.createCouple(game.id, player1Id, player2Id);
      set(state => ({ couples: [...state.couples, { player1Id, player2Id }] }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  removeCouple: async (player1Id, player2Id) => {
    const { game } = get();
    if (!game) return;

    try {
      await gameService.deleteCouple(game.id, player1Id, player2Id);
      set(state => ({
        couples: state.couples.filter(c =>
          !((c.player1Id === player1Id && c.player2Id === player2Id) ||
            (c.player1Id === player2Id && c.player2Id === player1Id))
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  startGame: async () => {
    const { game, players, challenges, couples } = get();
    if (!game || players.length < 3 || challenges.length === 0) return;

    try {
      // Generate ring assignments
      const { assignments: newAssignments, ringOrder } = generateRingAssignments(
        players,
        couples,
        challenges,
        game.spreadFactor
      );

      // Save assignments to database
      await gameService.createAssignments(
        game.id,
        newAssignments.map((a, i) => ({
          playerId: a.playerId,
          targetId: a.targetId,
          challengeId: a.challengeId,
          ringOrder: i,
        }))
      );

      // Update game status
      await gameService.updateGame(game.id, {
        started: true,
        started_at: new Date().toISOString(),
      });

      set({
        game: { ...game, started: true, startedAt: Date.now() },
        assignments: newAssignments,
        ringOrder,
      });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  resetGame: async () => {
    const { game } = get();
    if (!game) return;

    try {
      await gameService.deleteAssignments(game.id);
      await gameService.updateGame(game.id, { started: false, started_at: undefined });

      set({
        game: { ...game, started: false, startedAt: undefined },
        assignments: [],
        ringOrder: [],
      });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  markElimination: async (eliminatedPlayerId) => {
    const { game, assignments } = get();
    if (!game) return;

    try {
      // Find who was hunting the eliminated player
      const hunterAssignment = assignments.find(a => a.targetId === eliminatedPlayerId);
      // Find who the eliminated player was hunting
      const eliminatedAssignment = assignments.find(a => a.playerId === eliminatedPlayerId);

      if (!hunterAssignment || !eliminatedAssignment) return;

      // Update hunter's assignment - they now target the eliminated player's target
      // and inherit the eliminated player's challenge
      await gameService.updateAssignment(game.id, hunterAssignment.playerId, {
        targetId: eliminatedAssignment.targetId,
        challengeId: eliminatedAssignment.challengeId,
      });

      // Mark eliminated player's assignment as completed
      await gameService.updateAssignment(game.id, eliminatedPlayerId, {
        completed: true,
        completedAt: new Date().toISOString(),
      });

      // Update local state
      const now = Date.now();
      set(state => ({
        assignments: state.assignments.map(a => {
          if (a.playerId === hunterAssignment.playerId) {
            return {
              ...a,
              targetId: eliminatedAssignment.targetId,
              challengeId: eliminatedAssignment.challengeId,
            };
          }
          if (a.playerId === eliminatedPlayerId) {
            return { ...a, completed: true, completedAt: now };
          }
          return a;
        }),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
