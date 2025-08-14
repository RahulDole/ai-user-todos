import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyTodos.css';

function MyTodos() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Start with loading state
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null); // Track which task is being deleted
  
  // Check authentication and fetch tasks on component mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('authToken');
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Fetch tasks from the API
    fetchTasks();
  }, [navigate]);
  
  // Function to fetch tasks from the API
  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch('https://task-service-365603594789.europe-west1.run.app/api/v1/tasks', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken || ''}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tasks');
      }
      
      // Transform the API response to match our todo format
      // Check if data is an array before mapping
      const formattedTodos = Array.isArray(data)
        ? data.map(task => ({
            id: task.id,
            text: task.title,
            completed: task.completed || false
          }))
        : []; // Return empty array if data is not an array
      
      setTodos(formattedTodos);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again.');
      
      // Set default todos if we can't fetch from API
      setTodos([
        { id: 1, text: 'Complete user registration', completed: true },
        { id: 2, text: 'Explore the To Do List app', completed: false },
        { id: 3, text: 'Add a new task', completed: false }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new todo using the REST API
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (newTodoText.trim() === '') return;
    
    // Clear previous messages
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    
    try {
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch('https://task-service-365603594789.europe-west1.run.app/api/v1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || ''}`
        },
        body: JSON.stringify({
          title: newTodoText,
          description: '' // Optional description field
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create task');
      }
      
      // Add the new task to the local state
      const newTodo = {
        id: data.id || Date.now(), // Use server-provided ID or fallback
        text: newTodoText,
        completed: false
      };
      
      setTodos([...todos, newTodo]);
      setNewTodoText('');
      setSuccessMessage('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      setError(error.message || 'Failed to create task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle todo completion status
  const toggleTodoStatus = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // Delete todo with confirmation and API call
  const deleteTodo = async (id) => {
    // Ask for confirmation before deleting
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return; // User cancelled the deletion
    }
    
    // Clear previous messages
    setError(null);
    setSuccessMessage(null);
    setDeletingTaskId(id); // Set the task being deleted
    
    try {
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch(`https://task-service-365603594789.europe-west1.run.app/api/v1/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken || ''}`
        }
      });
      
      // For successful deletion, API returns 204 No Content
      if (response.status === 204) {
        // Remove the task from the local state
        setTodos(todos.filter(todo => todo.id !== id));
        setSuccessMessage('Task deleted successfully!');
      } else {
        // If not 204, try to parse error message from response
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error.message || 'Failed to delete task. Please try again.');
    } finally {
      setDeletingTaskId(null); // Clear the deleting state
    }
  };

  return (
    <div className="mytodos-container">
      <section className="mytodos-header">
        <h2>My ToDo List</h2>
        <p>Manage your personal tasks and stay organized</p>
      </section>

      {isLoading && (
        <div className="loading-indicator">
          <p>Loading your tasks...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchTasks} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      <section className="add-todo-section">
        <form onSubmit={handleAddTodo}>
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Add a new task..."
            className="todo-input"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="add-todo-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Add Task'}
          </button>
        </form>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="success-message">
            <p>{successMessage}</p>
          </div>
        )}
      </section>

      <section className="todos-list">
        {!isLoading && todos.length === 0 ? (
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
                  disabled={deletingTaskId === todo.id}
                >
                  {deletingTaskId === todo.id ? 'Deleting...' : 'Delete'}
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