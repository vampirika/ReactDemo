// Games.js
import React, { useState } from 'react';
import SnakeGame from '../components/SnakeGame.tsx';
import './gamesPage.css';

const GAMES = {
    SNAKE: { label: 'Snake', value: 1 },
    OTHER: { label: 'Other', value: 2 }
  };

const GamesPage = () => {

const [gameSelected, setGameSelected] = useState(GAMES.SNAKE);

const handleSelectGame = (game: keyof typeof GAMES) => {
    setGameSelected(GAMES[game]);
};

const renderContent = () => {
    switch (gameSelected.label) {
        case 'Snake':
        return <div className="wrapper wrap"><SnakeGame /></div>;
        case 'Other':
        return <div className="wrapper wrap"><div>Other game example</div></div>;
        default:
        return <p>No game selected</p>;
    }
};

const renderBlerbContent = () => {
    switch (gameSelected.label) {
        case 'Snake':
        return <div>Use arrow keys to move the green snake and eat the red pieces of food. Do not crash into the wall or your own snake body!</div>;
        case 'Other':
        return <div>Other game instructions</div>;
        default:
        return <p>No game selected</p>;
    }
};

return <div>
            <div className='blerb-box'>
                <div>
                    This page displays games made with javascript. Current games: {Object.values(GAMES).map(game => game.label).join(', ')}.<br />
                    {renderBlerbContent()}
                </div>
            </div>

            <button className="button" onClick={() => handleSelectGame('SNAKE')}>{GAMES.SNAKE.label}</button>
            <button className="button" onClick={() => handleSelectGame('OTHER')}>{GAMES.OTHER.label}</button>
            
            {renderContent()}
        </div>;
};
  
  export default GamesPage;