import React from 'react';
import HexPrototypeGame from '../components/HexPrototypeGame.tsx';
import './gamesPage.css';

const GamesPage = () => {
  return (
    <div className="games-page">
      <div className="blerb-box">
        <h2>Game Prototypes</h2>
        <p>
          This page is the shared sandbox for strategy prototype experiments. The first build is a small
          isometric hex board with a few base units that can move across several tiles.
        </p>
      </div>

      <div className="hex-prototype-panel">
        <div className="hex-prototype-shell">
          <HexPrototypeGame />
        </div>
      </div>
    </div>
  );
};

export default GamesPage;
