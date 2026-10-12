import React, { useMemo, useState } from 'react';
import {
  applyMove,
  areSameHex,
  coordKey,
  createInitialGameState,
  endTurn,
  getBoardHexes,
  getMovementPath,
  getReachableTiles,
  MAX_ROUNDS,
  type GameState,
  type HexCoord,
  type PlayerColor,
} from '../game/hexStrategy.ts';

const HEX_SIZE = 32;
const BOARD_CENTER_X = 440;
const BOARD_CENTER_Y = 330;

const playerTheme: Record<PlayerColor, { base: string; soft: string; label: string }> = {
  blue: { base: '#4d7ae6', soft: '#dfeaff', label: 'Blue' },
  red: { base: '#e66d6d', soft: '#f9dfe1', label: 'Red' },
};

const neutralTile = '#e7d8c5';
const neutralStroke = '#b39c7f';
const rangeStroke = '#5d7f4f';

const axialToPixel = (q: number, r: number) => ({
  x: HEX_SIZE * Math.sqrt(3) * (q + r / 2) + BOARD_CENTER_X,
  y: HEX_SIZE * 1.5 * r + BOARD_CENTER_Y,
});

const hexPoints = (cx: number, cy: number) => {
  const points: string[] = [];

  for (let index = 0; index < 6; index += 1) {
    const angle = (Math.PI / 180) * (60 * index - 30);
    const x = cx + HEX_SIZE * Math.cos(angle);
    const y = cy + HEX_SIZE * Math.sin(angle);
    points.push(`${x},${y}`);
  }

  return points.join(' ');
};

