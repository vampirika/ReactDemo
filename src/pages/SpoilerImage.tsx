// src/SpoilerImage.js
import React, { useState } from 'react';

const SpoilerImage = ({ imageUrl, altText }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  return (
    <div className={`spoiler-container ${isRevealed ? 'revealed' : ''}`} onClick={handleReveal}>
      {!isRevealed && <div className="spoiler-cover">Spoiler</div>}
      <img src={imageUrl} alt={altText} className="spoiler-image" />
    </div>
  );
};

export default SpoilerImage;