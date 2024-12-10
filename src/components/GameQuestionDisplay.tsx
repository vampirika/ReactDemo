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
      {renderImages(num1, "/images/noa.jpg", "Heart")}
      <span className="question-addition-sign">+</span>
      {renderImages(num2, "/images/flower.png", "Flower")}
    </div>
  );
};

export default QuestionDisplay;