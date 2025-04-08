import { use, useDeferredValue } from 'react';
import { useTodoContext } from './TodoContext';
import TodoItem from './TodoItem';

export default function TodoList() {
  // Obtener valores del contexto usando el hook personalizado
  const { categoriesPromise, prioritiesPromise, todos } = useTodoContext();
  
  // Usar las promesas directamente con use()
  // Este enfoque es más simple y directo, confiando en el mecanismo de React
  const todoItems = use(todos.todosPromise);
  const categories = use(categoriesPromise);
  const priorities = use(prioritiesPromise);
  
  // Usar useDeferredValue para prevenir parpadeos durante actualizaciones
  const deferredTodoItems = useDeferredValue(todoItems);
  
  // Mostrar "Actualizando..." si hay diferencias entre la versión
  // diferida y la actual (lo que indica que hay una actualización en curso)
  const isUpdating = deferredTodoItems !== todoItems;
  
  // Crear mapas para búsqueda más fácil
  const categoryMap = Object.fromEntries(
    categories.map(category => [category.name, category])
  );
  
  const priorityMap = Object.fromEntries(
    priorities.map(priority => [priority.name, priority])
  );

  return (
    <div className={isUpdating ? "opacity-80 transition-opacity duration-300" : ""}>
      {isUpdating && (
        <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">
          Actualizando...
        </div>
      )}
      
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-lg font-medium">Todos</h2>
        <span className="px-2 py-1 bg-gray-100 rounded-lg text-sm text-gray-700">
          {deferredTodoItems.length} item{deferredTodoItems.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <ul className="mt-4 space-y-2">
        {deferredTodoItems.map(todo => (
          <TodoItem 
            key={todo.id} 
            todo={todo} 
            category={categoryMap[todo.category]} 
            priority={priorityMap[todo.priority]}
          />
        ))}
        
        {deferredTodoItems.length === 0 && (
          <li className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
            No todos to display
          </li>
        )}
      </ul>
    </div>
  );
} 