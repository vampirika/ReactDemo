import {
  applyMove,
  createInitialGameState,
  determineWinner,
  endTurn,
  getMovementPaths,
  getReachableTiles,
  MAX_ROUNDS,
} from './hexStrategy';

describe('hex strategy rules', () => {
  test('initial board includes castle territories and valid peasant movement options', () => {
    const state = createInitialGameState();

    expect(state.currentPlayer).toBe('blue');
    expect(state.roundNumber).toBe(1);
    expect(state.status).toBe('playing');
    expect(state.tiles['-5,0']).toBe('blue');
    expect(state.tiles['5,0']).toBe('red');
    expect(state.peasants.blue).toHaveLength(3);
    expect(state.peasants.red).toHaveLength(3);
    expect(state.peasants.blue[0].movementLeft).toBe(2);
    expect(getReachableTiles(state, 'blue', state.peasants.blue[0].id)).toEqual(
      expect.arrayContaining([
        { q: -3, r: 0 },
        { q: -4, r: 1 },
      ]),
    );
  });

  test('a valid two-step move claims the path and consumes the peasant movement stock', () => {
    const state = createInitialGameState();
    const next = applyMove(state, state.peasants.blue[0].id, { q: -2, r: 0 });

    expect(next.peasants.blue[0].position).toEqual({ q: -2, r: 0 });
    expect(next.peasants.blue[0].movementLeft).toBe(0);
    expect(next.peasants.blue[0].moved).toBe(true);
    expect(next.tiles['-3,0']).toBe('blue');
    expect(next.tiles['-2,0']).toBe('blue');
  });

  test('a knight must move exactly three hexes in a straight line', () => {
    const state = createInitialGameState();
    const knight = state.peasants.blue.find((unit) => unit.unitType === 'knight');
    const next = applyMove(state, knight!.id, { q: -2, r: -1 });

    expect(next.peasants.blue.find((unit) => unit.id === knight!.id)?.position).toEqual({ q: -2, r: -1 });
    expect(next.peasants.blue.find((unit) => unit.id === knight!.id)?.movementLeft).toBe(0);
  });

  test('multiple shortest paths are retained when a destination can be reached from more than one side', () => {
    const routes = getMovementPaths({ q: 0, r: 0 }, { q: 1, r: 1 }, 2);

    expect(routes.length).toBeGreaterThan(1);
    expect(routes).toEqual(expect.arrayContaining([
      [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 1, r: 1 },
      ],
      [
        { q: 0, r: 0 },
        { q: 0, r: 1 },
        { q: 1, r: 1 },
      ],
    ]));
  });

  test('an invalid move is rejected when another peasant blocks the destination', () => {
    const state = createInitialGameState();
    const blockedMove = applyMove(state, state.peasants.blue[0].id, state.peasants.red[0].position);

    expect(blockedMove).toEqual(state);
  });

  test('turn advancement resets movement for the next player', () => {
    const state = createInitialGameState();
    const moved = applyMove(state, state.peasants.blue[0].id, { q: -2, r: 0 });
    const next = endTurn(moved);

    expect(next.currentPlayer).toBe('red');
    expect(next.peasants.blue.every((peasant) => (
      peasant.movementLeft === (peasant.unitType === 'knight' ? 3 : 2)
    ))).toBe(true);
    expect(next.totalTurns).toBe(1);
  });

  test('winner detection handles ties explicitly', () => {
    const state = createInitialGameState();
    state.tiles['-5,0'] = 'blue';
    state.tiles['5,0'] = 'red';
    state.tiles['-4,0'] = 'blue';
    state.tiles['4,0'] = 'red';

    const result = determineWinner(state);
    expect(result.winner).toBe('tie');
    expect(result.message).toContain('tie');
  });

  test('game finishes after the required number of player turns', () => {
    let state = createInitialGameState();
    state.totalTurns = MAX_ROUNDS * 2 - 1;
    state.currentPlayer = 'red';

    state = endTurn(state);

    expect(state.status).toBe('finished');
    expect(state.winner).not.toBeNull();
  });
});
