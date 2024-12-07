// src/GameSnake.js
import React, { useState, useEffect, useRef, useCallback } from 'react';

const SPEEDS = {
    SLOW: { label: 'Slow', value: 200 },
    MEDIUM: { label: 'Medium', value: 100 },
    FAST: { label: 'Fast', value: 50 }
  };

const GameSnake = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [canChangeDirection, setCanChangeDirection] = useState(true);
  const [gameSpeed, setGameSpeed] = useState(SPEEDS.MEDIUM);

  const canvasSize = { width: 300, height: 300 };
  const scale = 10;

  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.setTransform(scale, 0, 0, scale, 0, 0);
        context.clearRect(0, 0, canvasSize.width, canvasSize.height);
        context.fillStyle = 'green';
        snake.forEach(({ x, y }) => context.fillRect(x, y, 1, 1));
        context.fillStyle = 'red';
        context.fillRect(food.x, food.y, 1, 1);
      }
    }
  }, [snake, food, canvasSize.width, canvasSize.height]);

  const checkCollision = useCallback((head: { x: number, y: number }) => {
    if (head.x < 0 || head.x >= canvasSize.width / scale || head.y < 0 || head.y >= canvasSize.height / scale) {
      return true;
    }
    for (let segment of snake) {
      if (head.x === segment.x && head.y === segment.y) {
        return true;
      }
    }
    return false;
  }, [snake, canvasSize.width, canvasSize.height, scale]);

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y };

      if (head.x === food.x && head.y === food.y) {
        newSnake.unshift(head);
        setFood({ x: Math.floor(Math.random() * (canvasSize.width / scale)), y: Math.floor(Math.random() * (canvasSize.height / scale)) });
      } else {
        newSnake.pop();
        newSnake.unshift(head);
      }

      if (checkCollision(head)) {
        setGameOver(true);
        setGameActive(false);
        return prevSnake;
      } else {
        setCanChangeDirection(true);
        return newSnake;
      }
    });
  }, [direction, food, checkCollision, canvasSize.width, canvasSize.height, scale]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameActive && canChangeDirection) {
      let newDirection = direction;
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) newDirection = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (direction.y === 0) newDirection = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (direction.x === 0) newDirection = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (direction.x === 0) newDirection = { x: 1, y: 0 };
          break;
        default:
          break;
    } 
        e.preventDefault();    
        if (newDirection !== direction) {
            setDirection(newDirection);
            setCanChangeDirection(false);
        }
    }
  }, [direction, gameActive, canChangeDirection]);

  useEffect(() => {
    if (gameActive) {
      const interval = setInterval(() => {
        if (!gameOver) {
          moveSnake();
        }
      }, gameSpeed.value);
      return () => clearInterval(interval);
    }
  }, [gameOver, gameActive, moveSnake, gameSpeed]);

  useEffect(() => {
    if (gameActive) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, gameActive]);

  const startGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection({ x: 1, y: 0 });
    setGameOver(false);
    setGameActive(true);
  };

  const handleSpeedChange = (speed: keyof typeof SPEEDS) => {
    setGameSpeed(SPEEDS[speed]);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={`${canvasSize.width}px`}
        height={`${canvasSize.height}px`}
        style={{ border: '1px solid black' }}
      />
      {!gameActive && !gameOver && <button className='button' onClick={startGame}>Click to Start</button>}
      {gameOver && <div>Game Over. <button className='button' onClick={startGame}>Restart</button></div>}
      {gameOver && (
        <div>
          <button className='button' onClick={() => handleSpeedChange('SLOW')}>{SPEEDS.SLOW.label}</button>
          <button className='button' onClick={() => handleSpeedChange('MEDIUM')}>{SPEEDS.MEDIUM.label}</button>
          <button className='button' onClick={() => handleSpeedChange('FAST')}>{SPEEDS.FAST.label}</button>
        </div>
      )}
      <div>Gamespeed set to: {gameSpeed.label}</div>
    </div>
  );
};

export default GameSnake;