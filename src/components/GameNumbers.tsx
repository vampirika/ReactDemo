import React, { useEffect, useState } from 'react';
import QuestionDisplay from './GameQuestionDisplay.tsx';
import LivesDisplay from './GameLivesDisplay.tsx';

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
  const [useImages, setUseImages] = useState(true);

  // Handle checkbox toggle
  const handleToggleDisplay = (e) => {
    setUseImages(e.target.checked);
  };

  const [highScore, setHighScore] = useState<number>(
    () => parseInt(localStorage.getItem("highScoreNumbers") || "0", 10) // Default to 0
  );
  const [scoreHistory, setScoreHistory] = useState<number[]>(
    () => JSON.parse(localStorage.getItem("scoreHistoryNumbers") || "[]") // Default to empty array
  );
  const [notification, setNotification] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("highScoreNumbers", highScore.toString()); // Save high score
  }, [highScore]);
  
  useEffect(() => {
    localStorage.setItem("scoreHistoryNumbers", JSON.stringify(scoreHistory)); // Save score history
  }, [scoreHistory]);

  // Generate a random number between x and y
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

      {useImages ? (
        <QuestionDisplay num1={currentSum.num1} num2={currentSum.num2} />
      ) : (
        <div className="question-container">
          <h2>{currentSum.num1} + {currentSum.num2}</h2>
        </div>
      )}

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
      
      <div style={{ margin: "35px 3px" }}>
        <label>
          <input type="checkbox" checked={useImages} onChange={handleToggleDisplay} />
          Display question with images
        </label>
        <p>High Score: {highScore}</p>
        <p>Score History: {scoreHistory.slice(-5).join(", ")}</p>
      </div>

    </div>
  );
};

export default GameNumbers;