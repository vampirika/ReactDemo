import React from "react";

// Separate QuestionDisplay Component
const QuestionDisplay = ({ num1, num2 }: { num1: number; num2: number }) => {
  const renderImages = (count: number, src: string, alt: string) => (
    Array.from({ length: count }).map((_, index) => (
      <img
        key={index}
        src={src}
        alt={alt}
        className="question-image"
      />
    ))
  );

  return (
    <div className="question-container">
        <div className="question-container-part">
            {renderImages(num1, "/images/noa.jpg", "Heart")}
        </div>
        <div className="question-container-operator">
            <span className="question-addition-sign">+</span>
        </div>
        <div className="question-container-part">
            {renderImages(num2, "/images/vertical_flower_1.jpg", "Flower")}
        </div>
      
      
    </div>
  );
};

export default QuestionDisplay;