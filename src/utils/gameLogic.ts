import type { Player, Couple, Assignment, Challenge } from '../types';

function shuffleArray<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function areCouple(coupleMap: Map<string, Set<string>>, id1: string, id2: string): boolean {
  return coupleMap.get(id1)?.has(id2) ?? false;
}

function buildCoupleMap(couples: Couple[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();

  for (const couple of couples) {
    if (!map.has(couple.player1Id)) map.set(couple.player1Id, new Set());
    if (!map.has(couple.player2Id)) map.set(couple.player2Id, new Set());
    map.get(couple.player1Id)!.add(couple.player2Id);
    map.get(couple.player2Id)!.add(couple.player1Id);
  }

  return map;
}

function groupSpreadScore(order: Player[], n: number): number {
  const groupPositions: Record<string, number[]> = {};

  order.forEach((p, i) => {
    if (!groupPositions[p.groupId]) groupPositions[p.groupId] = [];
    groupPositions[p.groupId].push(i);
  });

  let totalSpread = 0;
  let groupCount = 0;

  for (const gId in groupPositions) {
    const positions = groupPositions[gId].sort((a, b) => a - b);
    if (positions.length < 2) continue;

    let sumGaps = 0;
    for (let i = 0; i < positions.length; i++) {
      const next = (i + 1) % positions.length;
      const gap = next === 0
        ? (n - positions[i]) + positions[0]
        : positions[next] - positions[i];
      sumGaps += gap;
    }

    const idealGap = n / positions.length;
    const avgGap = sumGaps / positions.length;
    totalSpread += Math.min(avgGap / idealGap, 1);
    groupCount++;
  }

  return groupCount ? totalSpread / groupCount : 0;
}

function coupleDistanceScore(
  order: Player[],
  couples: Couple[],
  n: number
): number {
  if (!couples.length) return 1;

  const idx = new Map<string, number>();
  order.forEach((p, i) => idx.set(p.id, i));

  let minDist = n;

  for (const couple of couples) {
    const iA = idx.get(couple.player1Id);
    const iB = idx.get(couple.player2Id);
    if (iA === undefined || iB === undefined) continue;

    const dist = Math.min(Math.abs(iA - iB), n - Math.abs(iA - iB));
    if (dist < minDist) minDist = dist;
  }

  return minDist / (n / 2);
}

function isValidRing(
  order: Player[],
  coupleMap: Map<string, Set<string>>
): boolean {
  const n = order.length;
  for (let i = 0; i < n; i++) {
    const a = order[i];
    const b = order[(i + 1) % n];
    if (areCouple(coupleMap, a.id, b.id)) return false;
  }
  return true;
}

export function generateRingAssignments(
  players: Player[],
  couples: Couple[],
  challenges: Challenge[],
  spreadTarget: number
): { assignments: Assignment[]; ringOrder: string[] } {
  const coupleMap = buildCoupleMap(couples);
  const n = players.length;

  const maxTries = 5000;
  let bestOrder: Player[] | null = null;
  let bestScore = -Infinity;

  for (let t = 0; t < maxTries; t++) {
    const order = shuffleArray(players);
    if (!isValidRing(order, coupleMap)) continue;

    const coupleScore = coupleDistanceScore(order, couples, n);
    const spreadScore = groupSpreadScore(order, n);
    const score = coupleScore * 100 + spreadScore * spreadTarget * 50;

    if (score > bestScore) {
      bestScore = score;
      bestOrder = order;
    }
  }

  const order = bestOrder || shuffleArray(players);
  const shuffledChallenges = shuffleArray(challenges);

  const assignments: Assignment[] = [];
  const ringOrder: string[] = [];

  for (let i = 0; i < order.length; i++) {
    const player = order[i];
    const target = order[(i + 1) % order.length];
    const challenge = shuffledChallenges[i % shuffledChallenges.length];

    ringOrder.push(player.id);
    assignments.push({
      playerId: player.id,
      targetId: target.id,
      challengeId: challenge.id,
      completed: false,
    });
  }

  return { assignments, ringOrder };
}

export function getPlayerAssignment(
  playerId: string,
  assignments: Assignment[]
): Assignment | undefined {
  return assignments.find(a => a.playerId === playerId);
}

export function eliminatePlayer(
  eliminatedPlayerId: string,
  assignments: Assignment[]
): Assignment[] {
  // Find who was hunting the eliminated player
  const hunterAssignment = assignments.find(a => a.targetId === eliminatedPlayerId);
  // Find who the eliminated player was hunting
  const eliminatedAssignment = assignments.find(a => a.playerId === eliminatedPlayerId);

  if (!hunterAssignment || !eliminatedAssignment) return assignments;

  // Update assignments: hunter now targets the eliminated player's target
  return assignments.map(a => {
    if (a.playerId === hunterAssignment.playerId) {
      return {
        ...a,
        targetId: eliminatedAssignment.targetId,
        completed: true,
        completedAt: Date.now(),
      };
    }
    if (a.playerId === eliminatedPlayerId) {
      return { ...a, completed: true, completedAt: Date.now() };
    }
    return a;
  });
}
