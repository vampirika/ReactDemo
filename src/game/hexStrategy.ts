export type PlayerColor = 'blue' | 'red';
export type TileOwner = PlayerColor | 'neutral';

export type HexCoord = {
  q: number;
  r: number;
};

export type Peasant = {
  id: string;
  player: PlayerColor;
  position: HexCoord;
  moved: boolean;
};

export type GameStatus = 'playing' | 'finished';

export type GameState = {
  currentPlayer: PlayerColor;
  roundNumber: number;
  totalTurns: number;
  status: GameStatus;
  tiles: Record<string, TileOwner>;
  castles: Record<PlayerColor, HexCoord>;
  peasants: Record<PlayerColor, Peasant[]>;
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
  { q: q + 1, r },
  { q: q + 1, r: r - 1 },
  { q, r: r - 1 },
  { q: q - 1, r },
  { q: q - 1, r: r + 1 },
  { q, r: r + 1 },
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

export const getPeasantById = (state: GameState, peasantId: string) => {
  for (const player of ['blue', 'red'] as PlayerColor[]) {
    const unit = state.peasants[player].find((peasant) => peasant.id === peasantId);
    if (unit) {
      return unit;
    }
  }

  return null;
};

export const getPeasantAtHex = (state: GameState, hex: HexCoord, ignoreId?: string) => {
  for (const player of ['blue', 'red'] as PlayerColor[]) {
    const unit = state.peasants[player].find(
      (peasant) => peasant.id !== ignoreId && areSameHex(peasant.position, hex),
    );
    if (unit) {
      return unit;
    }
  }

  return null;
};

export const createInitialGameState = (): GameState => {
  const tiles = buildBoardTiles();
  const castles: Record<PlayerColor, HexCoord> = {
    blue: { q: -5, r: 0 },
    red: { q: 5, r: 0 },
  };

  const peasants: Record<PlayerColor, Peasant[]> = {
    blue: [
      { id: 'blue-1', player: 'blue', position: { q: -4, r: 0 }, moved: false },
      { id: 'blue-2', player: 'blue', position: { q: -3, r: 1 }, moved: false },
    ],
    red: [
      { id: 'red-1', player: 'red', position: { q: 4, r: 0 }, moved: false },
      { id: 'red-2', player: 'red', position: { q: 3, r: -1 }, moved: false },
    ],
  };

  tiles[coordKey(castles.blue)] = 'blue';
  tiles[coordKey(castles.red)] = 'red';

  peasants.blue.forEach((peasant) => {
    tiles[coordKey(peasant.position)] = 'blue';
  });

  peasants.red.forEach((peasant) => {
    tiles[coordKey(peasant.position)] = 'red';
  });

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

export const getMovementPath = (from: HexCoord, to: HexCoord, maxDistance = 2): HexCoord[] | null => {
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

      if (current.path.length <= maxDistance) {
        visited.add(neighborKey);
        queue.push({ hex: neighbor, path: nextPath });
      }
    }
  }

  return null;
};

export const getReachableTiles = (state: GameState, player: PlayerColor, peasantId?: string): HexCoord[] => {
  const activePeasant = peasantId
    ? state.peasants[player].find((peasant) => peasant.id === peasantId)
    : state.peasants[player].find((peasant) => !peasant.moved) ?? state.peasants[player][0];

  if (!activePeasant) {
    return [];
  }

  const origin = activePeasant.position;
  const reachable = new Map<string, HexCoord>();
  const queue: Array<{ hex: HexCoord; path: HexCoord[] }> = [{ hex: origin, path: [origin] }];
  const visited = new Set<string>([coordKey(origin)]);

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      continue;
    }

    if (current.path.length >= 3) {
      continue;
    }

    for (const neighbor of getNeighbors(current.hex)) {
      const neighborKey = coordKey(neighbor);

      if (visited.has(neighborKey)) {
        continue;
      }

      const nextPath = [...current.path, neighbor];
      const isOccupied = Boolean(getPeasantAtHex(state, neighbor, activePeasant.id));

      if (isOccupied) {
        continue;
      }

      visited.add(neighborKey);
      reachable.set(neighborKey, neighbor);
      queue.push({ hex: neighbor, path: nextPath });
    }
  }

  return Array.from(reachable.values());
};

export const canPeasantMoveTo = (state: GameState, peasantId: string, destination: HexCoord) => {
  const activePeasant = getPeasantById(state, peasantId);
  if (!activePeasant || activePeasant.player !== state.currentPlayer || activePeasant.moved) {
    return false;
  }

  const path = getMovementPath(activePeasant.position, destination, 2);
  if (!path || path.length > 3) {
    return false;
  }

  const occupiedByOther = getPeasantAtHex(state, destination, peasantId);
  if (occupiedByOther) {
    return false;
  }

  for (const step of path.slice(1)) {
    if (getPeasantAtHex(state, step, peasantId)) {
      return false;
    }
  }

  return true;
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

export const applyMove = (state: GameState, peasantId: string, destination: HexCoord): GameState => {
  if (state.status === 'finished') {
    return state;
  }

  const activePeasant = getPeasantById(state, peasantId);
  if (!activePeasant || activePeasant.player !== state.currentPlayer || activePeasant.moved) {
    return state;
  }

  if (!canPeasantMoveTo(state, peasantId, destination)) {
    return state;
  }

  const path = getMovementPath(activePeasant.position, destination, 2);
  if (!path || path.length > 3) {
    return state;
  }

  const nextState: GameState = {
    ...state,
    tiles: { ...state.tiles },
    peasants: {
      blue: state.peasants.blue.map((peasant) => ({ ...peasant })),
      red: state.peasants.red.map((peasant) => ({ ...peasant })),
    },
    castles: { ...state.castles },
    winner: null,
    winnerMessage: '',
  };

  const player = activePeasant.player;
  const updatedPeasant = nextState.peasants[player].find((peasant) => peasant.id === peasantId);
  if (!updatedPeasant) {
    return state;
  }

  path.forEach((hex) => {
    nextState.tiles[coordKey(hex)] = player;
  });

  updatedPeasant.position = destination;
  updatedPeasant.moved = true;

  return nextState;
};

export const endTurn = (state: GameState): GameState => {
  if (state.status === 'finished') {
    return state;
  }

  const currentPlayer = state.currentPlayer;
  const nextPlayer: PlayerColor = currentPlayer === 'blue' ? 'red' : 'blue';

  const nextState: GameState = {
    ...state,
    peasants: {
      blue: state.peasants.blue.map((peasant) => ({ ...peasant, moved: false })),
      red: state.peasants.red.map((peasant) => ({ ...peasant, moved: false })),
    },
    currentPlayer: nextPlayer,
    totalTurns: state.totalTurns + 1,
    winner: null,
    winnerMessage: '',
  };

  if (currentPlayer === 'red') {
    nextState.roundNumber += 1;
  }

  if (nextState.totalTurns >= MAX_ROUNDS * 2) {
    nextState.status = 'finished';
    const result = determineWinner(nextState);
    nextState.winner = result.winner;
    nextState.winnerMessage = result.message;
    nextState.currentPlayer = currentPlayer;
  }

  return nextState;
};
