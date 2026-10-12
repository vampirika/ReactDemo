import React from 'react';
import HexPrototypeGame from '../components/HexPrototypeGame.tsx';
import './gamesPage.css';

const GamesPage = () => {
  return (
    <div className="games-page">
      <div className="blerb-box">
        <h2>Border Siege</h2>
        <p>
          A small, playable medieval skirmish prototype built on a circular hex grid. Each side controls a castle,
          a peasant, and a short movement window to claim territory before the ten-round match ends.
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
