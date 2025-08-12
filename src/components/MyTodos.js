import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyTodos.css';

function MyTodos() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([
    { id: 1, text: 'Complete user registration', completed: true },
    { id: 2, text: 'Explore the To Do List app', completed: false },
    { id: 3, text: 'Add a new task', completed: false }
  ]);
  const [newTodoText, setNewTodoText] = useState('');
  
  // Check authentication on component mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('authToken');
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate]);

  // Add new todo
  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodoText.trim() === '') return;
    
    const newTodo = {
      id: Date.now(),
      text: newTodoText,
      completed: false
    };
    
    setTodos([...todos, newTodo]);
    setNewTodoText('');
  };

  // Toggle todo completion status
  const toggleTodoStatus = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // Delete todo
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="mytodos-container">
      <section className="mytodos-header">
        <h2>My ToDo List</h2>
        <p>Manage your personal tasks and stay organized</p>
      </section>

      <section className="add-todo-section">
        <form onSubmit={handleAddTodo}>
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Add a new task..."
            className="todo-input"
          />
          <button type="submit" className="add-todo-btn">Add Task</button>
        </form>
      </section>

      <section className="todos-list">
        {todos.length === 0 ? (
          <div className="empty-todos">
            <p>You don't have any tasks yet. Add your first task above!</p>
          </div>
        ) : (
          <ul>
            {todos.map(todo => (
              <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <div className="todo-content">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodoStatus(todo.id)}
                    className="todo-checkbox"
                  />
                  <span className="todo-text">{todo.text}</span>
                </div>
                <button 
                  onClick={() => deleteTodo(todo.id)}
                  className="delete-todo-btn"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default MyTodos;