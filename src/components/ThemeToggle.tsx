import React, { useState, useEffect } from 'react';

function ThemeToggle() {
    const getInitialTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
          return savedTheme;
        } else {
          const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
          return prefersDarkMode ? 'dark' : 'dark';
        }
      };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div>
      <button className='small-button' onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
      </button>
    </div>
  );
}

export default ThemeToggle;