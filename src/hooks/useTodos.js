import { useState, useTransition } from 'react';
import { fetchTodos } from '../../server/api';

/**
 * Hook personalizado para gestionar los todos
 * 
 * Centraliza toda la lógica relacionada con la carga, filtrado y actualización de todos
 * Sigue el patrón recomendado de React 19 para el uso de promesas y el hook use()
 */
export function useTodos() {
  const [todosPromise, setTodosPromise] = useState(() => fetchTodos());
  const [isPending, startTransition] = useTransition();
  
  // En React 19, las funciones creadas durante el renderizado se mantienen estables
  // automáticamente sin necesidad de useMemo cuando los parámetros no cambian
  // entre renderizados. Esto es parte de las optimizaciones automáticas de React 19.
  const todosAPI = {
    // La promesa actual de todos
    todosPromise,
    
    // Estado de pendiente durante actualizaciones
    isPending,
    
    // Función para refrescar los todos (obtener datos actualizados)
    refresh: () => {
      // Usamos startTransition para mejorar la experiencia de usuario
      // durante las actualizaciones, evitando que el Suspense muestre
      // su fallback para actualizaciones pequeñas
      startTransition(() => {
        setTodosPromise(fetchTodos());
      });
    },
    
    // Función para obtener todos filtrados por un criterio (ej: completadas)
    filterBy: (filterType) => {
      // También usamos startTransition para los filtros
      startTransition(() => {
        setTodosPromise(fetchTodos({ completed: filterType === 'completed' }));
      });
    }
  };

  return todosAPI;
}

export default useTodos; 