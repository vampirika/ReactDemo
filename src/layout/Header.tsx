// Header.js
import React from 'react';
import './header.css';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header-wrapper">
        <div className="header">
          <span>React Demo</span>
        </div>

        <nav className="nav-menu">
        <Link to="/" >Homepage</Link>
        <Link to="/about" >About</Link>
        <Link to="/buttons" >Buttons</Link>
        </nav> 

    </header>
  );
};

export default Header;