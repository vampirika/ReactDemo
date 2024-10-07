// Header.js
import React, { useEffect, useRef, useState } from 'react';
import './header.css';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle.tsx';

const Header = () => {
  const [isRevealed, setIsRevealed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null); 
  
  const handleReveal = () => {
    setIsRevealed(prevState => !prevState);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsRevealed(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="header-wrapper">
        <div className="header">
          <span>React Demo</span>
        </div>

        <nav className="navbar" ref={menuRef}>
          <div className="burger-menu" id="burger-menu" onClick={handleReveal}>
              <div className="line"></div>
              <div className="line"></div>
              <div className="line"></div>
          </div>

          <ul className={`nav-links ${isRevealed ? 'active' : ''}`}>
            <li><Link to="/" onClick={handleReveal}>Homepage</Link></li>
            <li><Link to="/buttons" onClick={handleReveal}>Buttons</Link></li>
            <li><Link to="/images" onClick={handleReveal}>Images</Link></li>
            <li><Link to="/crud" onClick={handleReveal}>CRUD</Link></li>
            <li><Link to="/games" onClick={handleReveal}>Games</Link></li>
            <li><Link to="/todo" onClick={handleReveal}>To Do List</Link></li>
            <li><Link to="/cardsandscrolls" onClick={handleReveal}>Cards and Scrolls</Link></li>
            <li><ThemeToggle /></li>
          </ul>
        </nav> 
    </header>
  );
};

export default Header;