const getTileFill = (owner: GameState['tiles'][string] | undefined) => {
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
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>('blue-1');
  const [hoveredHex, setHoveredHex] = useState<HexCoord | null>(null);

  const boardHexes = useMemo(() => getBoardHexes(), []);
  const currentPlayer = gameState.currentPlayer;
  const selectedUnit = useMemo(
    () => gameState.peasants[currentPlayer].find((peasant) => peasant.id === selectedUnitId) ?? null,
    [currentPlayer, gameState.peasants, selectedUnitId],
  );

  const reachableTiles = useMemo(() => {
    if (!selectedUnit) {
      return [] as HexCoord[];
    }

    return getReachableTiles(gameState, currentPlayer, selectedUnit.id);
  }, [currentPlayer, gameState, selectedUnit]);

  const reachableSet = useMemo(() => new Set(reachableTiles.map((hex) => coordKey(hex))), [reachableTiles]);

  const previewPath = useMemo(() => {
    if (!selectedUnit || !hoveredHex) {
      return [] as HexCoord[];
    }

    const path = getMovementPath(selectedUnit.position, hoveredHex, 2);
    if (!path) {
      return [] as HexCoord[];
    }

    return path;
  }, [hoveredHex, selectedUnit]);

  const previewPathSet = useMemo(() => new Set(previewPath.map((hex) => coordKey(hex))), [previewPath]);

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

  const allAvailableUnits = gameState.peasants[currentPlayer].filter((peasant) => !peasant.moved);

  const handleHexClick = (destination: HexCoord) => {
    if (gameState.status === 'finished') {
      return;
    }

    const clickedPeasantOnHex = Object.values(gameState.peasants)
      .flat()
      .find((peasant) => areSameHex(peasant.position, destination) && peasant.player === currentPlayer && !peasant.moved);

    if (clickedPeasantOnHex) {
      setSelectedUnitId(clickedPeasantOnHex.id);
      setHoveredHex(null);
      return;
    }

    if (!selectedUnit || selectedUnit.moved) {
      const nextSelection = allAvailableUnits[0] ?? null;
      setSelectedUnitId(nextSelection ? nextSelection.id : null);
      return;
    }

    const nextState = applyMove(gameState, selectedUnit.id, destination);
    if (nextState === gameState) {
      return;
    }

    const nextAvailable = nextState.peasants[currentPlayer].find((peasant) => !peasant.moved) ?? null;
    setGameState(nextState);
    setSelectedUnitId(nextAvailable ? nextAvailable.id : null);
    setHoveredHex(null);
  };

  const handleEndTurn = () => {
    const nextState = endTurn(gameState);
    setGameState(nextState);
    const nextSelection = nextState.peasants[nextState.currentPlayer].find((peasant) => !peasant.moved) ?? null;
    setSelectedUnitId(nextSelection ? nextSelection.id : null);
    setHoveredHex(null);
  };

  const handleRestart = () => {
    const freshGame = createInitialGameState();
    setGameState(freshGame);
    setSelectedUnitId(freshGame.peasants.blue[0].id);
    setHoveredHex(null);
  };

  const previewPoints = previewPath.length > 1
    ? previewPath.map((hex) => {
        const point = axialToPixel(hex.q, hex.r);
        return `${point.x},${point.y}`;
      }).join(' ')
    : '';

  return (
    <div className="hex-game-panel">
      <div className="hex-game-hud">
        <div className="hud-block">
          <span className="label">Turn</span>
          <strong className={`turn-indicator ${currentPlayer}`}>{playerTheme[currentPlayer].label}</strong>
        </div>

        <div className="hud-block">
          <span className="label">Round</span>
          <strong>{Math.min(gameState.roundNumber, MAX_ROUNDS)} / {MAX_ROUNDS}</strong>
        </div>

        <div className="hud-block">
          <span className="label">Territory</span>
          <div className="score-row">
            <span className="score-pill blue">Blue: {territoryScores.blue}</span>
            <span className="score-pill red">Red: {territoryScores.red}</span>
          </div>
        </div>
      </div>

      <div className="game-status-row">
        {gameState.status === 'finished' ? (
          <div className="status-banner finished">{gameState.winnerMessage || 'Game over.'}</div>
        ) : (
          <div className="status-banner">
            {playerTheme[currentPlayer].label} to move • select a peasant then choose a reachable hex.
          </div>
        )}

        <div className="action-group">
          <button type="button" className="restart-button" onClick={handleRestart}>Restart</button>
          <button
            type="button"
            className="end-turn-button"
            onClick={handleEndTurn}
            disabled={gameState.status === 'finished'}
          >
            End Turn
          </button>
        </div>
      </div>

      <svg className="hex-board" viewBox="0 0 900 700" role="img" aria-label="Hex strategy board">
        <defs>
          <marker id="route-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#614b3a" />
          </marker>
        </defs>

        {previewPoints && (
          <polyline
            points={previewPoints}
            fill="none"
            stroke="#614b3a"
            strokeWidth="4"
            strokeLinejoin="round"
            strokeLinecap="round"
            markerEnd="url(#route-arrow)"
            opacity="0.9"
          />
        )}

        {boardHexes.map((hex) => {
          const center = axialToPixel(hex.q, hex.r);
          const key = coordKey(hex);
          const owner = gameState.tiles[key];
          const isReachable = selectedUnit ? reachableSet.has(key) : false;
          const isPreview = selectedUnit ? previewPathSet.has(key) : false;
          const isSelectedHex = selectedUnit ? areSameHex(hex, selectedUnit.position) : false;
          const isCastle = areSameHex(hex, gameState.castles.blue) || areSameHex(hex, gameState.castles.red);
          const peasantOnHex = Object.values(gameState.peasants)
            .flat()
            .find((peasant) => areSameHex(peasant.position, hex));

          const tileFill = getTileFill(owner);
          const strokeColor = isReachable ? rangeStroke : neutralStroke;
          const strokeWidth = isReachable ? 3 : isPreview ? 3.5 : 1.2;

          return (
            <g
              key={key}
              className="hex-node"
              onMouseEnter={() => {
                if (selectedUnit && isReachable) {
                  setHoveredHex(hex);
                }
              }}
              onMouseLeave={() => setHoveredHex(null)}
              onClick={() => handleHexClick(hex)}
            >
              <polygon
                points={hexPoints(center.x, center.y)}
                fill={tileFill}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                opacity={isReachable ? 0.98 : 1}
                className={isReachable ? 'reachable-hex' : ''}
              />

              {isCastle && (() => {
                const castleOwner = areSameHex(hex, gameState.castles.blue) ? 'blue' : 'red';
                return (
                  <rect
                    x={center.x - 18}
                    y={center.y - 18}
                    width={36}
                    height={36}
                    rx={6}
                    fill={playerTheme[castleOwner].base}
                    stroke="#f4f0ea"
                    strokeWidth={2}
                  />
                );
              })()}

              {peasantOnHex && (
                <g
                  transform={`translate(${center.x} ${center.y})`}
                  style={{ transition: 'transform 180ms ease-in-out' }}
                >
                  <circle
                    r={13}
                    fill={playerTheme[peasantOnHex.player].base}
                    stroke={selectedUnit?.id === peasantOnHex.id ? '#f6f2ed' : '#f5efe8'}
                    strokeWidth={selectedUnit?.id === peasantOnHex.id ? 4 : 3}
                    opacity={peasantOnHex.moved ? 0.7 : 1}
                  />

                  {selectedUnit?.id === peasantOnHex.id && (
                    <circle r={20} fill="none" stroke="#d7d1c4" strokeWidth={2.5} strokeDasharray="4 6" />
                  )}

                  {isSelectedHex && (
                    <circle r={23} fill="none" stroke="#5f7b4f" strokeWidth={2.5} />
                  )}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default HexPrototypeGame;
