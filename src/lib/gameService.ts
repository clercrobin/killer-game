import { supabase, isSupabaseConfigured } from './supabase';
import type { Group, Player, Challenge, Couple, Assignment } from '../types';

// Database row types
interface GameRow {
  id: string;
  code: string;
  title: string;
  admin_password: string;
  spread_factor: number;
  started: boolean;
  started_at: string | null;
  created_at: string;
}

interface GroupRow {
  id: string;
  game_id: string;
  name: string;
  color: string;
  created_at: string;
}

interface PlayerRow {
  id: string;
  game_id: string;
  group_id: string;
  name: string;
  created_at: string;
}

interface ChallengeRow {
  id: string;
  game_id: string;
  text: string;
  created_at: string;
}

interface CoupleRow {
  id: string;
  game_id: string;
  player1_id: string;
  player2_id: string;
  created_at: string;
}

interface AssignmentRow {
  id: string;
  game_id: string;
  player_id: string;
  target_id: string;
  challenge_id: string;
  completed: boolean;
  completed_at: string | null;
  ring_order: number;
  created_at: string;
}

// Generate a random game code
export function generateGameCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create a new game
export async function createGame(title: string, adminPassword: string): Promise<GameRow> {
  if (!supabase) throw new Error('Supabase not configured');

  const code = generateGameCode();
  const { data, error } = await supabase
    .from('games')
    .insert({ code, title, admin_password: adminPassword })
    .select()
    .single();

  if (error) throw error;
  return data as GameRow;
}

// Get game by code
export async function getGameByCode(code: string): Promise<GameRow | null> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data as GameRow;
}

// Update game
export async function updateGame(gameId: string, updates: { title?: string; spread_factor?: number; started?: boolean; started_at?: string | null }): Promise<GameRow> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('games')
    .update(updates)
    .eq('id', gameId)
    .select()
    .single();

  if (error) throw error;
  return data as GameRow;
}

// Groups
export async function getGroups(gameId: string): Promise<Group[]> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('game_id', gameId)
    .order('created_at');

  if (error) throw error;
  return (data as GroupRow[]).map(g => ({ id: g.id, name: g.name, color: g.color }));
}

export async function createGroup(gameId: string, name: string, color: string): Promise<Group> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('groups')
    .insert({ game_id: gameId, name, color })
    .select()
    .single();

  if (error) throw error;
  const row = data as GroupRow;
  return { id: row.id, name: row.name, color: row.color };
}

export async function updateGroup(groupId: string, updates: { name?: string; color?: string }): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('groups')
    .update(updates)
    .eq('id', groupId);

  if (error) throw error;
}

export async function deleteGroup(groupId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId);

  if (error) throw error;
}

// Players
export async function getPlayers(gameId: string): Promise<Player[]> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameId)
    .order('created_at');

  if (error) throw error;
  return (data as PlayerRow[]).map(p => ({ id: p.id, name: p.name, groupId: p.group_id }));
}

export async function createPlayer(gameId: string, name: string, groupId: string): Promise<Player> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('players')
    .insert({ game_id: gameId, name, group_id: groupId })
    .select()
    .single();

  if (error) throw error;
  const row = data as PlayerRow;
  return { id: row.id, name: row.name, groupId: row.group_id };
}

export async function updatePlayer(playerId: string, updates: { name?: string; groupId?: string }): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const dbUpdates: { name?: string; group_id?: string } = {};
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.groupId) dbUpdates.group_id = updates.groupId;

  const { error } = await supabase
    .from('players')
    .update(dbUpdates)
    .eq('id', playerId);

  if (error) throw error;
}

export async function deletePlayer(playerId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', playerId);

  if (error) throw error;
}

// Challenges
export async function getChallenges(gameId: string): Promise<Challenge[]> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('game_id', gameId)
    .order('created_at');

  if (error) throw error;
  return (data as ChallengeRow[]).map(c => ({ id: c.id, text: c.text }));
}

export async function createChallenge(gameId: string, text: string): Promise<Challenge> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('challenges')
    .insert({ game_id: gameId, text })
    .select()
    .single();

  if (error) throw error;
  const row = data as ChallengeRow;
  return { id: row.id, text: row.text };
}

export async function updateChallenge(challengeId: string, text: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('challenges')
    .update({ text })
    .eq('id', challengeId);

  if (error) throw error;
}

