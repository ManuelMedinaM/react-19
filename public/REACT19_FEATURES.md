# Características de React 19 utilizadas en la aplicación

Este proyecto demuestra las nuevas características y mejoras de React 19, implementadas en una aplicación práctica de lista de tareas (Todo App).

## 1. `use`: El nuevo hook para recursos asíncronos

En lugar de `useEffect` para cargar datos, React 19 introduce el hook `use` que funciona con Promises y otros recursos.

**Implementación:** [Documentation.jsx](/src/components/Documentation.jsx)
- Carga markdown de forma segura usando el hook `use` con promesas.
- No necesita manejador de errores adicional (los errores suben en el árbol).

```jsx
// En Documentation.jsx
const readmePromise = fetch('/README.md').then(res => res.text());

function MarkdownContent() {
  // use() acepta una promesa y espera a que se resuelva
  const markdownText = use(readmePromise);
  return <div>{markdownText}</div>;
}
```

## 2. Mejoras en actualizaciones optimistas con `useOptimistic`

**Implementación:** [TodoItem.jsx](/src/components/TodoItem.jsx)
- Utiliza `useOptimistic` y `useTransition` para mejorar la experiencia del usuario.
- Muestra el estado actualizado inmediatamente, incluso antes de que la API responda.

**Aspectos importantes:**
- El orden es crucial: primero la actualización optimista, luego la operación asíncrona.
- La actualización optimista debe ser inmediata para que el usuario vea el cambio sin esperar.
- `useTransition` se utiliza para gestionar el estado pendiente (isPending).
- useOptimistic revierte automáticamente al estado original cuando finaliza la transición, independientemente del resultado:
  - No es necesario propagar el error para que revierta al estado original.
  - La reversión al estado original ocurre automáticamente si la transición termina sin actualizar permanentemente el estado.
  - El manejo de errores es independiente de la reversión automática del estado optimista.

```jsx
// En TodoItem.jsx - Manejo correcto de errores con useOptimistic
const [optimisticTodo, setOptimisticTodo] = useOptimistic(
  todo,
  (currentTodo, newValues) => ({ ...currentTodo, ...newValues })
);

async function toggleTodo() {
  setErrorMessage(null);
  
  startTransition(async () => {
    try {
      // 1. Aplicar la actualización optimista inmediatamente
      setOptimisticTodo({ completed: !todo.completed });
      
      // 2. Realizar la actualización real en el servidor
      await updateTodo(todo.id, { completed: !todo.completed });
      
      // 3. Refrescar la lista
      todos.refresh();
    } catch (error) {
      // 4. Mostrar el error al usuario
      console.error('Error updating todo:', error);
      setErrorMessage(error.message);
      
      // No es necesario hacer nada especial aquí
      // useOptimistic revierte automáticamente al completarse la transición
    }
  });
}
```

## 3. Integraciones en React DOM para Formularios

**Implementación:** [AddTodo.jsx](/src/components/AddTodo.jsx)
- Utiliza `action` y `formAction` para manejar la presentación del formulario.
- Soporte para funciones en props action y formAction.

```jsx
// En AddTodo.jsx
export default function AddTodo() {
  // Utilizamos el hook useFormStatus para mostrar el estado pendiente
  const { pending } = useFormStatus();
  
  // Función que se ejecuta al enviar el formulario
  const handleSubmit = async (formData) => {
    // Lógica para añadir el todo
    const title = formData.get('title');
    await addTodo({ title, completed: false });
  };
  
  return (
    <form action={handleSubmit} className="...">
      <input name="title" required />
      <button type="submit" disabled={pending}>
        {pending ? 'Añadiendo...' : 'Añadir Tarea'}
      </button>
    </form>
  );
}
```

## 4. `useFormStatus`: Información sobre el estado del formulario

**Implementación:** [AddTodo.jsx](/src/components/AddTodo.jsx)
- Lee el estado del formulario (pendiente, error, etc.)
- Permite crear una mejor experiencia de usuario al mostrar estados de carga.

```jsx
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending}>
      {pending ? 'Añadiendo...' : 'Añadir Tarea'}
    </button>
  );
}
```

## 5. `Suspense` para carga asíncrona de componentes

**Implementación:** [App.jsx](/src/components/App.jsx)
- Envuelve componentes que pueden tardar en cargar.
- Muestra un fallback mientras el componente carga.

```jsx
// En App.jsx
<Suspense fallback={<div className="loading-skeleton">Cargando...</div>}>
  <TodoList />
</Suspense>
```

## 6. Actions y Server Functions

