import React from 'react';
import './imagesPage.css';
import SpoilerImage from './SpoilerImage.tsx';
import TransformerImage from './PixelatedImageTransform.tsx';


const ImagesPage = () => {

  
  return <div>
            <div className="wrapper wrap">
                <div className="exampleBoxImage full-center">
                    <h4> Standard</h4>
                    <img src="images/flower.png" alt="placeholder"></img>
                </div>

                <div className="exampleBoxImage full-center">
                    <h4>Colour Change</h4>
                    <img className="colour-change"src="images/flower.png" alt="placeholder"></img>
                </div>

                <div className="exampleBoxImage full-center">
                    <h4> Spoiler</h4>
                    <SpoilerImage 
                        imageUrl="images/flower.png"
                        altText="Placeholder Image"/>
                </div>

                <div className="exampleBoxImage full-center">
                    <h4>Spoiler Hover</h4>
                    <img className="spoiler-hover"src="images/flower.png" alt="placeholder"></img>
                </div>

                <div className="exampleBoxImage full-center">
                    <h4>Transformer Hover</h4>
                    <TransformerImage 
                        imageUrl1="images/flower.png" altText1="Placeholder Image"
                        imageUrl2="images/flower2.png" altText2="Placeholder Image 2"/>
                </div>  
            </div>
        </div>;
};

export default ImagesPage;