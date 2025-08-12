import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MyTodos from './MyTodos';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('MyTodos Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders todo list when user is authenticated', () => {
    // Set authentication token in localStorage
    localStorage.setItem('authToken', 'test-token');
    
    render(<MyTodos />);
    
    // Check if the component renders the todo list
    expect(screen.getByText('My ToDo List')).toBeInTheDocument();
    expect(screen.getByText('Manage your personal tasks and stay organized')).toBeInTheDocument();
    
    // Check if default todos are displayed
    expect(screen.getByText('Complete user registration')).toBeInTheDocument();
    expect(screen.getByText('Explore the To Do List app')).toBeInTheDocument();
    expect(screen.getByText('Add a new task')).toBeInTheDocument();
  });

  test('allows adding a new todo', () => {
    // Set authentication token in localStorage
    localStorage.setItem('authToken', 'test-token');
    
    render(<MyTodos />);
    
    // Add a new todo
    const input = screen.getByPlaceholderText('Add a new task...');
    fireEvent.change(input, { target: { value: 'Test new todo' } });
    
    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);
    
    // Check if the new todo is added to the list
    expect(screen.getByText('Test new todo')).toBeInTheDocument();
  });

  test('allows toggling todo completion status', () => {
    // Set authentication token in localStorage
    localStorage.setItem('authToken', 'test-token');
    
    render(<MyTodos />);
    
    // Get the todo text and its associated checkbox
    const todoText = screen.getByText('Explore the To Do List app');
    const todoItem = todoText.closest('.todo-item');
    const todoCheckbox = todoItem.querySelector('input[type="checkbox"]');
    const initialCheckedState = todoCheckbox.checked;
    
    // Toggle the todo status
    fireEvent.click(todoCheckbox);
    
    // Check if the todo status is toggled
    expect(todoCheckbox.checked).not.toBe(initialCheckedState);
  });

  test('allows deleting a todo', () => {
    // Set authentication token in localStorage
    localStorage.setItem('authToken', 'test-token');
    
    render(<MyTodos />);
    
    // Get the todo text and delete button
    const todoText = 'Add a new task';
    expect(screen.getByText(todoText)).toBeInTheDocument();
    
    // Find the delete button in the same list item as the todo text
    const deleteButtons = screen.getAllByText('Delete');
    
    // Delete the todo (using the third delete button for "Add a new task")
    fireEvent.click(deleteButtons[2]);
    
    // Check if the todo is removed from the list
    expect(screen.queryByText(todoText)).not.toBeInTheDocument();
  });
});