**Implementación:** [AddTodo.jsx](/src/components/AddTodo.jsx)
- Usa el atributo `action` en formularios para manejar envíos.
- Integra perfectamente con transiciones y estado optimista.

## 7. `useTransition`: Priorización de actualizaciones

**Implementación:** [TodoItem.jsx](/src/components/TodoItem.jsx) y [TodoList.jsx](/src/components/TodoList.jsx)
- Previene bloqueos de la interfaz en actualizaciones costosas.
- Permite mostrar un estado "pendiente" mientras se realiza la operación.

```jsx
// En TodoItem.jsx
const [isPending, startTransition] = useTransition();

const deleteTodoItem = () => {
  startTransition(async () => {
    await deleteTodo(todo.id);
    // La interfaz sigue siendo responsiva mientras se elimina
  });
};
```

## 8. Mejoras en referencias con `useRef`

**Implementación:** [RefExample.jsx](/src/components/RefExample.jsx)
- Mejora en el manejo de referencias a elementos del DOM.
- Funciones de limpieza (cleanup) en callbacks de ref.

```jsx
// En RefExample.jsx
function RefExample() {
  const videoRef = useRef(null);
  
  return (
    <video 
      ref={(node) => {
        videoRef.current = node;
        // Las funciones de limpieza ahora se manejan mejor
        return () => {
          if (videoRef.current) {
            videoRef.current.pause();
          }
        };
      }} 
    />
  );
}
```

## 9. Soporte nativo para metadatos de documento

**Implementación:** [App.jsx](/src/components/App.jsx)
- Soporte mejorado para manejo de etiquetas `<title>`, `<meta>` y `<link>`.

```jsx
<title>React 19 Todo Demo</title>
<meta name="description" content="Demostración de características de React 19" />
```

## 10. Integración avanzada de hojas de estilo (stylesheets)

**Implementación:** En toda la aplicación
- Mejor manejo de estilos CSS.
- Optimizaciones automáticas para carga de estilos.

## 11. Funciones de limpieza (cleanup) en callbacks de ref

**Implementación:** [RefExample.jsx](/src/components/RefExample.jsx)
- Permite limpiar recursos cuando un componente se desmonta o la ref cambia.

## 12. Mecanismo de Refresco Eficiente con React 19 usando Custom Hooks

**Implementación:** [TodoContext.jsx](/src/components/TodoContext.jsx), [TodoList.jsx](/src/components/TodoList.jsx), [TodoItem.jsx](/src/components/TodoItem.jsx), [AddTodo.jsx](/src/components/AddTodo.jsx), [useTodos.js](/src/hooks/useTodos.js)
- Utiliza un hook personalizado `useTodos` para centralizar la lógica de gestión de tareas.
- Separa inteligentemente datos estáticos (categorías y prioridades) de datos dinámicos (tareas).
- Expone una API clara y coherente para manipular los todos.
- Sigue el patrón recomendado de React 19 para usar promesas con `use()`.
- Aprovecha las optimizaciones automáticas de React 19 para funciones.
- Maneja el filtrado de manera eficiente en el contexto, evitando filtrados redundantes en componentes.

```jsx
// En useTodos.js - Hook personalizado para todos sin useMemo
/**
 * Hook personalizado para gestionar los todos
 */
export function useTodos() {
  const [todosPromise, setTodosPromise] = useState(() => fetchTodos());
  
  // React 19 mantiene la estabilidad de las funciones automáticamente
  // cuando se crean durante el renderizado
  const todosAPI = {
    // La promesa actual de todos
    todosPromise,
    
    // Función para refrescar los todos
    refresh: () => {
      setTodosPromise(fetchTodos());
    },
    
    // Función para filtrar todos
    filterBy: (filterType) => {
      setTodosPromise(fetchTodos({ completed: filterType === 'completed' }));
    }
  };

  return todosAPI;
}

// En TodoContext.jsx - Context provider con filtrado centralizado
export function TodoProvider({ children }) {
  const [filter, setFilter] = useState('all');
  // Usamos el hook personalizado
  const todos = useTodos();
  
  // Sincronizamos el filtro con la API de todos
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

// En TodoList.jsx - Consumir datos ya filtrados
function TodoList() {
  const { todos, categoriesPromise, prioritiesPromise } = useTodoContext();
  
  // Los datos ya vienen filtrados del contexto
  const todoItems = use(todos.todosPromise);
  const categories = use(categoriesPromise);
  const priorities = use(prioritiesPromise);
  
  // No es necesario filtrar de nuevo en el componente
}
```

