import { useOptimistic } from 'react';
import { CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { updateTodo, deleteTodo } from '../server/api';

export default function TodoItem({ todo, category, priority }) {
  // Use optimistic for immediate UI updates
  const [optimisticTodo, updateOptimisticTodo] = useOptimistic(
    todo,
    (state, update) => ({ ...state, ...update })
  );

  // Toggle todo completion
  async function toggleTodo() {
    // Optimistically update the UI
    updateOptimisticTodo({ completed: !todo.completed });
    
    try {
      // Perform the actual update
      await updateTodo(todo.id, { completed: !todo.completed });
    } catch (error) {
      console.error('Error updating todo:', error);
      // useOptimistic automatically reverts to the original state when the promise is rejected
      throw error; // Re-throw to trigger the automatic reversion
    }
  }

  // Delete todo
  async function deleteTodoItem() {
    try {
      await deleteTodo(todo.id);
      // We'll need to refresh the todo list after deletion
      // This would typically be handled by state management in the parent component
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  }

  return (
    <li className={`flex items-center p-3 rounded-lg ${optimisticTodo.completed ? 'bg-green-50' : 'bg-white'} border border-gray-200`}>
      <button 
        onClick={toggleTodo}
        className={`w-6 h-6 mr-3 rounded-full border flex items-center justify-center ${
          optimisticTodo.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
        }`}
      >
        {optimisticTodo.completed && <CheckIcon className="w-4 h-4" />}
      </button>
      
      <div className="flex-grow">
        <div className={`${optimisticTodo.completed ? 'line-through text-gray-500' : ''}`}>
          {optimisticTodo.title}
        </div>
        
        <div className="flex mt-1 space-x-2 text-xs">
          {category && (
            <span 
              className="px-2 py-0.5 rounded-full" 
              style={{ 
                backgroundColor: `${category.color}20`, 
                color: category.color,
                border: `1px solid ${category.color}`
              }}
            >
              {category.name}
            </span>
          )}
          
          {priority && (
            <span 
              className={`px-2 py-0.5 rounded-full ${
                priority.name === 'high' 
                  ? 'bg-red-100 text-red-800 border border-red-200' 
                  : priority.name === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              {priority.name}
            </span>
          )}
        </div>
      </div>
      
      <button 
        onClick={deleteTodoItem}
        className="p-1 text-gray-500 hover:text-red-500"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </li>
  );
} 