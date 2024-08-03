// Contact.js
import React from 'react';
import './imagesPage.css';


const ImagesPage = () => {

  
  return <div>
            <div className="wrapper wrap">
                <div className="exampleBoxImage full-center">
                    <h4> Standard</h4>
                    <img src="https://placehold.co/300x200" alt="placeholder"></img>
                </div>

                <div className="exampleBoxImage full-center">
                    <h4> Hover</h4>
                    <img src="https://placehold.co/300x200" alt="placeholder"></img>
                </div>

                <div className="exampleBoxImage full-center">
                    <h4> Slide</h4>
                    <img src="https://placehold.co/300x200" alt="placeholder"></img>
                </div>    
            </div>
        </div>;
};

export default ImagesPage;