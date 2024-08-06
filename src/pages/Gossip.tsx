// Gossip.js
import React from 'react';
import './gossip.css';
import PlaySoundButton from '../components/SoundButton.tsx';
import PasswordProtected from '../components/PasswordProtected.tsx';

const Gossip: React.FC = () => (
    <PasswordProtected correctPassword="FAM">
        <div>
            <div className="homepage-wrapper">
                <div className="homepage-box">
                    <p>GOSSIP</p>
                    <img className="fun-image" src="images/gossipguys.png" alt="Gossip Guys"></img>

                    <PlaySoundButton soundUrl="sounds/loot.mp3"></PlaySoundButton>
                </div>
            </div>
        </div>
    </PasswordProtected>
);

export default Gossip;