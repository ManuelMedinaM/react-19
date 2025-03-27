import { useFormStatus } from 'react-dom';
import { use, useActionState } from 'react';
import { addTodo, fetchCategories, fetchPriorities } from '../../server/api';

// Create promises outside of the component to prevent re-creation during render
// This avoids the infinite suspension cycle
const categoriesPromise = fetchCategories();
const prioritiesPromise = fetchPriorities();

// Submit button component that shows loading state
function SubmitButton() {
  // Using React 19's useFormStatus hook to access form submission state
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`px-4 py-2 text-white rounded-lg transition-all duration-200 ${
        pending ? 'bg-indigo-400 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
      }`}
    >
      {pending ? 'Adding...' : 'Add Todo'}
    </button>
  );
}

export default function AddTodo() {
  // Using the 'use' API to read the promises
  const categories = use(categoriesPromise);
  const priorities = use(prioritiesPromise);
  
  // The action to handle form submission
  async function handleAddTodo(previousState, formData) {
    // Using the correct signature for useActionState (previousState, formData)
    const title = formData.get('title');
    if (!title || title.trim() === '') {
      return { error: 'Title cannot be empty' };
    }
    
    const newTodo = {
      title: title.trim(),
      completed: false,
      category: formData.get('category') || 'react19',
      priority: formData.get('priority') || 'medium'
    };
    
    try {
      // Añadir retraso deliberado para mejor visualización del estado pendiente
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await addTodo(newTodo);
      // Form will reset automatically for uncontrolled inputs when action succeeds
      return { success: true, error: null };
    } catch (error) {
      console.error('Error adding todo:', error);
      return { error: 'Failed to add todo', success: false };
    }
  }
  
  // Using the new useActionState hook to manage form state
  // According to React 19 docs, the correct order is [state, dispatch, isPending]
  const [formState, submitAction, isPending] = useActionState(handleAddTodo, null);
  
  return (
    <form action={submitAction} className="flex flex-col gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          placeholder="Add a new todo..."
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {formState?.error && (
          <p className="mt-1 text-sm text-red-500">{formState.error}</p>
        )}
        {formState?.success && (
          <p className="mt-1 text-sm text-green-500">Todo added successfully!</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select 
            id="category" 
            name="category"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            defaultValue="react19"
          >
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select 
            id="priority" 
            name="priority"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            defaultValue="medium"
          >
            {priorities.map(priority => (
              <option key={priority.id} value={priority.name}>
                {priority.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-end mt-2">
        <SubmitButton />
      </div>
      
      {isPending && (
        <div className="mt-2 text-sm text-indigo-500 animate-pulse">
          Processing your request... Please wait
        </div>
      )}
    </form>
  );
} 