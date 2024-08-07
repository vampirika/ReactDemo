import React, { useState, useRef } from 'react';

const HoldButton = () => {
  const [isHolding, setIsHeld] = useState(false);
  const holdTimeout = useRef(0);

  const handleMouseDown = () => {
    setIsHeld(true);
    holdTimeout.current = setTimeout(() => {
      handleHoldClick();
      setIsHeld(false);
    }, 2000);
  };

  const handleMouseUp = () => {
    if (holdTimeout.current) {
        clearTimeout(holdTimeout.current);
    }
    setIsHeld(false);
  };

  const handleHoldClick = () => {
    console.log(isHolding)
    alert('Button held for 2 seconds!');
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
    </div>
  );
};

export default HoldButton;