**Aspectos importantes:**
- La lógica de los todos está centralizada en el hook `useTodos`, siguiendo el principio de responsabilidad única.
- El hook expone una API clara con métodos como `refresh()` y `filterBy()` para interactuar con los todos.
- Los componentes no necesitan conocer los detalles de implementación, solo usan los métodos expuestos.
- El hook `useTodoContext()` simplifica el acceso al contexto en cualquier componente.
- Los datos estáticos (categorías y prioridades) siguen cargándose una sola vez.
- React 19 optimiza automáticamente la estabilidad de las funciones creadas durante el renderizado, reduciendo la necesidad de usar `useMemo` en muchos casos.
- Este patrón combina lo mejor de React 19 (hook `use` con promesas) y los patrones clásicos de React (custom hooks).

## 13. Optimizaciones Automáticas de Funciones en React 19

**Implementación:** [useTodos.js](/src/hooks/useTodos.js)
- React 19 mejora la estabilidad de las funciones creadas durante el renderizado.
- Reduce considerablemente la necesidad de `useMemo` y `useCallback` en muchos casos.
- Las funciones se mantienen estables automáticamente cuando los parámetros no cambian entre renderizados.

```jsx
// En React 18 (necesitaba useMemo)
function MyComponent() {
  const [count, setCount] = useState(0);
  
  // Sin useMemo, handleClick se recrearía en cada renderizado
  const callbacks = useMemo(() => ({
    handleClick: () => {
      console.log('Clicked!');
      setCount(c => c + 1);
    }
  }), []);
  
  return <Button onClick={callbacks.handleClick} />;
}

// En React 19 (no necesita useMemo para este caso)
function MyComponent() {
  const [count, setCount] = useState(0);
  
  // La función mantiene su estabilidad automáticamente
  const callbacks = {
    handleClick: () => {
      console.log('Clicked!');
      setCount(c => c + 1);
    }
  };
  
  return <Button onClick={callbacks.handleClick} />;
}
```

**Cuándo seguir usando useMemo/useCallback en React 19:**
- Cuando necesites memoizar valores computados costosos basados en props o estado.
- En componentes que renderizan grandes listas o tienen operaciones intensivas.
- Cuando necesites garantizar la identidad de referencia para optimizaciones específicas.
- En integraciones con librerías externas que dependen de la estabilidad de referencia.

**Cuándo puedes prescindir de useMemo/useCallback:**
- Para objetos simples de configuración o API como en nuestro caso `useTodos`.
- Para manejadores de eventos que no dependan de props o estado que cambie frecuentemente.
- En componentes que no necesitan optimizaciones adicionales de rendimiento.
- Cuando el costo de la memoización es mayor que el beneficio (para funciones simples).

Esta optimización automática hace que el código sea más limpio y fácil de mantener, al tiempo que mejora el rendimiento sin esfuerzo adicional por parte del desarrollador.

## 14. Prevención de Parpadeos con `useDeferredValue`

**Implementación:** [TodoList.jsx](/src/components/TodoList.jsx), [useTodos.js](/src/hooks/useTodos.js)
- Utiliza `useDeferredValue` para mantener una versión previa de los datos mientras se cargan los nuevos.
- Proporciona una transición visual suave con indicadores de actualización.
- Compara el valor diferido con el actual para mostrar estados de carga.

```jsx
// En TodoList.jsx
function TodoList() {
  const { todos, categoriesPromise, prioritiesPromise } = useTodoContext();
  
  // Cargar los datos con use()
  const todoItems = use(todos.todosPromise);
  
  // Mantener una versión diferida para actualizaciones suaves
  const deferredTodoItems = useDeferredValue(todoItems);
  
  // Detectar si hay una actualización en progreso
  const isUpdating = deferredTodoItems !== todoItems;
  
  return (
    <div className={isUpdating ? "opacity-80 transition-opacity" : ""}>
      {isUpdating && <div className="indicator">Actualizando...</div>}
      
      <ul>
        {/* Renderizar usando deferredTodoItems para prevenir parpadeos */}
        {deferredTodoItems.map(todo => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </div>
  );
}
```

**¿Por qué es mejor en React 19?**
- React 19 optimiza el manejo de `useDeferredValue`, permitiendo transiciones más fluidas.
- La detección de si hay una diferencia entre la versión actual y la diferida permite interfaces más reactivas.
- Trabaja perfectamente con Suspense y actualizaciones optimistas.

## 15. Optimización de Actualizaciones con `startTransition` en Hooks Personalizados

