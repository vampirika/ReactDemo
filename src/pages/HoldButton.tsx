import React, { useState, useRef } from 'react';

const HoldButton = () => {
  const [isHolding, setIsHeld] = useState(false);
  const [progress, setProgress] = useState(0);
  const holdTimeout = useRef<number | null>(null);
  const interval = useRef<number | null>(null);

  const handleMouseDown = () => {
    setIsHeld(true);
    
    let progressValue = 10;
    interval.current = setInterval(() => {
      progressValue += 10;
      setProgress(progressValue);
      if (progressValue > 100) {
        if (interval.current) {
            clearInterval(interval.current);
        }
        setProgress(0);
      }
    }, 200);

    holdTimeout.current = setTimeout(() => {
      handleHoldClick();
      setIsHeld(false);
    }, 2000);
  };

  const handleMouseUp = () => {
    if (holdTimeout.current) {
        clearTimeout(holdTimeout.current);
    }
    if (interval.current) {
        clearInterval(interval.current);
    }
    setIsHeld(false);
    setProgress(0);
  };

  const handleHoldClick = () => {
    console.log(isHolding)
    alert('Button held for 2 seconds!');
    // Add any action you want to perform after the button is held
  };

  return (   
    <div>
      <button
        className="button holding-button"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isHolding ? 'Holding...' : 'Hold me'}
      </button>
      {isHolding && <div className="progress-bar"><div className="progress" style={{ width: `${progress}%` }}></div></div>}
    </div>
  );
};

export default HoldButton;