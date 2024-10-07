import React from 'react';
import './cardsAndScrollsPage.css';

const CardsAndScrollsPage = () => {
  
  return <div>
            <div className='blerb-box'>
                <div>This page displays various ways to display multiple items with scroll type features.</div>
            </div>

            <div className="wrapper wrap">
                <div className="exampleBoxCard full-center">
                    <h4>Hover</h4>
                    <div className="list">
                        <div className="small-item"><img src="images/vertical_flower_1.jpg" alt="placeholder"></img></div>
                        <div className="small-item"><img src="images/vertical_flower_1.jpg" alt="placeholder"></img></div>
                        <div className="small-item"><img src="images/vertical_flower_1.jpg" alt="placeholder"></img></div>
                        <div className="small-item"><img src="images/vertical_flower_1.jpg" alt="placeholder"></img></div>
                        <div className="small-item"><img src="images/vertical_flower_1.jpg" alt="placeholder"></img></div>
                        <div className="small-item"><img src="images/vertical_flower_1.jpg" alt="placeholder"></img></div>
                        <div className="small-item"><img src="images/vertical_flower_1.jpg" alt="placeholder"></img></div>
                    </div>
                </div>              
            </div>

            <div className="wrapper wrap">
                <div className="exampleBoxCard full-center">
                    <h4>Scroll</h4>
                    <div className="list-two">
                        <div className="item"><img src="images/vertical_flower_1.jpg" alt="placeholder"></img></div>
                        <div className="item"><img src="images/vertical_flower_1.jpg" alt="placeholder"></img></div>
                        <div className="item"><img src="images/vertical_flower_1.jpg" alt="placeholder"></img></div>
                        <div className="item"><img src="images/vertical_flower_1.jpg" alt="placeholder"></img></div>
                        <div className="item"><img src="images/vertical_flower_1.jpg" alt="placeholder"></img></div>
                        <div className="item"><img src="images/vertical_flower_1.jpg" alt="placeholder"></img></div>
                        <div className="item"><img src="images/vertical_flower_1.jpg" alt="placeholder"></img></div>
                    </div>
                </div>              
            </div>
        </div>;
};

export default CardsAndScrollsPage;