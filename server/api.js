/**
 * API Helper Functions for React 19 Demo
 * These functions demonstrate how to interact with the JSON Server API
 */

// Base URL for the API
// const API_URL = 'https://todosmm.free.beeceptor.com';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';


/**
 * Fetch all todos with optional filters
 * @param {Object} options - Filter options
 * @param {string} options.category - Filter by category
 * @param {string} options.priority - Filter by priority
 * @param {boolean} options.completed - Filter by completed status
 * @returns {Promise<Array>} - Array of todos
 */
export async function fetchTodos(options = {}) {
  let url = `${API_URL}/todos`;
  
  // Build query parameters
  const params = new URLSearchParams();
  if (options.category) params.append('category', options.category);
  if (options.priority) params.append('priority', options.priority);
  if (options.completed !== undefined) params.append('completed', options.completed);
  
  const queryString = params.toString();
  if (queryString) url += `?${queryString}`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch todos');
  return response.json();
}

/**
 * Fetch a specific todo by ID
 * @param {number|string} id - Todo ID
 * @returns {Promise<Object>} - Todo object
 */
export async function fetchTodoById(id) {
  const response = await fetch(`${API_URL}/todos/${id}`);
  if (!response.ok) throw new Error(`Failed to fetch todo with ID ${id}`);
  return response.json();
}

/**
 * Add a new todo
 * @param {Object} todo - Todo to add
 * @returns {Promise<Object>} - Added todo with ID
 */
export async function addTodo(todo) {
  const response = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(todo),
  });
  
  if (!response.ok) throw new Error('Failed to add todo');
  return response.json();
}

/**
 * Update a todo
 * @param {number|string} id - Todo ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Updated todo
 */
export async function updateTodo(id, updates) {
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) throw new Error(`Failed to update todo with ID ${id}`);
  return response.json();
}

/**
 * Delete a todo
 * @param {number|string} id - Todo ID
 * @returns {Promise<void>}
 */
export async function deleteTodo(id) {
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) throw new Error(`Failed to delete todo with ID ${id}`);
  return response.json();
}

/**
 * Fetch all categories
 * @returns {Promise<Array>} - Array of categories
 */
export async function fetchCategories() {
  const response = await fetch(`${API_URL}/categories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
}

/**
 * Fetch all priorities
 * @returns {Promise<Array>} - Array of priorities
 */
export async function fetchPriorities() {
  const response = await fetch(`${API_URL}/priorities`);
  if (!response.ok) throw new Error('Failed to fetch priorities');
  return response.json();
}

/**
 * Fetch stats about todos
 * @returns {Promise<Object>} - Todo statistics
 */
export async function fetchStats() {
  const response = await fetch(`${API_URL}/stats`);
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

/**
 * Batch update multiple todos at once
 * @param {Array<Object>} updates - Array of {id, updates} objects
 * @returns {Promise<Array>} - Array of updated todos
 */
export async function batchUpdateTodos(updates) {
  // Since JSON Server doesn't support batch operations natively,
  // we'll use Promise.all to perform multiple requests
  return Promise.all(
    updates.map(({ id, updates }) => updateTodo(id, updates))
  );
} 