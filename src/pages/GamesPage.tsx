import React, { useCallback, useEffect, useState } from 'react';
import { onDisconnect, onValue, ref, remove, set } from 'firebase/database';
import HexPrototypeGame from '../components/HexPrototypeGame';
import { firebaseDb, hasFirebaseConfig } from '../firebase';
import { createDeploymentGameState, createInitialGameState, type GameState } from '../game/hexStrategy';
import './gamesPage.css';

type PlayerColor = 'blue' | 'red';

type RoomPlayer = {
  id: string;
  colour: PlayerColor;
  ready: boolean;
  joinedAt: number;
};

type GameRoom = {
  roomId: string;
  status: 'waiting' | 'deploying' | 'playing';
  createdAt: number;
  hostId: string;
  players: Record<string, RoomPlayer>;
  gameState?: GameState;
  testMode?: boolean;
};

const PLAYER_KEY = 'border-siege-player-id';
const ROOM_KEY_PREFIX = 'border-siege-room';
const SOLO_TEST_ROOM_ID = 'VAMP66';

const getOrCreatePlayerId = () => {
  const stored = window.localStorage.getItem(PLAYER_KEY);

  if (stored) {
    return stored;
  }

  const nextId = `player-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  window.localStorage.setItem(PLAYER_KEY, nextId);
  return nextId;
};

const generateRoomCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
};

const persistRoom = (room: GameRoom) => {
  window.localStorage.setItem(`${ROOM_KEY_PREFIX}:${room.roomId}`, JSON.stringify(room));
};

const loadLocalRoom = (roomId: string) => {
  const stored = window.localStorage.getItem(`${ROOM_KEY_PREFIX}:${roomId}`);
  return stored ? JSON.parse(stored) as GameRoom : null;
};

const getRoomLookup = (roomCode: string) => {
  if (hasFirebaseConfig && firebaseDb) {
    return ref(firebaseDb, `rooms/${roomCode}`);
  }

  return null;
};

const GamesPage = () => {
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [selectedColour, setSelectedColour] = useState<PlayerColor>('blue');
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [localPlayerId, setLocalPlayerId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [gameStarted, setGameStarted] = useState(false);

  const leaveRoom = useCallback(async (silent = false) => {
    if (!room || !localPlayerId) {
      setRoom(null);
      setGameStarted(false);
      if (!silent) {
        setError('');
        setMessage('');
      }
      return;
    }

    if (room.testMode) {
      setRoom(null);
      setGameStarted(false);
      setError('');
      if (!silent) {
        setMessage('You left the test room.');
      }
      return;
    }

    const nextPlayers = { ...room.players };
    delete nextPlayers[localPlayerId];

    if (Object.keys(nextPlayers).length === 0) {
      window.localStorage.removeItem(`${ROOM_KEY_PREFIX}:${room.roomId}`);
      if (hasFirebaseConfig && firebaseDb) {
        await remove(ref(firebaseDb, `rooms/${room.roomId}`));
      }
      setRoom(null);
      setGameStarted(false);
      setError('');
      if (!silent) {
        setMessage('You left the room.');
      }
      return;
    }

    const nextRoom: GameRoom = {
      ...room,
      players: nextPlayers,
    };

    persistRoom(nextRoom);
    if (hasFirebaseConfig && firebaseDb) {
      await set(ref(firebaseDb, `rooms/${room.roomId}`), nextRoom);
    }

    setRoom(null);
    setGameStarted(false);
    setError('');
    if (!silent) {
      setMessage('You left the room.');
    }
  }, [localPlayerId, room]);

  useEffect(() => {
    setLocalPlayerId(getOrCreatePlayerId());
  }, []);

  useEffect(() => {
    if (!room?.roomId || room.testMode || !hasFirebaseConfig || !firebaseDb) {
      return undefined;
    }

    const roomRef = ref(firebaseDb, `rooms/${room.roomId}`);
    const playerRef = ref(firebaseDb, `rooms/${room.roomId}/players/${localPlayerId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const nextRoom = snapshot.val() as GameRoom | null;
      if (nextRoom) {
        setRoom(nextRoom);
        setGameStarted(nextRoom.status === 'deploying' || nextRoom.status === 'playing');
      } else {
        setRoom(null);
        setGameStarted(false);
      }
    });

    onDisconnect(playerRef).remove();

    return () => {
      unsubscribe();
    };
  }, [room?.roomId, room?.testMode, localPlayerId]);

  useEffect(() => {
    setGameStarted(Boolean(room && room.status !== 'waiting'));
  }, [room]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (room && localPlayerId) {
        void leaveRoom(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [leaveRoom, localPlayerId, room]);

  const readyPlayers = room ? Object.values(room.players).filter((player) => player.ready).length : 0;
  const canStart = Boolean(
    room
    && Object.keys(room.players).length >= 2
    && Object.values(room.players).every((player) => player.colour)
    && readyPlayers === Object.keys(room.players).length,
  );

  const createRoom = async () => {
    const roomId = generateRoomCode();
    const playerId = getOrCreatePlayerId();
    const nextRoom: GameRoom = {
      roomId,
      status: 'waiting',
      createdAt: Date.now(),
      hostId: playerId,
      players: {
        [playerId]: {
          id: playerId,
          colour: selectedColour,
          ready: true,
          joinedAt: Date.now(),
        },
      },
      gameState: createInitialGameState(),
    };

    setLocalPlayerId(playerId);
    setRoom(nextRoom);
    setRoomCodeInput(roomId);
    setError('');
    setMessage('Room created. Share the code with a friend to join.');
    persistRoom(nextRoom);

    if (hasFirebaseConfig && firebaseDb) {
      await set(getRoomLookup(roomId)!, nextRoom);
    }
  };

  const joinRoom = async () => {
    const roomId = roomCodeInput.trim().toUpperCase();
    const playerId = getOrCreatePlayerId();

    if (!roomId) {
      setError('Enter a room code first.');
      return;
    }

    if (roomId === SOLO_TEST_ROOM_ID) {
      const testRoom: GameRoom = {
        roomId: SOLO_TEST_ROOM_ID,
        status: 'deploying',
        createdAt: Date.now(),
        hostId: playerId,
        players: {
          [playerId]: {
            id: playerId,
            colour: 'blue',
            ready: true,
            joinedAt: Date.now(),
          },
        },
        gameState: createDeploymentGameState(),
        testMode: true,
      };

      setRoom(testRoom);
      setLocalPlayerId(playerId);
      setSelectedColour('blue');
      setError('');
      setMessage('Solo test room started. You control both Blue and Red.');
      return;
    }

    if (hasFirebaseConfig && firebaseDb) {
      const existingReference = getRoomLookup(roomId);
      if (!existingReference) {
        setError('Could not access the room service.');
        return;
      }

      const snapshot = await import('firebase/database').then(({ get }) => get(existingReference));
      const existingRoom = snapshot.val() as GameRoom | null;

      if (!existingRoom) {
        setError('No room exists for that code yet.');
        return;
      }

      const takenColour = Object.values(existingRoom.players).some((player) => player.colour === selectedColour && player.id !== playerId);
      if (takenColour) {
        setError('That colour is already taken in this room. Choose another one.');
        return;
      }

      const updatedRoom: GameRoom = {
        ...existingRoom,
        players: {
          ...existingRoom.players,
          [playerId]: {
            id: playerId,
            colour: selectedColour,
            ready: true,
            joinedAt: Date.now(),
          },
        },
        gameState: existingRoom.gameState ?? createInitialGameState(),
      };

      setRoom(updatedRoom);
      setLocalPlayerId(playerId);
      setError('');
      setMessage('Joined the room successfully.');
      await set(existingReference, updatedRoom);
      return;
    }

    const existingRoom = loadLocalRoom(roomId);
    if (!existingRoom) {
      setError('No room exists for that code yet.');
      return;
    }

    const takenColour = Object.values(existingRoom.players).some((player) => player.colour === selectedColour && player.id !== playerId);
    if (takenColour) {
      setError('That colour is already taken in this room. Choose another one.');
      return;
    }

    const updatedRoom: GameRoom = {
      ...existingRoom,
      players: {
        ...existingRoom.players,
        [playerId]: {
          id: playerId,
          colour: selectedColour,
          ready: true,
          joinedAt: Date.now(),
        },
      },
      gameState: existingRoom.gameState ?? createInitialGameState(),
    };

    setRoom(updatedRoom);
    setLocalPlayerId(playerId);
    setError('');
    setMessage('Joined the room successfully.');
    persistRoom(updatedRoom);
  };

  const syncRoomGameState = async (nextState: GameState) => {
    if (!room) {
      return;
    }

    const nextRoom: GameRoom = {
      ...room,
      status: nextState.status === 'deploying' || nextState.status === 'playing' ? nextState.status : room.status,
      gameState: nextState,
    };

    setRoom(nextRoom);
    setGameStarted(nextRoom.status === 'deploying' || nextRoom.status === 'playing');

    if (!room.testMode) {
      persistRoom(nextRoom);
    }

    if (hasFirebaseConfig && firebaseDb && !room.testMode) {
      await set(ref(firebaseDb, `rooms/${room.roomId}`), nextRoom);
    }
  };

  const startGame = async () => {
    if (!room || !canStart) {
      setError('Two players need to choose their colours before starting.');
      return;
    }

    const nextRoom: GameRoom = {
      ...room,
      status: 'deploying',
      gameState: createDeploymentGameState(),
    };

    setRoom(nextRoom);
    setGameStarted(true);
    setMessage('Deployment phase started. Place your units and click deploy when ready.');
    persistRoom(nextRoom);

    if (hasFirebaseConfig && firebaseDb) {
      await set(ref(firebaseDb, `rooms/${room.roomId}`), nextRoom);
    }
  };

  const copyRoomCode = async () => {
    if (!room) {
      return;
    }

    try {
      await navigator.clipboard.writeText(room.roomId);
      setError('');
      setMessage('Room code copied to clipboard.');
    } catch {
      setError('Could not copy automatically. Please copy the room code manually.');
      setMessage('');
    }
  };

  const cancelRoom = () => {
    setRoom(null);
    setGameStarted(false);
    setError('');
    setMessage('');
  };

  return (
    <div className="games-page">
      <div className="blerb-box">
        <h2>Border Siege</h2>
        <p>
          A small, playable medieval skirmish prototype built on a circular hex grid. Each side controls a castle,
          a peasant, and a short movement window to claim territory before the ten-round match ends.
        </p>
      </div>

      {!gameStarted && (
        <div className="room-lobby-wrapper">
          <div className="room-lobby-card">
            <div className="room-lobby-header">
              <h3>Match lobby</h3>
              <span className="mode-pill">{hasFirebaseConfig ? 'Online room' : 'Local room demo'}</span>
            </div>

            <div className="room-inputs">
              <label className="field-label">
                <span>Room code</span>
                <input
                  type="text"
                  value={roomCodeInput}
                  onChange={(event) => setRoomCodeInput(event.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                />
              </label>

              <label className="field-label">
                <span>Colour</span>
                <select value={selectedColour} onChange={(event) => setSelectedColour(event.target.value as PlayerColor)}>
                  <option value="blue">Blue</option>
                  <option value="red">Red</option>
                </select>
              </label>
            </div>

            <div className="room-actions">
              <button type="button" className="primary-button" onClick={createRoom}>Create room</button>
              <button type="button" className="secondary-button" onClick={joinRoom}>Join room</button>
              {room && (
                <button type="button" className="secondary-button" onClick={cancelRoom}>Clear room</button>
              )}
            </div>

            {error && <div className="room-message error">{error}</div>}
            {message && !error && <div className="room-message success">{message}</div>}

            {room && (
              <div className="room-status-panel">
                <div className="room-code-banner">
                  <span>Room</span>
                  <div className="room-code-inline">
                    <strong>{room.roomId}</strong>
                    <button type="button" className="copy-code-button" onClick={copyRoomCode}>Copy code</button>
                  </div>
                </div>

                <div className="player-list">
                  {Object.values(room.players).map((player) => (
                    <div key={player.id} className="player-chip">
                      <span className={`player-dot ${player.colour}`} />
                      <span>{player.colour === 'blue' ? 'Blue' : 'Red'}</span>
                      {player.id === localPlayerId && <small>(You)</small>}
                    </div>
                  ))}
                </div>

                {room.status === 'waiting' && canStart && (
                  <button type="button" className="start-button" onClick={startGame}>Start game</button>
                )}
                {room.status === 'waiting' && !canStart && (
                  <p className="room-note">Need two players with different colours to begin.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {gameStarted && room && (
        <div className="hex-prototype-panel">
          <div className="hex-prototype-shell">
            <HexPrototypeGame
              initialGameState={room.gameState ?? createInitialGameState()}
              roomId={room.roomId}
              playerColour={room.players[localPlayerId]?.colour ?? selectedColour}
              allowBothPlayers={room.testMode}
              onGameStateChange={syncRoomGameState}
              onLeaveRoom={() => { void leaveRoom(false); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GamesPage;
