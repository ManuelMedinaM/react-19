import { useState } from 'react';
import { fetchTodos } from '../../server/api';

/**
 * Hook personalizado para gestionar los todos
 * 
 * Centraliza toda la lógica relacionada con la carga, filtrado y actualización de todos
 * Sigue el patrón recomendado de React 19 para el uso de promesas y el hook use()
 */
export function useTodos() {
  const [todosPromise, setTodosPromise] = useState(() => fetchTodos());
  
  // En React 19, las funciones creadas durante el renderizado se mantienen estables
  // automáticamente sin necesidad de useMemo cuando los parámetros no cambian
  // entre renderizados. Esto es parte de las optimizaciones automáticas de React 19.
  const todosAPI = {
    // La promesa actual de todos
    todosPromise,
    
    // Función para refrescar los todos (obtener datos actualizados)
    refresh: () => {
      setTodosPromise(fetchTodos());
    },
    
    // Función para obtener todos filtrados por un criterio (ej: completadas)
    filterBy: (filterType) => {
      // Actualizamos la promesa con la nueva consulta filtrada
      setTodosPromise(fetchTodos({ completed: filterType === 'completed' }));
    }
  };

  return todosAPI;
}

export default useTodos; 