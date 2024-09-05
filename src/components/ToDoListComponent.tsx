import React, { useState } from 'react';

const ToDoList: React.FC = () => {
 // State for the list of todos and the current input
 const [todos, setTodos] = useState<string[]>([]);;
 const [input, setInput] = useState('');

 // Function to handle adding a new todo
 const addTodo = () => {
   if (input.trim() !== '') {
     setTodos([...todos, input]);
     setInput('');
   }
 };

   // Event handler for key press (Enter key to add a task)
   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTodo();
      console.log("enter key pressed");
    }
  };

 // Function to handle removing a todo by index
 const removeTodo = (index: number) => {
   const newTodos = todos.filter((_, i) => i !== index);
   setTodos(newTodos);
 };
  
  return <div>
            <div className="todo-wrapper">
              <div className='todo-box'>
                <h1>Todo List</h1>
                <div className="todo-input">
                    <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter a new task"
                    />
                    <button className="button" onClick={addTodo}>Add Task</button>
                </div>

                <ul className="todo-list">
                    {todos.map((todo, index) => (
                    <li className="todo-item" key={index}>
                        <div>{todo}</div>
                        <button className="button" onClick={() => removeTodo(index)}>Remove</button>
                    </li>
                    ))}
                </ul>
              </div>
            </div>
        </div>;
};

export default ToDoList;