import React, { useEffect, useState } from 'react';

// Define the structure of a Todo item
interface Todo {
  text: string;
  completed: boolean;
}

const ToDoList: React.FC = () => {
 // State for the list of todos and the current input
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  const [input, setInput] = useState<string>('');

    // Add a new todo
    const addTodo = () => {
      if (input.trim() !== '') {
        const newTodos = [...todos, { text: input, completed: false }];
        setTodos(newTodos);
        setInput('');
      }
    };

  const removeTodo = (index: number) => {
    const newTodos = todos.filter((_, i) => i !== index);
    setTodos(newTodos);
  };

  // Toggle completed state of a todo
  const toggleTodoCompletion = (index: number) => {
    const newTodos = todos.map((todo, i) => 
      i === index ? { ...todo, completed: !todo.completed } : todo
    );
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
                    <li className={`todo-item ${todo.completed ? 'completed-item' : ''}`} key={index}>
                        <button className="button remove-todo-button" onClick={() => removeTodo(index)}>X</button>
                        <button className="button complete-todo-button" onClick={() => toggleTodoCompletion(index)}>{todo.completed ? 'Undo' : 'Complete'}</button>
                        <div>{todo.text}</div>
                    </li>
                    ))}
                </ul>
              </div>
            </div>
        </div>;
};

export default ToDoList;