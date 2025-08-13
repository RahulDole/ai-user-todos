import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Mock fetch API
global.fetch = jest.fn();

describe('MyTodos Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
    
    // Reset fetch mock
    global.fetch.mockReset();
    
    // Mock successful response by default
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'mock-task-id',
        title: 'Test new todo',
        completed: false
      })
    });
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

  test('allows adding a new todo', async () => {
    // Set authentication token in localStorage and ensure it's properly mocked
    localStorage.getItem.mockReturnValue('test-token');
    
    render(<MyTodos />);
    
    // Add a new todo
    const input = screen.getByPlaceholderText('Add a new task...');
    fireEvent.change(input, { target: { value: 'Test new todo' } });
    
    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);
    
    // Verify fetch was called with correct parameters
    expect(fetch).toHaveBeenCalledWith(
      'https://task-service-365603594789.europe-west1.run.app/api/v1/tasks',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': expect.stringContaining('Bearer')
        }),
        body: expect.any(String)
      })
    );
    
    // Wait for the API call to complete and check if the new todo is added to the list
    await waitFor(() => {
      expect(screen.getByText('Test new todo')).toBeInTheDocument();
    });
    
    // Check for success message
    expect(screen.getByText('Task created successfully!')).toBeInTheDocument();
  });
  
  test('handles API error when adding a todo', async () => {
    // Set authentication token in localStorage and ensure it's properly mocked
    localStorage.getItem.mockReturnValue('test-token');
    
    // Mock API error response
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        message: 'Failed to create task'
      })
    });
    
    render(<MyTodos />);
    
    // Add a new todo
    const input = screen.getByPlaceholderText('Add a new task...');
    fireEvent.change(input, { target: { value: 'Test new todo' } });
    
    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);
    
    // Wait for the API call to complete and check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to create task')).toBeInTheDocument();
    });
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