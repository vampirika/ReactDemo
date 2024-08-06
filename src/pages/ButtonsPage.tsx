import React from 'react';
import './buttonsPage.css';
import HoldButton from '../components/HoldButton.tsx';
import HoldButtonProgress from '../components/HoldButtonProgress.tsx';


const Buttons = () => {
    const handleClick = (buttonType: string) => {
        alert(`${buttonType} button was clicked!`);
      };
  
  return <div>
            <div className="wrapper wrap">
                <div className="exampleBox full-center">
                    <h4> Standard</h4>
                    <button className="button" onClick={() => handleClick('Standard')}>
                        <span>Click me</span>
                    </button>
                </div>
                
                <div className="exampleBox full-center">
                    <h4> Transforming</h4>
                    <button className="button transforming-button" onClick={() => handleClick('Transform')}>
                        <span className="initial-button">+</span>
                        <span className="transformed-button">Add product</span>
                    </button>
                </div>

                <div className="exampleBox full-center">
                    <h4> Hold button</h4>
                    <HoldButton />
                </div>

                <div className="exampleBox full-center">
                    <h4> Hold button 2</h4>
                    <HoldButtonProgress />
                </div>

                <div className="exampleBox full-center">
                    <h4> Shine</h4>
                    <button className="button shining-button" onClick={() => handleClick('Shine')}>
                        <span>Click me</span>
                    </button>
                </div>

                <div className="exampleBox full-center">
                    <h4> Standard</h4>
                    <button className="button" onClick={() => handleClick('Standard')}>
                        <span>Click me</span>
                    </button>
                </div>
            </div>
        </div>;
};

export default Buttons;