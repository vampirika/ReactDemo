import React, { useEffect, useState } from 'react';
import LivesDisplay from './GameLivesDisplay.tsx';

const GameWords = () => {
  const wordsList = React.useMemo( () => [
    { word: "dog", images: ["/images/dog.jpg", "/images/dog.jpg", "/images/cartoondog.jpg", "/images/cartoondog2.jpg"] },
    { word: "cat", images: ["/images/cat.jpg", "/images/cat.jpg", "/images/cartooncat.jpg", "/images/cartooncat2.jpg", "/images/cat2.jpg", "/images/cat_tom.jpg"] },
    { word: "flower", images: ["/images/flower.png", "/images/flower2.png"] },
  ], []);
  const [nextPrompt, setNextPrompt] = useState<{ word: string; images: string[]; } | null>(null);
  const [nextOptions, setNextOptions] = useState<{ word: string; image: string; correct: boolean; disabled: boolean }[]>([]);


  const [prompt, setCurrentPrompt] = useState<{ word: string; images: string[] } | null>(null);
  const [options, setCurrentOptions] = useState<{ word: string; image: string; correct: boolean; disabled: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [loading, setLoading] = useState(false);

  // Initialize game
  const initializeGame = React.useCallback(() => {
    console.log("1 - Initializing game...");
    const randomPrompt = wordsList[Math.floor(Math.random() * wordsList.length)];
    const totalOptions = 5;
    console.log("2 - Selected Prompt:", randomPrompt);
  
  // Generate correct options
  const correctOptions = Array.from(
    new Set(randomPrompt.images.map((img) => img))
  ).map((img) => ({
    word: randomPrompt.word,
    image: img,
    correct: true,
    disabled: false,
  }));
  console.log("Correct Options (Deduplicated):", correctOptions);

  // Generate incorrect options
  const incorrectOptions = Array.from(
    new Set(
      wordsList
        .filter((item) => item.word !== randomPrompt.word)
        .flatMap((item) => item.images)
    )
  ).map((img) => {
    const word = wordsList.find((item) =>
      item.images.includes(img)
    )?.word;
    return {
      word: word || "",
      image: img,
      correct: false,
      disabled: false,
    };
  });
  console.log("Incorrect Options (Deduplicated):", incorrectOptions);

  const guaranteedOptions = [
    correctOptions[Math.floor(Math.random() * correctOptions.length)],
    incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)],
  ];
  console.log("5 - Guaranteed Options:", guaranteedOptions);

   // Combine remaining correct and incorrect options
   const remainingOptions = [
    ...correctOptions.filter(
      (opt) => !guaranteedOptions.some((g) => g.image === opt.image)
    ),
    ...incorrectOptions.filter(
      (opt) => !guaranteedOptions.some((g) => g.image === opt.image)
    ),
  ].filter(
    (option, index, self) =>
      index === self.findIndex((opt) => opt.image === option.image)
  ); // Deduplicate again
  console.log("Remaining Options After Excluding Guaranteed:", remainingOptions);

  // Select remaining options to reach the desired totalOptions count
  const additionalOptions = remainingOptions.slice(
    0,
    totalOptions - guaranteedOptions.length
  );

  // Combine guaranteed options and additional options
  const finalOptions = [...guaranteedOptions, ...additionalOptions].sort(
    () => Math.random() - 0.5
  );
  console.log("Final Shuffled Options:", finalOptions);

    setNextPrompt(randomPrompt);
    setNextOptions(finalOptions);
    setLoading(false);
    console.log("8 - Game State Updated - Prompt and Options Set", randomPrompt, finalOptions);
  }, [wordsList]);

  // Effect to swap nextPrompt and nextOptions into currentPrompt and currentOptions
  useEffect(() => {
  if (!loading && nextPrompt && nextOptions) {
    setCurrentPrompt(nextPrompt);
    setCurrentOptions(nextOptions);
  }
}, [loading, nextPrompt, nextOptions]);
  
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const [highScore, setHighScore] = useState<number>(
    () => parseInt(localStorage.getItem("highScoreWords") || "0", 10) // Default to 0
  );
  const [scoreHistory, setScoreHistory] = useState<number[]>(
    () => JSON.parse(localStorage.getItem("scoreHistoryWords") || "[]") // Default to empty array
  );
  const [notification, setNotification] = useState<string>("");
  const [isNotificationHidden, setIsNotificationHidden] = useState(false);

  // Hide notification after 2 seconds
  useEffect(() => {
    if (notification === "Great job! Moving to the next round...") {
      const timeout = setTimeout(() => {
        setIsNotificationHidden(true);
      }, 2000);

      return () => clearTimeout(timeout);  // Cleanup timeout
    }
  }, [notification]);

  useEffect(() => {
    localStorage.setItem("highScorehighScoreWords", highScore.toString()); // Save high score
  }, [highScore]);
  
  useEffect(() => {
    localStorage.setItem("scoreHistoryWords", JSON.stringify(scoreHistory)); // Save score history
  }, [scoreHistory]);

  // Handle button click
  const handleOptionClick = (index: number) => {
    if (loading) return;
    
    const clickedOption = options[index];
    const updatedOptions = options.map((option, i) =>
      i === index ? { ...option, disabled: true } : option
    );

    setCurrentOptions(updatedOptions);

    if (clickedOption.correct) {
      setScore((prevScore) => prevScore + 1);
      setNotification("Correct!");
      setIsNotificationHidden(false); 
    } else {
      if (lives > 1) {
        setLives((prevLives) => prevLives - 1);
        setNotification("Incorrect! A life was lost.");
        setIsNotificationHidden(false); 
      } else {
        if (score > highScore) {
          setHighScore(score);
        }
        setScoreHistory([...scoreHistory, score]);
        setNotification("Game Over! Restarting...");
        setIsNotificationHidden(false); 
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
      setNotification("Great job! Moving to the next round...");
      setLoading(true);
      setCurrentOptions((prevOptions) =>
        prevOptions.map((option) => ({ ...option, disabled: true }))
      );
      setTimeout(() => {
        initializeGame();
        setLoading(false);
      }, 800);
    }
  };

  return (
    <div className='game-wrapper'>
      <h2 className='game-title'>Word Match Game</h2>
      <div className='player-display'>
        <LivesDisplay lives={lives} />
        <p>Score: {score}</p>
      </div>

        <div className='prompt-container'>
          {notification && <div className={`notification ${isNotificationHidden ? "hide" : ""}`}>{notification}</div>}

          {prompt && (
            <div className="prompt">
              <p>Match this:</p>
              <img src={prompt.images[0]} alt={prompt.word} style={{ width: "150px", borderRadius: "10px" }} />
            </div>
          )}
        </div>

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
                borderRadius: "10px"
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