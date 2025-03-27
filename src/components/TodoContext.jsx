import { createContext, useState } from 'react';

// Create the context
export const TodoContext = createContext({
  filter: 'all',
  setFilter: () => {},
});

// Using React 19's new Context syntax without Provider
export function TodoProvider({ children }) {
  const [filter, setFilter] = useState('all');
  
  return (
    <TodoContext value={{ filter, setFilter }}>
      {children}
    </TodoContext>
  );
} 