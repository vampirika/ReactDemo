import React, { useEffect, useState } from 'react';
import QuestionDisplay from './GameQuestionDisplay.tsx';

const GameNumbers = () => {
  const [currentSum, setCurrentSum] = useState({ num1: 2, num2: 2, correctAnswer: 4 });
  const [options, setOptions] = useState<{ value: number; disabled: boolean }[]>([
    { value: 1, disabled: false },
    { value: 4, disabled: false },
    { value: 7, disabled: false },
    { value: 2, disabled: false }
  ]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
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

  const [highScore, setHighScore] = useState<number>(
    () => parseInt(localStorage.getItem("highScore") || "0", 10) // Default to 0
  );
  const [scoreHistory, setScoreHistory] = useState<number[]>(
    () => JSON.parse(localStorage.getItem("scoreHistory") || "[]") // Default to empty array
  );
  const [notification, setNotification] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("highScore", highScore.toString()); // Save high score
  }, [highScore]);
  
  useEffect(() => {
    localStorage.setItem("scoreHistory", JSON.stringify(scoreHistory)); // Save score history
  }, [scoreHistory]);

  // Generate a random number between 1 and 9
  const getRandomNumber = (min: number = 1, max: number = 5) => 
    Math.floor(Math.random() * (max - min + 1)) + min;

  const generateWrongAnswers = (correctAnswer: number, count: number = 3): number[] => {
    const wrongAnswers = new Set<number>();
    while (wrongAnswers.size < count) {
      const randomAnswer = getRandomNumber() + getRandomNumber();
      if (randomAnswer !== correctAnswer) {
        wrongAnswers.add(randomAnswer);
      }
    }
    return Array.from(wrongAnswers);
  };

  // Generate a new sum and answer options
  const generateNewSum = () => {
    const num1 = getRandomNumber();
    const num2 = getRandomNumber();
    const correctAnswer = num1 + num2;
    const wrongAnswers = generateWrongAnswers(correctAnswer);

    // Combine correct answer and wrong answers
    const allOptions = [...wrongAnswers, correctAnswer]
    .sort(() => Math.random() - 0.5) // Shuffle options
    .map((value) => ({ value, disabled: false })); // Add `disabled: false`

    setCurrentSum({ num1, num2, correctAnswer });
    setOptions(allOptions);
  };

  // Handle answer selection
  const handleAnswerClick = (selectedAnswer: number, index: number) => {
    setOptions((prevOptions) =>
      prevOptions.map((option, i) =>
        i === index ? { ...option, disabled: true } : option
      )
    );
    if (selectedAnswer === currentSum.correctAnswer) {
      setScore(score + 1); // Increment score if correct
      generateNewSum(); // Generate a new sum
      setNotification("");
    } else {
      if (lives > 1) {
        setLives(lives - 1); // Decrement lives
        setNotification("Incorrect! A life was lost.");
      } else {
        if (score > highScore) {
          setHighScore(score);
        }
        setScoreHistory([...scoreHistory, score]);
        setNotification("Game Over! Try again...");
        setScore(0); // Reset score
        setLives(3); // Reset lives
        generateNewSum(); // Restart with a new sum
      }
    }
  };

  return (
    <div className='game-wrapper'>
      <h2 className='game-title'>Numbers Game</h2>
      <div className='player-display'>
        <LivesDisplay lives={lives} />
        <p>Score: {score}</p>
      </div>
      
      <QuestionDisplay num1={currentSum.num1} num2={currentSum.num2} />

      {notification && <p className="notification">{notification}</p>}
      <div className='answers-container'>
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(option.value, index)}
            disabled={option.disabled}
            className='answer-card'
          >
            {option.value}
          </button>
        ))}
      </div>

      <p>High Score: {highScore}</p>
      <p>Score History: {scoreHistory.slice(-5).join(", ")}</p>
    </div>
  );
};

export default GameNumbers;