export async function deleteChallenge(challengeId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('challenges')
    .delete()
    .eq('id', challengeId);

  if (error) throw error;
}

// Couples
export async function getCouples(gameId: string): Promise<Couple[]> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('couples')
    .select('*')
    .eq('game_id', gameId);

  if (error) throw error;
  return (data as CoupleRow[]).map(c => ({ player1Id: c.player1_id, player2Id: c.player2_id }));
}

export async function createCouple(gameId: string, player1Id: string, player2Id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('couples')
    .insert({ game_id: gameId, player1_id: player1Id, player2_id: player2Id });

  if (error) throw error;
}

export async function deleteCouple(gameId: string, player1Id: string, player2Id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('couples')
    .delete()
    .eq('game_id', gameId)
    .or(`and(player1_id.eq.${player1Id},player2_id.eq.${player2Id}),and(player1_id.eq.${player2Id},player2_id.eq.${player1Id})`);

  if (error) throw error;
}

// Assignments
export async function getAssignments(gameId: string): Promise<Assignment[]> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('game_id', gameId)
    .order('ring_order');

  if (error) throw error;
  return (data as AssignmentRow[]).map(a => ({
    playerId: a.player_id,
    targetId: a.target_id,
    challengeId: a.challenge_id,
    completed: a.completed,
    completedAt: a.completed_at ? new Date(a.completed_at).getTime() : undefined,
  }));
}

export async function createAssignments(gameId: string, assignments: { playerId: string; targetId: string; challengeId: string; ringOrder: number }[]): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('assignments')
    .insert(assignments.map(a => ({
      game_id: gameId,
      player_id: a.playerId,
      target_id: a.targetId,
      challenge_id: a.challengeId,
      ring_order: a.ringOrder,
    })));

  if (error) throw error;
}

export async function updateAssignment(gameId: string, playerId: string, updates: { targetId?: string; challengeId?: string; completed?: boolean; completedAt?: string }): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const dbUpdates: { target_id?: string; challenge_id?: string; completed?: boolean; completed_at?: string } = {};
  if (updates.targetId) dbUpdates.target_id = updates.targetId;
  if (updates.challengeId) dbUpdates.challenge_id = updates.challengeId;
  if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
  if (updates.completedAt) dbUpdates.completed_at = updates.completedAt;

  const { error } = await supabase
    .from('assignments')
    .update(dbUpdates)
    .eq('game_id', gameId)
    .eq('player_id', playerId);

  if (error) throw error;
}

export async function deleteAssignments(gameId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('game_id', gameId);

  if (error) throw error;
}

// Get player assignment (for player view)
export async function getPlayerAssignment(gameId: string, playerName: string) {
  if (!supabase) throw new Error('Supabase not configured');

  // First find the player
  const { data: players, error: playerError } = await supabase
    .from('players')
    .select('id, name, group_id')
    .eq('game_id', gameId)
    .ilike('name', playerName);

  if (playerError) throw playerError;
  if (!players || players.length === 0) return null;

  const player = players[0] as PlayerRow;

  // Get the assignment
  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select(`
      *,
      target:players!assignments_target_id_fkey(id, name, group_id),
      challenge:challenges(id, text)
    `)
    .eq('game_id', gameId)
    .eq('player_id', player.id)
    .single();

  if (assignmentError) {
    if (assignmentError.code === 'PGRST116') return null; // Not found
    throw assignmentError;
  }

  // Get group info
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('name, color')
    .eq('id', player.group_id)
    .single();

  if (groupError) throw groupError;

  const assignmentData = assignment as AssignmentRow & { target: PlayerRow; challenge: ChallengeRow };

  return {
    player: { id: player.id, name: player.name, groupId: player.group_id },
    group: { name: (group as GroupRow).name, color: (group as GroupRow).color },
    target: assignmentData.target,
    challenge: assignmentData.challenge,
    completed: assignmentData.completed,
  };
}

// Subscribe to assignment changes
export function subscribeToAssignments(gameId: string, callback: () => void) {
  if (!supabase) return () => {};

  const subscription = supabase
    .channel(`assignments:${gameId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments', filter: `game_id=eq.${gameId}` }, callback)
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

export { isSupabaseConfigured };
