// Header.js
import React, { useState } from 'react';
import './header.css';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isRevealed, setIsRevealed] = useState(false);
  
  const handleReveal = () => {
    setIsRevealed(prevState => !prevState);
  };

  return (
    <header className="header-wrapper">
        <div className="header">
          <span>React Demo</span>
        </div>

        <nav className="navbar">
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
          </ul>
        </nav> 
    </header>
  );
};

export default Header;