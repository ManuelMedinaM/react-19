import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

// Submit button component with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="px-4 py-2 text-white rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300"
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
  // Mock function to simulate an API call
  const updateName = async (name) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
      return { error: 'Failed to update name. Please try again.' };
    }
  }
  
  // Correct order of returned values: [state, action, isPending]
  const [formState, submitAction, isPending] = useActionState(handleUpdateName, null);
  
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <h2 className="text-lg font-medium mb-3">Update Name Example</h2>
      
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
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {formState?.error && (
            <p className="mt-1 text-sm text-red-500">{formState.error}</p>
          )}
          
          {formState?.success && (
            <p className="mt-1 text-sm text-green-500">Name updated successfully!</p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {isPending && "Processing request..."}
          </div>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
} 