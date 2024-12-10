import React, { useEffect, useState } from 'react';
import QuestionDisplay from './GameQuestionDisplay.tsx';
import LivesDisplay from './GameLivesDisplay.tsx';

const GameWords = () => {
  const wordsList = [
    { word: "dog", images: ["/images/gossipguys.png", "/images/gossipguys.png"] },
    { word: "cat", images: ["/images/noa.jpg", "/images/noa.jpg"] },
    { word: "flower", images: ["/images/flower.png", "/images/flower2.png"] },
  ];

  const [prompt, setPrompt] = useState<{ word: string; images: string[] } | null>(null);
  const [options, setOptions] = useState<{ word: string; image: string; correct: boolean; disabled: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  //const [useImages, setUseImages] = useState(true);

  // Initialize game
  const initializeGame = () => {
    const randomPrompt = wordsList[Math.floor(Math.random() * wordsList.length)];

  // Generate options
  const correctOptions = randomPrompt.images.map((img) => ({
    word: randomPrompt.word,
    image: img,
    correct: true,
    disabled: false,
  }));

  // Generate incorrect options
  const incorrectOptions = wordsList
    .filter((item) => item.word !== randomPrompt.word)
    .flatMap((item) =>
      item.images.map((img) => ({
        word: item.word,
        image: img,
        correct: false,
        disabled: false,
      }))
    )
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

    // Combine and shuffle
    const shuffledOptions = [...correctOptions, ...incorrectOptions].sort(() => Math.random() - 0.5);

    setPrompt(randomPrompt);
    setOptions(shuffledOptions);
  };
  
  // Initialize game on first render
  React.useEffect(() => {
    initializeGame();
  }, []);

  const [highScore, setHighScore] = useState<number>(
    () => parseInt(localStorage.getItem("highScoreWords") || "0", 10) // Default to 0
  );
  const [scoreHistory, setScoreHistory] = useState<number[]>(
    () => JSON.parse(localStorage.getItem("scoreHistoryWords") || "[]") // Default to empty array
  );
  const [notification, setNotification] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("highScorehighScoreWords", highScore.toString()); // Save high score
  }, [highScore]);
  
  useEffect(() => {
    localStorage.setItem("scoreHistoryWords", JSON.stringify(scoreHistory)); // Save score history
  }, [scoreHistory]);

  // Handle button click
  const handleOptionClick = (index: number) => {
    const clickedOption = options[index];
    const updatedOptions = options.map((option, i) =>
      i === index ? { ...option, disabled: true } : option
    );

    setOptions(updatedOptions);

    if (clickedOption.correct) {
      setScore((prevScore) => prevScore + 1);
      setNotification("Correct!");
    } else {
      if (lives > 1) {
        setLives((prevLives) => prevLives - 1);
        setNotification("Incorrect! A life was lost.");
      } else {
        setNotification("Game Over! Restarting...");
        setLives(3);
        setScore(0);
        initializeGame();
        return;
      }
    }

    // Check if all correct options have been clicked
    const allCorrectClicked = updatedOptions.every((option) =>
      option.correct ? option.disabled : true
    );

    if (allCorrectClicked) {
      setTimeout(() => {
        setNotification("Great job! Moving to the next round...");
        initializeGame();
      }, 1000);
    }
  };

  return (
    <div className='game-wrapper'>
      <h2 className='game-title'>Numbers Game</h2>
      <div className='player-display'>
        <LivesDisplay lives={lives} />
        <p>Score: {score}</p>
      </div>
      <h2>Question: What is this: x</h2>
      {/* Display prompt */}
      {prompt && (
        <div className="prompt">
          <p>Match this:</p>
          <img src={prompt.images[0]} alt={prompt.word} style={{ width: "150px" }} />
        </div>
      )}

      {notification && <p className="notification">{notification}</p>}

      <div className='answers-container'>
      {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(index)}
            disabled={option.disabled}
            style={{
              border: option.disabled
                ? option.correct
                  ? "2px solid green"
                  : "2px solid red"
                : "none",
              opacity: option.disabled ? 0.5 : 1,
            }}
          >
            <img src={option.image} alt={option.word} style={{ width: "100px" }} />
          </button>
        ))}
      </div>
      
      <div style={{ margin: "35px 3px" }}>
        <p>High Score: {highScore}</p>
        <p>Score History: {scoreHistory.slice(-5).join(", ")}</p>
      </div>

    </div>
  );
};

export default GameWords;