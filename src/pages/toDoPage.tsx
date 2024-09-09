import './todoPage.css';
import ToDoList from '../components/ToDoListComponent.tsx';
import React from 'react';


const ToDoPage = () => {
 
  return <div>
            <div className='blerb-box'>
                <div>A to-do list that uses local storage to remember items. Items can be added, completed and removed.</div>
            </div>
            
            <div>
                <ToDoList />
            </div>
        </div>;
};

export default ToDoPage;