**Implementación:** [useTodos.js](/src/hooks/useTodos.js)
- Integra `useTransition` dentro de un hook personalizado para mejorar todas las operaciones de actualización.
- Evita que Suspense se active durante actualizaciones pequeñas.
- Proporciona información sobre el estado pendiente a través del hook.

```jsx
// En useTodos.js
export function useTodos() {
  const [todosPromise, setTodosPromise] = useState(() => fetchTodos());
  const [isPending, startTransition] = useTransition();
  
  const todosAPI = {
    todosPromise,
    isPending, // Exponemos el estado de pendiente
    
    refresh: () => {
      // Usamos startTransition para actualizaciones suaves
      startTransition(() => {
        setTodosPromise(fetchTodos());
      });
    },
    
    filterBy: (filterType) => {
      startTransition(() => {
        setTodosPromise(fetchTodos({ completed: filterType === 'completed' }));
      });
    }
  };

  return todosAPI;
}
```

**Mejoras en React 19:**
- React 19 prioriza automáticamente las actualizaciones dentro de transiciones, mejorando la experiencia de usuario.
- Las transiciones permiten mantener la UI interactiva mientras ocurren operaciones costosas.
- La integración de transiciones dentro de un hook personalizado proporciona un patrón reutilizable para toda la aplicación.

## 16. Control Avanzado de Suspense para Evitar Parpadeos Innecesarios

**Implementación:** [App.jsx](/src/App.jsx)
- Utiliza la nueva propiedad `unstable_avoidThisFallback` para evitar que Suspense muestre su fallback durante actualizaciones.
- Permite suspensiones iniciales pero previene suspensiones innecesarias durante actualizaciones.
- Complementa el uso de `useTransition` y `useDeferredValue` para una experiencia perfecta.

```jsx
// En App.jsx
<Suspense 
  fallback={<LoadingFallback />} 
  unstable_avoidThisFallback={true} // Nueva propiedad en React 19
>
  <TodoList />
</Suspense>
```

**Funcionalidad específica de React 19:**
- La propiedad `unstable_avoidThisFallback` es parte de las nuevas API de React 19 para un control más granular de Suspense.
- Permite que los componentes suspendan durante la carga inicial, pero evita mostrar fallbacks para suspensiones posteriores.
- Trabaja en conjunto con `useTransition` para proporcionar una experiencia de carga más intuitiva.
- Su comportamiento es inteligente: mantiene el contenido actual visible mientras los nuevos datos se cargan en segundo plano.

## 17. Mejoras en Manejo de Datos en Formularios con `useActionState`

**Implementación:** [AddTodo.jsx](/src/components/AddTodo.jsx)
- Utiliza `useActionState` para gestionar el estado del formulario y las operaciones asíncronas.
- Devuelve datos enriquecidos (incluido el todo creado) después de operaciones exitosas.
- Integra con transiciones para actualizaciones suaves del estado.

```jsx
// En AddTodo.jsx
async function handleAddTodo(previousState, formData) {
  // Extraer y validar datos
  const title = formData.get('title');
  if (!title || title.trim() === '') {
    return { error: 'Title cannot be empty' };
  }
  
  try {
    // Añadir el todo en el servidor
    const addedTodo = await addTodo(newTodo);
    
    // Actualizar la lista
    todos.refresh();
    
    // Devolver el todo creado junto con el estado de éxito
    // Esto permite acceder al todo recién creado si se necesita
    return { success: true, error: null, todo: addedTodo };
  } catch (error) {
    return { error: 'Failed to add todo', success: false };
  }
}

// Uso del hook con la función de acción
const [formState, submitAction, isPending] = useActionState(handleAddTodo, null);
```

**Ventajas en React 19:**
- `useActionState` en React 19 proporciona una experiencia más completa para operaciones asíncronas.
- Permite devolver datos estructurados (como el todo creado) que pueden usarse para actualizaciones optimistas.
- Se integra perfectamente con el nuevo sistema de acciones en formularios de React 19.
- Trabaja en conjunto con `useTransition` para operaciones asíncronas de mayor rendimiento.

## ¿Cómo probar estas características?

1. Navega por la aplicación y prueba las diferentes funcionalidades.
2. Observa cómo los cambios en las tareas se reflejan inmediatamente (gracias a useOptimistic).
3. Prueba a desconectar la red y ver cómo se comporta la aplicación con manejo de errores.
4. Examina el código fuente para ver las implementaciones específicas.

## Recursos adicionales

- [Documentación oficial de React 19](https://react.dev)
- [Guía de migración a React 19](https://react.dev/blog/2023/03/16/introducing-react-19)
- [Ejemplo completo de useOptimistic](https://react.dev/reference/react/useOptimistic) 