import { use } from 'react';
import { useTodoContext } from './TodoContext';
import TodoItem from './TodoItem';

export default function TodoList() {
  // Obtener valores del contexto usando el hook personalizado
  const { categoriesPromise, prioritiesPromise, todos } = useTodoContext();
  
  // Usar las promesas directamente con use() siguiendo el patrón recomendado
  const todoItems = use(todos.todosPromise);
  const categories = use(categoriesPromise);
  const priorities = use(prioritiesPromise);
  
  // Ya no necesitamos filtrar aquí - el filtrado ya viene del context
  // via todos.filterBy() cuando se cambia el filtro

  // Crear mapas para búsqueda más fácil
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
          {todoItems.length} item{todoItems.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <ul className="mt-4 space-y-2">
        {todoItems.map(todo => (
          <TodoItem 
            key={todo.id} 
            todo={todo} 
            category={categoryMap[todo.category]} 
            priority={priorityMap[todo.priority]}
          />
        ))}
        
        {todoItems.length === 0 && (
          <li className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
            No todos to display
          </li>
        )}
      </ul>
    </div>
  );
} 