import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, Group, Player, Challenge, Couple, GameConfig } from '../types';
import { defaultConfig, defaultGroups, defaultChallenges } from '../data/defaultData';
import { generateRingAssignments, eliminatePlayer } from '../utils/gameLogic';

interface GameStore extends GameState {
  // Config actions
  updateConfig: (config: Partial<GameConfig>) => void;

  // Group actions
  addGroup: (group: Group) => void;
  updateGroup: (id: string, group: Partial<Group>) => void;
  removeGroup: (id: string) => void;

  // Player actions
  addPlayer: (player: Player) => void;
  updatePlayer: (id: string, player: Partial<Player>) => void;
  removePlayer: (id: string) => void;
  importPlayers: (players: Player[]) => void;

  // Challenge actions
  addChallenge: (challenge: Challenge) => void;
  updateChallenge: (id: string, challenge: Partial<Challenge>) => void;
  removeChallenge: (id: string) => void;
  importChallenges: (challenges: Challenge[]) => void;

  // Couple actions
  addCouple: (couple: Couple) => void;
  removeCouple: (player1Id: string, player2Id: string) => void;

  // Game actions
  startGame: () => void;
  resetGame: () => void;
  markElimination: (eliminatedPlayerId: string) => void;

  // Data actions
  exportData: () => string;
  importData: (json: string) => boolean;
  resetToDefaults: () => void;
}

const initialState: GameState = {
  config: defaultConfig,
  groups: defaultGroups,
  players: [],
  challenges: defaultChallenges,
  couples: [],
  assignments: [],
  ringOrder: [],
  gameStarted: false,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      updateConfig: (config) => set((state) => ({
        config: { ...state.config, ...config }
      })),

      addGroup: (group) => set((state) => ({
        groups: [...state.groups, group]
      })),

      updateGroup: (id, group) => set((state) => ({
        groups: state.groups.map(g => g.id === id ? { ...g, ...group } : g)
      })),

      removeGroup: (id) => set((state) => ({
        groups: state.groups.filter(g => g.id !== id),
        players: state.players.filter(p => p.groupId !== id)
      })),

      addPlayer: (player) => set((state) => ({
        players: [...state.players, player]
      })),

      updatePlayer: (id, player) => set((state) => ({
        players: state.players.map(p => p.id === id ? { ...p, ...player } : p)
      })),

      removePlayer: (id) => set((state) => ({
        players: state.players.filter(p => p.id !== id),
        couples: state.couples.filter(c => c.player1Id !== id && c.player2Id !== id)
      })),

      importPlayers: (players) => set(() => ({ players })),

      addChallenge: (challenge) => set((state) => ({
        challenges: [...state.challenges, challenge]
      })),

      updateChallenge: (id, challenge) => set((state) => ({
        challenges: state.challenges.map(c => c.id === id ? { ...c, ...challenge } : c)
      })),

      removeChallenge: (id) => set((state) => ({
        challenges: state.challenges.filter(c => c.id !== id)
      })),

      importChallenges: (challenges) => set(() => ({ challenges })),

      addCouple: (couple) => set((state) => ({
        couples: [...state.couples, couple]
      })),

      removeCouple: (player1Id, player2Id) => set((state) => ({
        couples: state.couples.filter(
          c => !(
            (c.player1Id === player1Id && c.player2Id === player2Id) ||
            (c.player1Id === player2Id && c.player2Id === player1Id)
          )
        )
      })),

      startGame: () => {
        const state = get();
        const { assignments, ringOrder } = generateRingAssignments(
          state.players,
          state.couples,
          state.challenges,
          state.config.spreadFactor
        );
        set({
          assignments,
          ringOrder,
          gameStarted: true,
          gameStartedAt: Date.now()
        });
      },

      resetGame: () => set({
        assignments: [],
        ringOrder: [],
        gameStarted: false,
        gameStartedAt: undefined
      }),

      markElimination: (eliminatedPlayerId) => set((state) => ({
        assignments: eliminatePlayer(eliminatedPlayerId, state.assignments)
      })),

      exportData: () => {
        const state = get();
        return JSON.stringify({
          config: state.config,
          groups: state.groups,
          players: state.players,
          challenges: state.challenges,
          couples: state.couples,
          assignments: state.assignments,
          ringOrder: state.ringOrder,
          gameStarted: state.gameStarted,
          gameStartedAt: state.gameStartedAt,
        }, null, 2);
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          set({
            config: data.config || defaultConfig,
            groups: data.groups || [],
            players: data.players || [],
            challenges: data.challenges || [],
            couples: data.couples || [],
            assignments: data.assignments || [],
            ringOrder: data.ringOrder || [],
            gameStarted: data.gameStarted || false,
            gameStartedAt: data.gameStartedAt,
          });
          return true;
        } catch {
          return false;
        }
      },

      resetToDefaults: () => set(initialState),
    }),
    {
      name: 'killer-game-storage',
    }
  )
);
