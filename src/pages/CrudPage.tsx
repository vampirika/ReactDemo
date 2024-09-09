import React, { useEffect, useState } from 'react';
import './crudPage.css';

interface Post {
  id: number;
  title: string;
  body: string;
}

const CrudPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [toggledElements, setToggledElements] = useState<{ [key: number]: boolean }>({});

  const toggleOverflow = (index: number) => {
    setToggledElements(prevState => ({
      ...prevState,
      [index]: !prevState[index]
    }));
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  
  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts')
      .then(response => response.json())
      .then(data => setPosts(data))
      .catch(error => console.error('Error fetching posts:', error));
  }, []);

  const showMorePosts = () => {
    setVisibleCount(prevCount => prevCount + 5);
  };
  
  return <div>
    <div className='blerb-box'>
        <div>This page showcases the ability to use an external API to get and display information. It uses json placeholder, found <a href='https://jsonplaceholder.typicode.com/' target="_blank" rel="noreferrer">here</a>, as the endpoint.</div>
    </div>

    <div className="wrapper wrap">
        {posts.slice(0, visibleCount).map((post, index) => (
          <div className="exampleBoxPost full-center">
            <h4 className={`post-title ${toggledElements[index] ? 'shown' : 'hidden'}`}
            onClick={() => toggleOverflow(index)} key={post.id}>{capitalizeFirstLetter(post.title)}</h4>
            <p>{capitalizeFirstLetter(post.body)}</p>
          </div>
        ))}
    </div>
        
    <div className='wrapper mt-20'>
      {visibleCount < posts.length && (
        <button className='button' onClick={showMorePosts}>Show More</button>
      )}
    </div>
  </div>;
};

export default CrudPage;