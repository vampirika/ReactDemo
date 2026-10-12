export type PlayerColor = 'blue' | 'red';
export type TileOwner = PlayerColor | 'neutral';
export type UnitType = 'peasant' | 'knight';

export type HexCoord = {
  q: number;
  r: number;
};

export type Peasant = {
  id: string;
  player: PlayerColor;
  unitType: UnitType;
  position: HexCoord;
  movementLeft: number;
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
export const MAX_PEASANT_MOVEMENT = 2;
export const MAX_KNIGHT_MOVEMENT = 3;

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
      { id: 'blue-peasant-1', player: 'blue', unitType: 'peasant', position: { q: -4, r: 0 }, movementLeft: MAX_PEASANT_MOVEMENT, moved: false },
      { id: 'blue-peasant-2', player: 'blue', unitType: 'peasant', position: { q: -3, r: 1 }, movementLeft: MAX_PEASANT_MOVEMENT, moved: false },
      { id: 'blue-knight-1', player: 'blue', unitType: 'knight', position: { q: -2, r: 2 }, movementLeft: MAX_KNIGHT_MOVEMENT, moved: false },
    ],
    red: [
      { id: 'red-peasant-1', player: 'red', unitType: 'peasant', position: { q: 4, r: 0 }, movementLeft: MAX_PEASANT_MOVEMENT, moved: false },
      { id: 'red-peasant-2', player: 'red', unitType: 'peasant', position: { q: 3, r: -1 }, movementLeft: MAX_PEASANT_MOVEMENT, moved: false },
      { id: 'red-knight-1', player: 'red', unitType: 'knight', position: { q: 2, r: -2 }, movementLeft: MAX_KNIGHT_MOVEMENT, moved: false },
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

export const getMovementPaths = (from: HexCoord, to: HexCoord, maxDistance = MAX_PEASANT_MOVEMENT): HexCoord[][] => {
  if (areSameHex(from, to)) {
    return [[from]];
  }

  const queue: Array<{ hex: HexCoord; path: HexCoord[] }> = [{ hex: from, path: [from] }];
  const bestDistances = new Map<string, number>([[coordKey(from), 0]]);
  const pathsByHex = new Map<string, HexCoord[][]>([[coordKey(from), [[from]]]]);
  const pathKey = (path: HexCoord[]) => path.map((hex) => coordKey(hex)).join('|');

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      continue;
    }

    const currentDistance = current.path.length - 1;
    if (currentDistance >= maxDistance) {
      continue;
    }

    for (const neighbor of getNeighbors(current.hex)) {
      const nextPath = [...current.path, neighbor];
      const nextDistance = nextPath.length - 1;
      const neighborKey = coordKey(neighbor);
      const bestKnown = bestDistances.get(neighborKey);

      if (nextDistance > maxDistance) {
        continue;
      }

      if (bestKnown === undefined || nextDistance < bestKnown) {
        bestDistances.set(neighborKey, nextDistance);
        pathsByHex.set(neighborKey, [nextPath]);
        queue.push({ hex: neighbor, path: nextPath });
        continue;
      }

      if (nextDistance === bestKnown) {
        const existingPaths = pathsByHex.get(neighborKey) ?? [];
        const merged = new Map(existingPaths.map((path) => [pathKey(path), path]));
        merged.set(pathKey(nextPath), nextPath);
        pathsByHex.set(neighborKey, Array.from(merged.values()));
        queue.push({ hex: neighbor, path: nextPath });
      }
    }
  }

  return pathsByHex.get(coordKey(to)) ?? [];
};

export const getMovementPath = (from: HexCoord, to: HexCoord, maxDistance = MAX_PEASANT_MOVEMENT): HexCoord[] | null => {
  const paths = getMovementPaths(from, to, maxDistance);
  return paths[0] ?? null;
};

export const isStraightLinePath = (path: HexCoord[]) => {
  if (path.length < 2) {
    return false;
  }

  const direction = {
    q: path[1].q - path[0].q,
    r: path[1].r - path[0].r,
  };

  return path.slice(1).every((hex, index) => {
    if (index === 0) {
      return true;
    }

    const previous = path[index];
    return hex.q - previous.q === direction.q && hex.r - previous.r === direction.r;
  });
};

export const getReachableTiles = (state: GameState, player: PlayerColor, peasantId?: string): HexCoord[] => {
  const activePeasant = peasantId
    ? state.peasants[player].find((peasant) => peasant.id === peasantId)
    : state.peasants[player].find((peasant) => peasant.movementLeft > 0) ?? state.peasants[player][0];

  if (!activePeasant) {
    return [];
  }

  if (activePeasant.unitType === 'knight') {
    return getBoardHexes().filter((hex) => {
      if (areSameHex(hex, activePeasant.position)) {
        return false;
      }

      return canUnitMoveTo(state, activePeasant.id, hex);
    });
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

    if (current.path.length >= activePeasant.movementLeft + 1) {
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

export const canUnitMoveTo = (state: GameState, peasantId: string, destination: HexCoord) => {
  const activePeasant = getPeasantById(state, peasantId);
  if (!activePeasant || activePeasant.player !== state.currentPlayer || activePeasant.movementLeft <= 0) {
    return false;
  }

  if (areSameHex(activePeasant.position, destination)) {
    return false;
  }

  const occupiedByOther = getPeasantAtHex(state, destination, peasantId);
  if (occupiedByOther) {
    return false;
  }

  const path = getMovementPath(activePeasant.position, destination, activePeasant.movementLeft);
  if (!path) {
    return false;
  }

  if (activePeasant.unitType === 'knight') {
    const straightLine = path.length === 4 && isStraightLinePath(path);
    const pathIsValid = straightLine && path.slice(1, -1).every((hex) => !getPeasantAtHex(state, hex, peasantId));
    return pathIsValid;
  }

  const pathDistance = path.length - 1;
  const pathIsValid = pathDistance <= activePeasant.movementLeft
    && path.slice(1, -1).every((hex) => !getPeasantAtHex(state, hex, peasantId));

  return pathIsValid;
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

export const applyMove = (state: GameState, peasantId: string, destination: HexCoord, plannedPath?: HexCoord[]): GameState => {
  if (state.status === 'finished') {
    return state;
  }

  const activePeasant = getPeasantById(state, peasantId);
  if (!activePeasant || activePeasant.player !== state.currentPlayer || activePeasant.movementLeft <= 0) {
    return state;
  }

  if (!canUnitMoveTo(state, peasantId, destination)) {
    return state;
  }

  const path = plannedPath && plannedPath.length > 1
    ? plannedPath
    : getMovementPath(activePeasant.position, destination, activePeasant.movementLeft);
  if (!path || path.length < 2 || !areSameHex(path[0], activePeasant.position) || !areSameHex(path[path.length - 1], destination)) {
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

  const distanceTraveled = path.length - 1;
  updatedPeasant.position = destination;
  updatedPeasant.movementLeft = Math.max(0, updatedPeasant.movementLeft - distanceTraveled);
  updatedPeasant.moved = updatedPeasant.movementLeft === 0;

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
      blue: state.peasants.blue.map((peasant) => ({
        ...peasant,
        movementLeft: peasant.unitType === 'knight' ? MAX_KNIGHT_MOVEMENT : MAX_PEASANT_MOVEMENT,
        moved: false,
      })),
      red: state.peasants.red.map((peasant) => ({
        ...peasant,
        movementLeft: peasant.unitType === 'knight' ? MAX_KNIGHT_MOVEMENT : MAX_PEASANT_MOVEMENT,
        moved: false,
      })),
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
