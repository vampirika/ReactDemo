// Homepage.js
import React from 'react';
import CommitTime from '../components/CommitTime.tsx';
import './homepage.css';

const Homepage = () => {
  return <div>
      <div className="homepage-wrapper">
        <div className="homepage-box">
            <p>Welcome to my Home Page. My name is Ben and this is a demo of some of the work I can do in React.</p>

            <p>It uses a CI/CD structure; I develop locally and push to github which automatically runs a deployment 
            to an azure static web app that hosts the website online, from which you are viewing this.
            You can view the rest of my github <a href="https://github.com/vampirika" target="_blank" rel="noreferrer">here</a>.</p>

            <p>Please feel free to explore the other pages although please note some items may still be WIP. Thank you for visiting.</p>
            <CommitTime />
        </div>
      </div>
    </div>    
};

export default Homepage;