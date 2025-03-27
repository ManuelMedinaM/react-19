import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';

// Submit button component with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="px-4 py-2 text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 shadow-md transition-all duration-200"
    >
      {pending ? 'Updating...' : 'Update Name'}
    </button>
  );
}

/**
 * NameChange - Ejemplo de uso correcto de useActionState
 * 
 * Demuestra el patrón correcto de uso según la documentación oficial:
 * const [state, action, isPending] = useActionState(handler, initialState)
 */
export default function NameChange({ currentName = '', onSuccess = () => {} }) {
  const [shouldFail, setShouldFail] = useState(false);
  
  // Mock function to simulate an API call
  const updateName = async (name) => {
    // Simulate API delay - increased for better visibility
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate forced failure when toggle is enabled
    if (shouldFail) {
      throw new Error('Network error: Failed to connect to server');
    }
    
    // Simulate API response (success or error based on input)
    if (!name || name.length < 3) {
      return { success: false, message: 'Name must be at least 3 characters' };
    }
    
    return { success: true, name };
  };

  // Action handler with proper signature (previousState, formData)
  async function handleUpdateName(previousState, formData) {
    const newName = formData.get('name');
    
    try {
      const result = await updateName(newName);
      
      if (!result.success) {
        return { error: result.message };
      }
      
      // Call success callback
      onSuccess(result.name);
      
      // Return success state
      return { success: true, name: result.name };
    } catch (error) {
      console.error('Error updating name:', error);
      return { error: error.message || 'Failed to update name. Please try again.' };
    }
  }
  
  // Correct order of returned values: [state, action, isPending]
  const [formState, submitAction, isPending] = useActionState(handleUpdateName, null);
  
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-lg font-medium mb-3">Update Name Example</h2>
      
      <div className="mb-4">
        <div className="flex items-center">
          <label htmlFor="shouldFail" className="mr-2 text-sm text-gray-700">
            Simulate failure:
          </label>
          <button
            type="button"
            onClick={() => setShouldFail(!shouldFail)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              shouldFail ? 'bg-red-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                shouldFail ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="ml-2 text-xs text-gray-500">
            {shouldFail ? 'ON (Request will fail)' : 'OFF (Request will succeed)'}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Toggle this to simulate a network failure and test error handling.
        </p>
      </div>
      
      <form action={submitAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            New Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={currentName}
            placeholder="Enter new name..."
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          
          {formState?.error && (
            <p className="mt-1 text-sm text-red-500">{formState.error}</p>
          )}
          
          {formState?.success && (
            <p className="mt-1 text-sm text-green-500">Name updated successfully!</p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-indigo-500">
            {isPending && <span className="animate-pulse">Processing request...</span>}
          </div>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
} 