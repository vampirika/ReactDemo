// Games.js
import React, { useState } from 'react';
import GameSnake from '../components/GameSnake.tsx';
import './gamesPage.css';
import GameNumbers from '../components/GameNumbers.tsx';

const GAMES = {
    SNAKE: { label: 'Snake', value: 1 },
    NUMBERS: { label: 'Numbers', value: 2 },
    WORDS: { label: 'Words', value: 3 },
    OTHER: { label: 'Other', value: 4 }
  };

const GamesPage = () => {

const [gameSelected, setGameSelected] = useState(GAMES.SNAKE);

const handleSelectGame = (game: keyof typeof GAMES) => {
    setGameSelected(GAMES[game]);
};

const renderContent = () => {
    switch (gameSelected.label) {
        case 'Snake':
        return <div className="wrapper wrap"><GameSnake /></div>;
        case 'Numbers':
        return <div className="wrapper wrap"><GameNumbers /></div>;
        case 'Words':
        return <div className="wrapper wrap"><div>Word game WIP</div></div>;
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
        case 'Numbers':
            return <div>Numbers game for Noa</div>;
        case 'Words':
            return <div>Word game for Noa</div>;
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

            <div className='game-select-wrapper'>
                {Object.entries(GAMES).map(([gameKey, game]) => (
                    <button key={gameKey} className="button"  onClick={() => handleSelectGame(gameKey as keyof typeof GAMES)}>{game.label}</button>
                ))}
            </div>

            {renderContent()}
        </div>;
};
  
  export default GamesPage;