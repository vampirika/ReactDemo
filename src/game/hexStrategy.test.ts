import {
  applyMove,
  createInitialGameState,
  determineWinner,
  getReachableTiles,
  MAX_ROUNDS,
} from './hexStrategy';

describe('hex strategy rules', () => {
  test('initial board includes castle territories and a valid first turn state', () => {
    const state = createInitialGameState();

    expect(state.currentPlayer).toBe('blue');
    expect(state.roundNumber).toBe(1);
    expect(state.status).toBe('playing');
    expect(state.tiles['-5,0']).toBe('blue');
    expect(state.tiles['5,0']).toBe('red');
    expect(getReachableTiles(state, 'blue')).toEqual(
      expect.arrayContaining([
        { q: -2, r: 0 },
        { q: -3, r: 1 },
        { q: -3, r: -1 },
      ]),
    );
  });

  test('a valid move claims the path and advances the turn', () => {
    const state = createInitialGameState();
    const next = applyMove(state, { q: -1, r: 0 });

    expect(next.peasants.blue).toEqual({ q: -1, r: 0 });
    expect(next.tiles['-2,0']).toBe('blue');
    expect(next.currentPlayer).toBe('red');
    expect(next.totalTurns).toBe(1);
  });

  test('an invalid move is rejected', () => {
    const state = createInitialGameState();
    const next = applyMove(state, { q: 3, r: 0 });

    expect(next).toEqual(state);
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

  test('game finishes after the required number of rounds', () => {
    let state = createInitialGameState();

    for (let roundIndex = 0; roundIndex < MAX_ROUNDS * 2; roundIndex += 1) {
      const activePlayer = state.currentPlayer;
      const currentHex = state.peasants[activePlayer];
      const moveTarget = activePlayer === 'blue'
        ? { q: currentHex.q + 1, r: currentHex.r }
        : { q: currentHex.q - 1, r: currentHex.r };

      state = applyMove(state, moveTarget);
    }

    expect(state.status).toBe('finished');
    expect(state.winner).not.toBeNull();
  });
});
