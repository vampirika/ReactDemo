import React, { useEffect, useState } from 'react';

const ToDoList: React.FC = () => {
 // State for the list of todos and the current input
  const [todos, setTodos] = useState<string[]>(() => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [input, setInput] = useState<string>('');

  const addTodo = () => {
    if (input.trim() !== '') {
      const newTodos = [...todos, input];
      setTodos(newTodos);
      setInput('');
    }
  };

  const removeTodo = (index: number) => {
    const newTodos = todos.filter((_, i) => i !== index);
    setTodos(newTodos);
  };

  // Save todos to localStorage whenever the todos state changes
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Event handler for key press (Enter key to add a task)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTodo();
      console.log("enter key pressed");
    }
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