import React from 'react';
import './footer.css';

const Footer = () => {
  return (
    <footer className="footer-wrapper">
        <div className="footer">
          <span>Copyright Ben 2024</span>
          <span>Contact - <a href="mailto:b.towner66@gmail.com" target="_blank" rel="noreferrer">b.towner66@gmail.com</a></span>
        </div>

        <nav className="nav-menu" aria-label="Footer navigation" />
    </footer>
  );
};

export default Footer;