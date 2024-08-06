// Homepage.js
import React from 'react';
import './gossip.css';
import PlaySoundButton from '../components/SoundButton.tsx';

const Gossip = () => {
  return <div>
      <div className="homepage-wrapper">
        <div className="homepage-box">
            <p>GOSSIP</p>
            <img className="fun-image" src="images/gossipguys.png" alt="Gossip Guys"></img>

            <PlaySoundButton soundUrl="sounds/loot.mp3"></PlaySoundButton>
        </div>
      </div>
    </div>    
};

export default Gossip;