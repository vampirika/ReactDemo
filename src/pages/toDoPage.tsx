import './todoPage.css';
import ToDoList from '../components/ToDoListComponent.tsx';
import React from 'react';


const ToDoPage = () => {
 
  return <div>
            <div className="wrapper wrap">
                <ToDoList />
            </div>
        </div>;
};

export default ToDoPage;