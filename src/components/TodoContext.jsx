import { createContext, useState, useContext } from 'react';
import { fetchCategories, fetchPriorities } from '../../server/api';
import useTodos from '../hooks/useTodos';

// Cargar categorías y prioridades una sola vez (datos estáticos)
const categoriesPromise = fetchCategories();
const prioritiesPromise = fetchPriorities();

// Crear el contexto
export const TodoContext = createContext({
  filter: 'all',
  setFilter: () => {},
  categoriesPromise,
  prioritiesPromise,
  todos: {
    todosPromise: null,
    refresh: () => {},
    filterBy: () => {}
  }
});

/**
 * Hook para acceder fácilmente al contexto
 */
export function useTodoContext() {
  return useContext(TodoContext);
}

// Usando la nueva sintaxis de Context de React 19 sin Provider
export function TodoProvider({ children }) {
  const [filter, setFilter] = useState('all');
  const todos = useTodos();
  
  // Efecto para sincronizar el filtro con los todos
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter !== 'all') {
      todos.filterBy(newFilter);
    } else {
      todos.refresh();
    }
  };
  
  return (
    <TodoContext value={{ 
      filter, 
      setFilter: handleFilterChange, 
      categoriesPromise,
      prioritiesPromise,
      todos
    }}>
      {children}
    </TodoContext>
  );
} 