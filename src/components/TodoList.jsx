import { use, useContext } from 'react';
import { TodoContext } from './TodoContext';
import TodoItem from './TodoItem';
import { fetchTodos, fetchCategories, fetchPriorities } from '../server/api';

// Create promises outside of the component to prevent re-creation during render
// This avoids the infinite suspension cycle
const todosPromise = fetchTodos();
const categoriesPromise = fetchCategories();
const prioritiesPromise = fetchPriorities();

export default function TodoList() {
  // Using the new 'use' API to read multiple promises
  const todos = use(todosPromise);
  const categories = use(categoriesPromise);
  const priorities = use(prioritiesPromise);
  
  const { filter } = useContext(TodoContext);
  
  // Filter todos based on the selected filter
  const filteredTodos = todos.filter(todo => {
    if (filter === 'all') return true;
    if (filter === 'completed') return todo.completed;
    if (filter === 'active') return !todo.completed;
    return true;
  });

  // Create maps for easier lookup
  const categoryMap = Object.fromEntries(
    categories.map(category => [category.name, category])
  );
  
  const priorityMap = Object.fromEntries(
    priorities.map(priority => [priority.name, priority])
  );

  return (
    <div>
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-lg font-medium">Todos</h2>
        <span className="px-2 py-1 bg-gray-100 rounded-lg text-sm text-gray-700">
          {filteredTodos.length} item{filteredTodos.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <ul className="mt-4 space-y-2">
        {filteredTodos.map(todo => (
          <TodoItem 
            key={todo.id} 
            todo={todo} 
            category={categoryMap[todo.category]} 
            priority={priorityMap[todo.priority]}
          />
        ))}
        
        {filteredTodos.length === 0 && (
          <li className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
            No todos to display
          </li>
        )}
      </ul>
    </div>
  );
} 