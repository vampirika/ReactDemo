// Homepage.js
import React from 'react';
import './homepage.css';
import PlaySoundButton from '../components/SoundButton.tsx';

const Gossip = () => {
  return <div>
      <div className="homepage-wrapper">
        <div className="homepage-box">
            <p>GOSSIP</p>
            <PlaySoundButton soundUrl="sounds/loot.mp3"></PlaySoundButton>
        </div>
      </div>
    </div>    
};

export default Gossip;