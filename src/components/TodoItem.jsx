import { useOptimistic, useState, useTransition } from 'react';
import { CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { updateTodo, deleteTodo } from '../../server/api';
import { useTodoContext } from './TodoContext';

export default function TodoItem({ todo, category, priority }) {
  const { todos } = useTodoContext();
  const [simulateError, setSimulateError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Usar useOptimistic para actualizaciones inmediatas de la UI
  const [optimisticTodo, setOptimisticTodo] = useOptimistic(
    todo,
    (currentTodo, newValues) => ({ ...currentTodo, ...newValues })
  );
  
  // Alternar el estado de completado de la tarea
  async function toggleTodo() {
    // Limpiar mensajes de error previos
    setErrorMessage(null);
    
    startTransition(async () => {
      try {
        // 1. Aplicar la actualización optimista inmediatamente
        // Esto actualiza la UI de forma instantánea
        setOptimisticTodo({ completed: !todo.completed });
        
        // 2. Retraso deliberado para demostración
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 3. Simular error si está activada la opción
        if (simulateError) {
          throw new Error("Network error: Failed to update todo");
        }
        
        // 4. Realizar la actualización real en el servidor
        await updateTodo(todo.id, { completed: !todo.completed });
        
        // 5. Debemos refrescar la lista para que los cambios persistan
        // Nuestro enfoque anterior estaba causando pérdida de sincronización
        todos.refresh();
      } catch (error) {
        console.error('Error updating todo:', error);
        setErrorMessage(error.message);
      }
    });
  }

  // Eliminar tarea
  async function deleteTodoItem() {
    // Limpiar mensajes de error previos
    setErrorMessage(null);
    
    startTransition(async () => {
      try {
        // Retraso deliberado para demostración
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simular error si está activada la opción
        if (simulateError) {
          throw new Error("Failed to delete todo");
        }
        
        // Para eliminaciones sí necesitamos refrescar la lista 
        // porque el item desaparece por completo
        await deleteTodo(todo.id);
        todos.refresh();
      } catch (error) {
        console.error('Error deleting todo:', error);
        setErrorMessage(error.message);
      }
    });
  }

  return (
    <li className={`relative flex flex-col p-3 rounded-lg ${
      optimisticTodo.completed ? 'bg-green-100 border-green-300' : 'bg-white border-gray-200'
    } border shadow-sm transition-all duration-200 ${
      isPending ? 'ring-2 ring-indigo-300' : ''
    }`}>
      {isPending && (
        <div className="absolute top-0 right-0 m-1 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
          {optimisticTodo.completed !== todo.completed ? 'Actualización optimista' : 'Procesando...'}
        </div>
      )}
      
      <div className="flex items-center mb-2">
        <button 
          onClick={toggleTodo}
          disabled={isPending}
          className={`w-6 h-6 mr-3 rounded-full border flex items-center justify-center transition-all duration-200 ${
            optimisticTodo.completed 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'border-indigo-300 hover:border-indigo-500'
          }`}
        >
          {optimisticTodo.completed && <CheckIcon className="w-4 h-4" />}
        </button>
        
        <div className="flex-grow">
          <div className={`${optimisticTodo.completed ? 'line-through text-gray-500' : ''} transition-all duration-200`}>
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
          disabled={isPending}
          className="p-1 text-gray-500 hover:text-red-500 transition-colors duration-200"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
      
      {/* Toggle para simular errores */}
      <div className="flex items-center justify-end mt-1">
        <label className="text-xs text-gray-500 mr-2">Simular error:</label>
        <button
          type="button"
          onClick={() => setSimulateError(!simulateError)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            simulateError ? 'bg-red-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              simulateError ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="ml-1 text-xs text-gray-400">
          {simulateError ? 'ON' : 'OFF'}
        </span>
      </div>
      
      {/* Mostrar mensaje de error si existe */}
      {errorMessage && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-600">
          <span className="font-semibold">Error:</span> {errorMessage}
        </div>
      )}
      
      {/* Explicación del optimistic update */}
      {isPending && (
        <div className="text-xs text-indigo-600 mt-2 italic">
          {optimisticTodo.completed !== todo.completed ? (
            <>
              ⚡ Esta tarea se ha marcado como {optimisticTodo.completed ? 'completada' : 'pendiente'} de forma optimista. 
              La actualización en el servidor tardará 2 segundos.
              {simulateError && ' ⚠️ Como has activado la simulación de errores, la operación fallará y volverá al estado original.'}
            </>
          ) : (
            <>Procesando la operación...</>
          )}
        </div>
      )}
    </li>
  );
} 