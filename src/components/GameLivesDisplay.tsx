import React from "react";


const LivesDisplay = ({ lives }: { lives: number }) => {
  
  return (
    <div className="lives-container">
      Lives:
      {Array.from({ length: lives }).map((_, index) => (
        <img
          key={index}
          src="/images/noa.jpg"
          alt="Life"
          className="life-icon"
          style={{ width: "50px", height: "50px", margin: "0 3px" }} // Adjust size and spacing as needed
        />
      ))}
    </div>
  );
};

export default LivesDisplay;