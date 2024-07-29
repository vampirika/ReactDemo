// Header.js
import React from 'react';
//import { Link } from 'react-router-dom';
import './header.css';

const Header = () => {
  return (
    <header className="header-wrapper">
        <div className="header">
          <span>React Demo</span>
        </div>

        <nav className="nav-menu">
          <ul>Nav Menu 1</ul>
          <ul>Nav Menu 2</ul>
        </nav>

    </header>
  );
};

export default Header;