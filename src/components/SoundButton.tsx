// src/components/PlaySoundButton.js
import React, { useRef, useState } from 'react';

const PlaySoundButton = ( {soundUrl} ) => {
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(1); // Volume ranges from 0 to 1
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const playSound = () => {
        if (audioRef.current) {
            audioRef.current.play();
            setPlaying(true);
        }
    };

    const stopSound = () => {
        if (audioRef.current && playing) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setPlaying(false);
        }
    };

    const adjustVolume = (amount: number) => {
        if (audioRef.current) {
            const newVolume = Math.min(Math.max(volume + amount, 0), 1); // Ensure volume is between 0 and 1
            setVolume(newVolume);
            audioRef.current.volume = newVolume;
        }
    };

    return (
        <div>
            <button className="button" onClick={playSound}>Play Sound</button>
            <button className="button" onClick={stopSound}>Stop Sound</button>
            <br></br>
            <button className="button" onClick={() => adjustVolume(-0.1)}>Volume Down</button>
            <button className="button" onClick={() => adjustVolume(0.1)}>Volume Up</button>
            <audio ref={audioRef} src={soundUrl} />
            <br></br>
            <span>Volume: {volume.toPrecision(1)}</span>
        </div>
    );
};

export default PlaySoundButton;