export type PlayerColor = 'blue' | 'red';
export type TileOwner = PlayerColor | 'neutral';

export type HexCoord = {
  q: number;
  r: number;
};

export type GameStatus = 'playing' | 'finished';

export type GameState = {
  currentPlayer: PlayerColor;
  roundNumber: number;
  totalTurns: number;
  status: GameStatus;
  tiles: Record<string, TileOwner>;
  castles: Record<PlayerColor, HexCoord>;
  peasants: Record<PlayerColor, HexCoord>;
  winner: PlayerColor | 'tie' | null;
  winnerMessage: string;
};

export const BOARD_RADIUS = 5;
export const MAX_ROUNDS = 10;

export const coordKey = ({ q, r }: HexCoord) => `${q},${r}`;

export const areSameHex = (a: HexCoord, b: HexCoord) => a.q === b.q && a.r === b.r;

export const isInsideBoard = ({ q, r }: HexCoord) => {
  const distanceFromCenter = Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r));
  return distanceFromCenter <= BOARD_RADIUS;
};

export const getBoardHexes = (): HexCoord[] => {
  const hexes: HexCoord[] = [];

  for (let q = -BOARD_RADIUS; q <= BOARD_RADIUS; q += 1) {
    for (let r = -BOARD_RADIUS; r <= BOARD_RADIUS; r += 1) {
      const nextHex = { q, r };
      if (isInsideBoard(nextHex)) {
        hexes.push(nextHex);
      }
    }
  }

  return hexes;
};

export const getNeighbors = ({ q, r }: HexCoord): HexCoord[] => [
  { q: q + 1, r: r },
  { q: q + 1, r: r - 1 },
  { q: q, r: r - 1 },
  { q: q - 1, r: r },
  { q: q - 1, r: r + 1 },
  { q: q, r: r + 1 },
].filter(isInsideBoard);

export const getHexDistance = (a: HexCoord, b: HexCoord) => {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  const ds = -dq - dr;

  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(ds));
};

export const buildBoardTiles = () => {
  const tiles: Record<string, TileOwner> = {};

  getBoardHexes().forEach((hex) => {
    tiles[coordKey(hex)] = 'neutral';
  });

  return tiles;
};

export const createInitialGameState = (): GameState => {
  const tiles = buildBoardTiles();
  const castles: Record<PlayerColor, HexCoord> = {
    blue: { q: -5, r: 0 },
    red: { q: 5, r: 0 },
  };
  const peasants: Record<PlayerColor, HexCoord> = {
    blue: { q: -3, r: 0 },
    red: { q: 3, r: 0 },
  };

  tiles[coordKey(castles.blue)] = 'blue';
  tiles[coordKey(castles.red)] = 'red';

  return {
    currentPlayer: 'blue',
    roundNumber: 1,
    totalTurns: 0,
    status: 'playing',
    tiles,
    castles,
    peasants,
    winner: null,
    winnerMessage: '',
  };
};

export const countTerritory = (state: GameState) => {
  const counts: Record<PlayerColor, number> = { blue: 0, red: 0 };

  Object.values(state.tiles).forEach((owner) => {
    if (owner === 'blue') {
      counts.blue += 1;
    }
    if (owner === 'red') {
      counts.red += 1;
    }
  });

  return counts;
};

export const getMovementPath = (from: HexCoord, to: HexCoord): HexCoord[] | null => {
  if (areSameHex(from, to)) {
    return [from];
  }

  const queue: Array<{ hex: HexCoord; path: HexCoord[] }> = [{ hex: from, path: [from] }];
  const visited = new Set<string>([coordKey(from)]);

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      continue;
    }

    const neighbors = getNeighbors(current.hex);

    for (const neighbor of neighbors) {
      const neighborKey = coordKey(neighbor);

      if (visited.has(neighborKey)) {
        continue;
      }

      const nextPath = [...current.path, neighbor];
      if (areSameHex(neighbor, to)) {
        return nextPath;
      }

      if (current.path.length <= 2) {
        visited.add(neighborKey);
        queue.push({ hex: neighbor, path: nextPath });
      }
    }
  }

  return null;
};

export const getReachableTiles = (state: GameState, player: PlayerColor): HexCoord[] => {
  const origin = state.peasants[player];
  const reachable = new Map<string, HexCoord>();
  const queue: Array<{ hex: HexCoord; distance: number }> = [{ hex: origin, distance: 0 }];
  const visited = new Set<string>([coordKey(origin)]);

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      continue;
    }

    if (current.distance >= 2) {
      continue;
    }

    for (const neighbor of getNeighbors(current.hex)) {
      const neighborKey = coordKey(neighbor);
      if (visited.has(neighborKey)) {
        continue;
      }

      visited.add(neighborKey);
      queue.push({ hex: neighbor, distance: current.distance + 1 });
      reachable.set(neighborKey, neighbor);
    }
  }

  return Array.from(reachable.values());
};

export const determineWinner = (state: GameState) => {
  const scores = countTerritory(state);

  if (scores.blue === scores.red) {
    return {
      winner: 'tie' as const,
      message: 'The match is a tie. Both castles control the same number of hexes.',
    };
  }

  const winner: PlayerColor = scores.blue > scores.red ? 'blue' : 'red';
  return {
    winner,
    message: `${winner === 'blue' ? 'Blue' : 'Red'} wins with ${scores[winner]} hexes to ${scores[winner === 'blue' ? 'red' : 'blue']}.`,
  };
};

export const applyMove = (state: GameState, destination: HexCoord): GameState => {
  if (state.status === 'finished') {
    return state;
  }

  const player = state.currentPlayer;
  const from = state.peasants[player];
  const path = getMovementPath(from, destination);

  if (!path || path.length > 3) {
    return state;
  }

  const reachableTiles = getReachableTiles(state, player);
  const isReachable = reachableTiles.some((tile) => areSameHex(tile, destination));
  if (!isReachable) {
    return state;
  }

  const nextState: GameState = {
    ...state,
    tiles: { ...state.tiles },
    peasants: { ...state.peasants },
    castles: { ...state.castles },
    winner: null,
    winnerMessage: '',
  };

  path.forEach((hex) => {
    nextState.tiles[coordKey(hex)] = player;
  });

  nextState.peasants[player] = destination;
  nextState.totalTurns += 1;

  const nextPlayer = player === 'blue' ? 'red' : 'blue';

  if (player === 'red') {
    nextState.roundNumber += 1;
  }

  nextState.currentPlayer = nextPlayer;

  if (nextState.totalTurns >= MAX_ROUNDS * 2) {
    nextState.status = 'finished';
    const result = determineWinner(nextState);
    nextState.winner = result.winner;
    nextState.winnerMessage = result.message;
  }

  return nextState;
};
