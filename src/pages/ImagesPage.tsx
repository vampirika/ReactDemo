import React from 'react';
import './imagesPage.css';
import SpoilerImage from './SpoilerImage.tsx';


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
                    <h4> Spoiler</h4>
                    <SpoilerImage 
                        imageUrl="https://placehold.co/300x200"
                        altText="Placeholder Image"/>
                </div>    
            </div>
        </div>;
};

export default ImagesPage;