import React, { useMemo, useState } from 'react';
import {
  applyMove,
  areSameHex,
  coordKey,
  createInitialGameState,
  endTurn,
  getBoardHexes,
  getMovementPath,
  getMovementPaths,
  getPeasantAtHex,
  getReachableTiles,
  MAX_KNIGHT_MOVEMENT,
  MAX_PEASANT_MOVEMENT,
  MAX_ROUNDS,
  type GameState,
  type HexCoord,
  type PlayerColor,
} from '../game/hexStrategy.ts';

const HEX_SIZE = 32;
const BOARD_CENTER_X = 440;
const BOARD_CENTER_Y = 330;

const playerTheme: Record<PlayerColor, { base: string; soft: string; dark: string; label: string }> = {
  blue: { base: '#4d7ae6', soft: '#dfeaff', dark: '#1b3c8d', label: 'Blue' },
  red: { base: '#e66d6d', soft: '#f9dfe1', dark: '#7d1e2d', label: 'Red' },
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

const choosePreferredRoute = (
  from: HexCoord,
  destination: HexCoord,
  maxDistance: number,
  hoverPoint: { x: number; y: number } | null,
  state: GameState,
  unitId: string,
): HexCoord[] => {
  const candidatePaths = getMovementPaths(from, destination, maxDistance).filter((path) => {
    if (path.length < 2) {
      return false;
    }

    return path.slice(1, -1).every((hex) => !getPeasantAtHex(state, hex, unitId));
  });

  if (candidatePaths.length <= 1) {
    return candidatePaths[0] ?? [];
  }

  if (!hoverPoint) {
    return candidatePaths[0];
  }

  const destinationCenter = axialToPixel(destination.q, destination.r);
  const pointerVector = {
    x: hoverPoint.x - destinationCenter.x,
    y: hoverPoint.y - destinationCenter.y,
  };
  const pointerMagnitude = Math.hypot(pointerVector.x, pointerVector.y) || 1;

  const bestPath = candidatePaths.reduce((best, path) => {
    const previousHex = path[path.length - 2];
    const previousPixel = axialToPixel(previousHex.q, previousHex.r);
    const incomingVector = {
      x: previousPixel.x - destinationCenter.x,
      y: previousPixel.y - destinationCenter.y,
    };

    const cross = pointerVector.x * incomingVector.y - pointerVector.y * incomingVector.x;
    const dot = pointerVector.x * incomingVector.x + pointerVector.y * incomingVector.y;
    const angularDelta = Math.abs(Math.atan2(cross, dot));
    const directionalScore = 1 - (angularDelta / Math.PI);
    const distancePenalty = Math.hypot(
      pointerVector.x - incomingVector.x,
      pointerVector.y - incomingVector.y,
    ) / (HEX_SIZE * 2);
    const sideBias = directionalScore - distancePenalty * 0.15;

    if (!best || sideBias > best.score) {
      return { path, score: sideBias };
    }

    return best;
  }, null as { path: HexCoord[]; score: number } | null);

  return bestPath ? bestPath.path : candidatePaths[0];
};

const buildRoutePath = (route: HexCoord[]) => {
  if (route.length === 0) {
    return '';
  }

  return route.map((hex, index) => {
    const pixel = axialToPixel(hex.q, hex.r);
    return `${index === 0 ? 'M' : 'L'} ${pixel.x} ${pixel.y}`;
  }).join(' ');
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
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>('blue-peasant-1');
  const [hoveredHex, setHoveredHex] = useState<HexCoord | null>(null);
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number } | null>(null);

  const boardHexes = useMemo(() => getBoardHexes(), []);
  const currentPlayer = gameState.currentPlayer;
  const selectedUnit = useMemo(
    () => gameState.peasants[currentPlayer].find((peasant) => peasant.id === selectedUnitId) ?? null,
    [currentPlayer, gameState.peasants, selectedUnitId],
  );
  const routeColor = selectedUnit ? playerTheme[selectedUnit.player].dark : '#614b3a';

  const reachableTiles = useMemo(() => {
    if (!selectedUnit) {
      return [] as HexCoord[];
    }

    return getReachableTiles(gameState, currentPlayer, selectedUnit.id);
  }, [currentPlayer, gameState, selectedUnit]);

  const reachableSet = useMemo(() => new Set(reachableTiles.map((hex) => coordKey(hex))), [reachableTiles]);

  const previewPath = useMemo(() => {
    if (!selectedUnit || selectedUnit.movementLeft <= 0 || !hoveredHex) {
      return [] as HexCoord[];
    }

    const occupiedTarget = getPeasantAtHex(gameState, hoveredHex, selectedUnit.id);
    if (occupiedTarget && !areSameHex(occupiedTarget.position, selectedUnit.position)) {
      return [] as HexCoord[];
    }

    return choosePreferredRoute(
      selectedUnit.position,
      hoveredHex,
      selectedUnit.movementLeft,
      hoverPoint,
      gameState,
      selectedUnit.id,
    );
  }, [gameState, hoveredHex, hoverPoint, selectedUnit]);

  const previewPathSet = useMemo(() => new Set(previewPath.map((hex) => coordKey(hex))), [previewPath]);
  const routePath = useMemo(() => buildRoutePath(previewPath), [previewPath]);

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

  const allAvailableUnits = gameState.peasants[currentPlayer].filter((peasant) => peasant.movementLeft > 0);

  const handleHexClick = (destination: HexCoord) => {
    if (gameState.status === 'finished') {
      return;
    }

    const clickedPeasantOnHex = Object.values(gameState.peasants)
      .flat()
      .find((peasant) => areSameHex(peasant.position, destination) && peasant.player === currentPlayer);

    if (clickedPeasantOnHex) {
      if (clickedPeasantOnHex.movementLeft > 0) {
        setSelectedUnitId(clickedPeasantOnHex.id);
        setHoveredHex(null);
        setHoverPoint(null);
      }
      return;
    }

    if (!selectedUnit || selectedUnit.movementLeft <= 0) {
      const nextSelection = allAvailableUnits[0] ?? null;
      setSelectedUnitId(nextSelection ? nextSelection.id : null);
      setHoverPoint(null);
      return;
    }

    const chosenPath = choosePreferredRoute(
      selectedUnit.position,
      destination,
      selectedUnit.movementLeft,
      hoverPoint,
      gameState,
      selectedUnit.id,
    );
    const nextState = applyMove(gameState, selectedUnit.id, destination, chosenPath);
    if (nextState === gameState) {
      return;
    }

    const nextSelected = nextState.peasants[currentPlayer].find((peasant) => peasant.id === selectedUnit.id)
      ?? nextState.peasants[currentPlayer].find((peasant) => peasant.movementLeft > 0)
      ?? null;

    setGameState(nextState);
    setSelectedUnitId(nextSelected ? nextSelected.id : null);
    setHoveredHex(null);
    setHoverPoint(null);
  };

  const handleEndTurn = () => {
    const nextState = endTurn(gameState);
    setGameState(nextState);
    const nextSelection = nextState.peasants[nextState.currentPlayer].find((peasant) => peasant.movementLeft > 0) ?? null;
    setSelectedUnitId(nextSelection ? nextSelection.id : null);
    setHoveredHex(null);
    setHoverPoint(null);
  };

  const handleRestart = () => {
    const freshGame = createInitialGameState();
    setGameState(freshGame);
    setSelectedUnitId(freshGame.peasants.blue[0].id);
    setHoveredHex(null);
    setHoverPoint(null);
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
        {boardHexes.map((hex) => {
          const center = axialToPixel(hex.q, hex.r);
          const key = coordKey(hex);
          const owner = gameState.tiles[key];
          const isReachable = selectedUnit ? reachableSet.has(key) : false;
          const isPreview = selectedUnit ? previewPathSet.has(key) : false;
          const isSelectedHex = selectedUnit ? areSameHex(hex, selectedUnit.position) : false;
          const isCastle = areSameHex(hex, gameState.castles.blue) || areSameHex(hex, gameState.castles.red);
          const unitOnHex = Object.values(gameState.peasants)
            .flat()
            .find((peasant) => areSameHex(peasant.position, hex));

          const tileFill = getTileFill(owner);
          const strokeColor = isReachable ? rangeStroke : neutralStroke;
          const strokeWidth = isReachable ? 3 : isPreview ? 3.5 : 1.2;

          return (
            <g
              key={key}
              className="hex-node"
              onMouseEnter={(event) => {
                if (selectedUnit && selectedUnit.movementLeft > 0 && isReachable) {
                  setHoveredHex(hex);
                  const svgBounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                  if (svgBounds) {
                    setHoverPoint({
                      x: event.clientX - svgBounds.left,
                      y: event.clientY - svgBounds.top,
                    });
                  }
                }
              }}
              onMouseMove={(event) => {
                if (selectedUnit && selectedUnit.movementLeft > 0 && isReachable) {
                  const svgBounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                  if (svgBounds) {
                    setHoverPoint({
                      x: event.clientX - svgBounds.left,
                      y: event.clientY - svgBounds.top,
                    });
                  }
                }
              }}
              onMouseLeave={() => {
                setHoveredHex(null);
                setHoverPoint(null);
              }}
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

              {unitOnHex && (
                <g transform={`translate(${center.x} ${center.y})`}>
                  {unitOnHex.unitType === 'knight' ? (
                    <polygon
                      points="0,-15 15,14 -15,14"
                      fill={playerTheme[unitOnHex.player].base}
                      stroke={selectedUnit?.id === unitOnHex.id ? '#f6f2ed' : '#f5efe8'}
                      strokeWidth={selectedUnit?.id === unitOnHex.id ? 4 : 3}
                      opacity={unitOnHex.movementLeft === 0 ? 0.7 : 1}
                    />
                  ) : (
                    <circle
                      r={13}
                      fill={playerTheme[unitOnHex.player].base}
                      stroke={selectedUnit?.id === unitOnHex.id ? '#f6f2ed' : '#f5efe8'}
                      strokeWidth={selectedUnit?.id === unitOnHex.id ? 4 : 3}
                      opacity={unitOnHex.movementLeft === 0 ? 0.7 : 1}
                    />
                  )}

                  <text
                    x={0}
                    y={4}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="#ffffff"
                  >
                    {`${unitOnHex.movementLeft}/${unitOnHex.unitType === 'knight' ? MAX_KNIGHT_MOVEMENT : MAX_PEASANT_MOVEMENT}`}
                  </text>

                  {selectedUnit?.id === unitOnHex.id && (
                    <circle r={19} fill="none" stroke="#d7d1c4" strokeWidth={2.5} strokeDasharray="4 6" />
                  )}

                  {isSelectedHex && (
                    <circle r={21} fill="none" stroke="#5f7b4f" strokeWidth={2.5} />
                  )}
                </g>
              )}
            </g>
          );
        })}

        {previewPath.length > 1 && (
          <g style={{ pointerEvents: 'none' }}>
            <polyline
              points={previewPoints}
              fill="none"
              stroke={routeColor}
              strokeWidth="12"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity="0.26"
            >
              <animate attributeName="stroke-dasharray" values="0 24; 12 12; 0 24" dur="1.4s" repeatCount="indefinite" />
            </polyline>
            <polyline
              points={previewPoints}
              fill="none"
              stroke={routeColor}
              strokeWidth="5"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity="0.96"
              strokeDasharray="10 14"
            >
              <animate attributeName="stroke-dashoffset" values="0;-30" dur="1.1s" repeatCount="indefinite" />
            </polyline>
            <circle r={6} fill="#f5e5a6" opacity="0.96">
              <animateMotion dur="1.1s" repeatCount="indefinite" path={routePath} />
            </circle>
            <circle r={10} fill={routeColor} opacity="0.22">
              <animateMotion dur="1.1s" repeatCount="indefinite" path={routePath} />
            </circle>
          </g>
        )}
      </svg>
    </div>
  );
};

export default HexPrototypeGame;
