import React, { useState, useRef } from 'react';

const HoldButton = () => {
  const [isHolding, setIsHeld] = useState(false);
  const holdTimeout = useRef<NodeJS.Timeout | number | null>(null);

  const handleMouseDown = () => {
    setIsHeld(true);
    holdTimeout.current = setTimeout(() => {
      handleHoldClick();
      setIsHeld(false);
    }, 2000);
  };

  const handleMouseUp = () => {
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current as number); // Explicit cast for TypeScript
      holdTimeout.current = null; // Reset to null for safety
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