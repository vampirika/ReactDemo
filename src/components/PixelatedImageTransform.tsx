import React from 'react';

const TransformerImage = ({ imageUrl1, imageUrl2, altText1, altText2 }) => {
  return (
        <div className="image-transformer-container">
            <img src={imageUrl1} alt={altText1} className="image transformer"></img>
            <img src={imageUrl2} alt={altText2} className="image transformed"></img>
        </div>
  );
};

export default TransformerImage;