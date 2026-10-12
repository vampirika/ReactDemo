import React, { useState, useEffect } from 'react';

function ThemeToggle() {
    const getInitialTheme = () => {
        const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
        if (savedTheme) {
          return savedTheme;
        }

        if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
          const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
          return prefersDarkMode ? 'dark' : 'light';
        }

        return 'dark';
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
      <button className='theme-toggle-button' onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
      </button>
    </div>
  );
}

export default ThemeToggle;