// Header.js
import React from 'react';
//import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="App-header-wrapper">
        <div className="header">
          <span>Some Header</span>
        </div>

        <nav className="nav-menu">
          <ul>Nav Menu 1</ul>
          <ul>Nav Menu 2</ul>
        </nav>

    </header>
  );
};

export default Header;