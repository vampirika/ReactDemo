import React, { useMemo, useState } from 'react';
import {
  applyMove,
  areSameHex,
  coordKey,
  createInitialGameState,
  getBoardHexes,
  getMovementPath,
  getReachableTiles,
  MAX_ROUNDS,
  type GameState,
  type HexCoord,
  type PlayerColor,
} from '../game/hexStrategy.ts';

const HEX_SIZE = 30;
const BOARD_CENTER_X = 440;
const BOARD_CENTER_Y = 330;

const playerTheme: Record<PlayerColor, { base: string; soft: string; light: string; label: string }> = {
  blue: { base: '#4d7ae6', soft: '#dfeaff', light: '#eef5ff', label: 'Blue' },
  red: { base: '#e66d6d', soft: '#f9dfe1', light: '#fff0f0', label: 'Red' },
};

const neutralTile = '#e2d5c2';
const neutralDark = '#bca887';
const reachableFill = '#bfe6a8';
const rangeStroke = '#5f7b4f';

const axialToPixel = (q: number, r: number) => ({
  x: HEX_SIZE * Math.sqrt(3) * (q + r / 2) + BOARD_CENTER_X,
  y: HEX_SIZE * 1.5 * r + BOARD_CENTER_Y,
});

const hexPoints = (cx: number, cy: number) => {
  const points: string[] = [];

  for (let index = 0; index < 6; index += 1) {
    const angle = ((Math.PI / 180) * (60 * index - 30));
    const x = cx + HEX_SIZE * Math.cos(angle);
    const y = cy + HEX_SIZE * Math.sin(angle);
    points.push(`${x},${y}`);
  }

  return points.join(' ');
};

const getTileColor = (owner: GameState['tiles'][string] | undefined, isReachable: boolean, isHoverPath: boolean) => {
  if (isReachable) {
    return reachableFill;
  }

  if (isHoverPath) {
    return '#d4eba8';
  }

  if (owner === 'blue') {
    return playerTheme.blue.soft;
  }

  if (owner === 'red') {
    return playerTheme.red.soft;
  }

  return neutralTile;
};

const HexPrototypeGame = () => {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState());
  const [hoveredHex, setHoveredHex] = useState<HexCoord | null>(null);

  const boardHexes = useMemo(() => getBoardHexes(), []);
  const currentPlayer = gameState.currentPlayer;
  const currentHex = gameState.peasants[currentPlayer];
  const reachableTiles = useMemo(
    () => getReachableTiles(gameState, currentPlayer),
    [gameState, currentPlayer],
  );
  const reachableSet = useMemo(() => new Set(reachableTiles.map((hex) => coordKey(hex))), [reachableTiles]);

  const hoverPath = useMemo(() => {
    if (!hoveredHex) {
      return [] as HexCoord[];
    }

    const path = getMovementPath(currentHex, hoveredHex);
    return path ?? [];
  }, [currentHex, hoveredHex]);
  const hoverPathSet = useMemo(() => new Set(hoverPath.map((hex) => coordKey(hex))), [hoverPath]);

  const territoryScores = useMemo(() => {
    const scores = { blue: 0, red: 0 };
    Object.values(gameState.tiles).forEach((owner) => {
      if (owner === 'blue') {
        scores.blue += 1;
      }
      if (owner === 'red') {
        scores.red += 1;
      }
    });
    return scores;
  }, [gameState.tiles]);

  const handleHexClick = (destination: HexCoord) => {
    if (gameState.status === 'finished') {
      return;
    }

    const nextState = applyMove(gameState, destination);
    if (nextState !== gameState) {
      setGameState(nextState);
      setHoveredHex(null);
    }
  };

  const resetGame = () => {
    setGameState(createInitialGameState());
    setHoveredHex(null);
  };

  return (
    <div className="hex-game-panel">
      <div className="hex-game-hud">
        <div className="hud-block turn-block">
          <span className="label">Turn</span>
          <strong className={`turn-indicator ${currentPlayer}`}>
            {playerTheme[currentPlayer].label}
          </strong>
        </div>

        <div className="hud-block round-block">
          <span className="label">Round</span>
          <strong>{Math.min(gameState.roundNumber, MAX_ROUNDS)} / {MAX_ROUNDS}</strong>
        </div>

        <div className="hud-block score-block">
          <span className="label">Territory</span>
          <div className="score-row">
            <span className="score-pill blue">Blue: {territoryScores.blue}</span>
            <span className="score-pill red">Red: {territoryScores.red}</span>
          </div>
        </div>
      </div>

      <div className="game-status-row">
        {gameState.status === 'finished' ? (
          <div className="status-banner finished">
            {gameState.winnerMessage || 'Game over.'}
          </div>
        ) : (
          <div className="status-banner">
            {playerTheme[currentPlayer].label} to move • select a highlighted hex to advance up to 2 spaces.
          </div>
        )}
        <button type="button" className="restart-button" onClick={resetGame}>Restart</button>
      </div>

      <svg className="hex-board" viewBox="0 0 900 700" role="img" aria-label="Hex strategy board">
        {boardHexes.map((hex) => {
          const center = axialToPixel(hex.q, hex.r);
          const key = coordKey(hex);
          const owner = gameState.tiles[key];
          const isReachable = reachableSet.has(key);
          const isHoverPath = hoverPathSet.has(key);
          const isCastle = areSameHex(hex, gameState.castles.blue) || areSameHex(hex, gameState.castles.red);
          const unitForHex = Object.entries(gameState.peasants).find(([, position]) => areSameHex(position, hex));
          const playerToken = unitForHex ? (unitForHex[0] as PlayerColor) : null;

          let fill = getTileColor(owner, isReachable, isHoverPath);
          let outlineColor = neutralDark;
          let outlineWidth = 1.2;

          if (isReachable) {
            outlineColor = rangeStroke;
            outlineWidth = 2;
          }

          if (isHoverPath) {
            outlineColor = '#6c8d44';
            outlineWidth = 2.5;
          }

          return (
            <g
              key={key}
              className="hex-node"
              onMouseEnter={() => {
                if (isReachable) {
                  setHoveredHex(hex);
                }
              }}
              onMouseLeave={() => setHoveredHex(null)}
              onClick={() => handleHexClick(hex)}
            >
              <polygon
                points={hexPoints(center.x, center.y)}
                fill={fill}
                stroke={outlineColor}
                strokeWidth={outlineWidth}
                className={isReachable ? 'reachable-hex' : ''}
              />

              {isCastle && (() => {
                const castleOwner = areSameHex(hex, gameState.castles.blue) ? 'blue' : 'red';
                const castleColor = playerTheme[castleOwner].base;
                return (
                  <rect
                    x={center.x - 18}
                    y={center.y - 18}
                    width={36}
                    height={36}
                    rx={6}
                    fill={castleColor}
                    stroke="#f6f2eb"
                    strokeWidth={2}
                  />
                );
              })()}

              {playerToken && (
                <circle
                  cx={center.x}
                  cy={center.y}
                  r={13}
                  fill={playerTheme[playerToken].base}
                  stroke="#f5efe8"
                  strokeWidth={3}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default HexPrototypeGame;
