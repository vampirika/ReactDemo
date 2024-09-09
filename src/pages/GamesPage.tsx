// Games.js
import React from 'react';
import SnakeGame from '../components/SnakeGame.tsx';
import './gamesPage.css';

const GamesPage = () => {

return <div>
            <div className='blerb-box'>
                <div>
                    This page displays games made with javascript. Current games: Snake. <br />
                    Use arrow keys to move the green snake and eat the red pieces of food. Do not crash into the wall or your own snake body!
                </div>
                
            </div>
            
            <div className="wrapper wrap">
                <SnakeGame />
            </div>
        </div>;
};
  
  export default GamesPage;