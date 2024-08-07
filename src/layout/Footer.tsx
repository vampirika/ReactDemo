import React from 'react';
import './footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-wrapper">
        <div className="footer">
          <span>Copyright Ben 2024</span>
          <span>Contact - <a href="mailto:b.towner66@gmail.com" target="_blank" rel="noreferrer">b.towner66@gmail.com</a></span>
        </div>

        <nav className="nav-menu">
          <Link to="/gossip" >Fam</Link>
        </nav> 
    </footer>
  );
};

export default Footer;