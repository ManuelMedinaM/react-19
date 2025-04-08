# React 19 Demo - Todo App

Este proyecto es una demostración de las nuevas características de React 19, implementadas en una aplicación de lista de tareas (Todo).

## Características de React 19

Esta aplicación demuestra varias características nuevas de React 19:

- **Hook `use`**: Para consumir promesas directamente en el renderizado
- **Suspense para datos**: Manejo declarativo de estados de carga con prevención de parpadeos
- **Nueva API de Context**: Sintaxis simplificada para proveedores de contexto con separación de datos estáticos/dinámicos
- **useOptimistic**: Actualizaciones optimistas de UI con manejo automático de reversión
- **useFormStatus**: Acceso al estado del formulario desde cualquier componente hijo
- **Acciones de formulario**: Manejo declarativo de envíos de formulario
- **useTransition**: Priorización de actualizaciones para mantener la UI interactiva
- **useDeferredValue**: Prevención de parpadeos durante actualizaciones asíncronas
- **Hooks personalizados optimizados**: Centralización de lógica con `useTodos` y `useTodoContext`
- **Control granular de Suspense**: Con la propiedad `unstable_avoidThisFallback`
- **Gestión avanzada de promesas**: Separación de datos estáticos y dinámicos para actualizaciones eficientes

Para más detalles sobre la implementación de estas características, consulta [REACT19_FEATURES.md](REACT19_FEATURES.md).

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar el servidor JSON (en una terminal)
npm run server

# Iniciar la aplicación React (en otra terminal)
npm run dev
```

Una vez iniciado el servidor, puedes acceder a:
- **Aplicación React**: http://localhost:5173
- **Documentación web**: http://localhost:3001/docs
- **API JSON**: http://localhost:3001

## Servidor API de Pruebas

La aplicación utiliza un servidor JSON personalizado para simular un backend:

- **API Base**: `http://localhost:3001`
- **Características**:
  - Retraso simulado (300ms) para probar estados de carga
  - Endpoints personalizados para filtrar tareas
  - Rutas para estadísticas y datos relacionados

### Endpoints Disponibles

| Endpoint | Descripción |
|----------|-------------|
| `/todos` | Lista completa de tareas |
| `/todos/active` | Solo tareas activas |
| `/todos/completed` | Solo tareas completadas |
| `/categories` | Categorías disponibles |
| `/priorities` | Niveles de prioridad |
| `/stats` | Estadísticas de las tareas |

## Características de React 19 Implementadas

### 1. Contexto Reactivo y Refresco Eficiente con la Nueva API de Context

**Implementación:** [TodoContext.jsx](./src/components/TodoContext.jsx), [useTodos.js](./src/hooks/useTodos.js)
- Aprovecha la nueva API de Context en React 19 para una implementación más limpia y eficiente
- Separa datos estáticos (categorías y prioridades) de datos dinámicos (todos) para optimizar las actualizaciones
- Crea promesas estables que se pueden pasar a componentes de forma segura

```jsx
// En TodoContext.jsx
// 1. Promesas estáticas que se crean una sola vez
const categoriesPromise = fetchCategories();
const prioritiesPromise = fetchPriorities();

// 2. Creación del contexto con la nueva sintaxis simplificada de React 19
export const TodoContext = createContext(null);

// 3. Hook personalizado para acceder al contexto
export function useTodoContext() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodoContext debe usarse dentro de un TodoProvider');
  }
  return context;
}

// 4. Provider con separación clara de datos estáticos y dinámicos
export function TodoProvider({ children }) {
  const [filter, setFilter] = useState('all');
  
  // Usamos el hook personalizado para los datos dinámicos (todos)
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
  
  // Valor del contexto con separación clara de responsabilidades
  const contextValue = {
    // Datos estáticos (se cargan una sola vez)
    categoriesPromise,
    prioritiesPromise,
    
    // Estado del filtro
    filter,
    setFilter: handleFilterChange,
    
    // API para los todos (datos dinámicos)
    todos
  };
  
  // Uso de la nueva sintaxis de Context en React 19
  return <TodoContext value={contextValue}>{children}</TodoContext>;
}
```

**Ventajas de este enfoque:**
- **Eficiencia**: Las categorías y prioridades se cargan una sola vez, no se recrean en cada renderizado
- **Claridad conceptual**: Separación clara entre datos estáticos y dinámicos
- **Actualizaciones precisas**: Solo refresca los datos que cambian con frecuencia (todos)
- **Menor sobrecarga**: Evita recrear promesas innecesariamente
- **Mejor experiencia de desarrollo**: La nueva sintaxis de Context es más concisa y fácil de entender
- **Integración perfecta con la API `use()`**: Los componentes pueden leer directamente los valores de las promesas

### 2. Lectura Directa de Promesas en Componentes con `use()`

**Implementación:** [TodoList.jsx](./src/components/TodoList.jsx), [TodoItem.jsx](./src/components/TodoItem.jsx)
- Lee valores directamente de promesas usando el hook `use()`
- Mejora la legibilidad del código al eliminar la necesidad de useEffect/useState para datos
- Suspende automáticamente el componente durante la carga inicial

```jsx
// En TodoList.jsx
export default function TodoList() {
  // 1. Obtener el contexto
  const { todos, categoriesPromise, prioritiesPromise } = useTodoContext();
  
  // 2. Leer valores directamente de las promesas
  const todoItems = use(todos.todosPromise);
  const categories = use(categoriesPromise);
  const priorities = use(prioritiesPromise);
  
  // 3. Usar useDeferredValue para prevenir parpadeos
  const deferredTodoItems = useDeferredValue(todoItems);
  
  // 4. El resto del componente trabaja con datos ya disponibles
  // No hay "isLoading", useEffect, o lógica de carga adicional
  
  return (
    <div>
      {/* Renderizado con datos ya extraídos de las promesas */}
      {deferredTodoItems.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
}
```

**Beneficios de la lectura directa con `use()`:**
- **Código declarativo**: Expresa claramente la intención de "usar este dato asíncrono"
- **Menos estado local**: No necesitas useState para almacenar datos asíncronos
- **Manejo automático de carga**: El componente se suspende automáticamente durante la carga
- **Menos código boilerplate**: Elimina patrones repetitivos de carga de datos
- **Mejor experiencia de desarrollo**: Código más limpio y fácil de mantener

### 3. Hooks Personalizados y API Centralizada para Todos

**Implementación:** [TodoContext.jsx](./src/components/TodoContext.jsx), [TodoList.jsx](./src/components/TodoList.jsx), [TodoItem.jsx](./src/components/TodoItem.jsx), [useTodos.js](./src/hooks/useTodos.js)
- Utiliza el nuevo Context API de React 19 con un hook personalizado `useTodos`
- Centraliza toda la lógica relacionada con los todos en un único lugar
- Expone una API clara con métodos como `refresh()` y `filterBy()`
- Combina las mejores prácticas de React 19 con patrones de diseño establecidos
- Aprovecha las optimizaciones automáticas de funciones en React 19
- Implementa un manejo robusto de errores que evita que los fallos rompan la UI

**Implementación del Custom Hook:**
```jsx
// 1. Hook personalizado para centralizar la lógica de los todos
export function useTodos() {
  const [todosPromise, setTodosPromise] = useState(() => fetchTodos());
  
  // React 19 mantiene la estabilidad de las funciones automáticamente
  // No es necesario usar useMemo para este caso
  const todosAPI = {
    // Promesa actual de todos
    todosPromise,
    
    // Función para refrescar los datos
    refresh: () => {
      setTodosPromise(fetchTodos());
    },
    
    // Función para filtrar los todos
    filterBy: (filterType) => {
      setTodosPromise(fetchTodos({ completed: filterType === 'completed' }));
    }
  };

  return todosAPI;
}

// 2. Provider con filtrado centralizado
export function TodoProvider({ children }) {
  const [filter, setFilter] = useState('all');
  const todos = useTodos();
  
  // Sincronizamos el filtro con los todos
  // El filtrado ocurre aquí, no en los componentes hijos
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter !== 'all') {
      todos.filterBy(newFilter);
    } else {
      todos.refresh();
    }
  };
  
  return <TodoContext value={{ filter, setFilter: handleFilterChange, todos, ... }}>{children}</TodoContext>;
}

// 3. Manejo robusto de errores en componentes
function TodoItem() {
  // Manejo correcto de errores con optimistic updates
  async function toggleTodo() {
    startTransition(async () => {
      try {
        setOptimisticTodo({ completed: !todo.completed });
        await updateTodo(todo.id, { completed: !todo.completed });
        todos.refresh();
      } catch (error) {
        // Mostrar el error al usuario
        setErrorMessage(error.message);
        // No es necesario hacer nada especial para la reversión
        // useOptimistic lo hace automáticamente
      }
    });
  }
}
```

**Ventajas de este enfoque:**
- **Separación de responsabilidades**: Toda la lógica de todos está en un solo lugar
- **API declarativa**: Los componentes interactúan con una interfaz clara y predecible
- **Menor acoplamiento**: Los componentes no necesitan conocer los detalles de implementación
- **Testing más fácil**: El hook puede probarse de forma aislada
- **Reutilización**: El hook puede usarse en cualquier parte de la aplicación
- **Mantenibilidad**: Los cambios en la lógica de datos se hacen en un solo lugar
- **Código más limpio**: Aprovecha las optimizaciones automáticas de React 19 para reducir boilerplate
- **Manejo de errores robusto**: Los errores se capturan y gestionan sin romper la UI

### 4. Prevención de Parpadeos con useDeferredValue

**Implementación:** [TodoList.jsx](./src/components/TodoList.jsx)
- Mejora la experiencia de usuario al evitar parpadeos durante actualizaciones asíncronas
- Mantiene visible la versión anterior de los datos mientras se cargan los nuevos
- Detecta actualizaciones en curso comparando valores actuales y diferidos

```jsx
// En TodoList.jsx
import { use, useDeferredValue } from 'react';

export default function TodoList() {
  // Obtener los datos del contexto
  const { todos } = useTodoContext();
  
  // Cargar los datos desde las promesas
  const todoItems = use(todos.todosPromise);
  
  // Usar useDeferredValue para mantener una versión previa durante actualizaciones
  const deferredTodoItems = useDeferredValue(todoItems);
  
  // Detectar si hay una actualización en curso
  const isUpdating = deferredTodoItems !== todoItems;
  
  return (
    <div className={isUpdating ? "opacity-80 transition-opacity" : ""}>
      {isUpdating && <div>Actualizando...</div>}
      
      {/* Renderizar usando la versión diferida */}
      {deferredTodoItems.map(todo => (...))}
    </div>
  );
}
```

**Beneficios:**
- **Transiciones suaves**: Evita mostrar estados de carga o fallbacks de Suspense durante pequeñas actualizaciones
- **Experiencia mejorada**: Los usuarios no ven parpadeos cuando los datos se actualizan
- **Feedback visual**: Muestra sutilmente cuándo se están actualizando los datos sin interrumpir la experiencia

### 5. Optimización de Actualizaciones con useTransition

**Implementación:** [useTodos.js](./src/hooks/useTodos.js)
- Integra `useTransition` dentro de un hook personalizado para mejorar todas las operaciones
- Evita que Suspense se active durante actualizaciones pequeñas
- Proporciona APIs estables y predecibles para la gestión de datos asíncrona

```jsx
// En useTodos.js
export function useTodos() {
  const [todosPromise, setTodosPromise] = useState(() => fetchTodos());
  const [isPending, startTransition] = useTransition();
  
  return {
    todosPromise,
    isPending,
    
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
}
```

**¿Por qué es importante en React 19?**
- React 19 optimiza el uso de `useTransition` para priorizar operaciones de UI
- Permite mantener la interfaz interactiva durante operaciones costosas
- Centraliza la lógica de gestión de transiciones en un hook personalizado
- Se integra perfectamente con Suspense y el sistema de renderizado concurrente

### 6. Control Granular de Suspense para Mejorar la Experiencia de Usuario

**Implementación:** [App.jsx](./src/App.jsx)
- Utiliza la nueva propiedad `unstable_avoidThisFallback` para un control avanzado de Suspense
- Permite suspensiones iniciales pero previene suspensiones durante actualizaciones
- Crea experiencias de carga inteligentes que mantienen la información visible

```jsx
// En App.jsx
<Suspense 
  fallback={<LoadingIndicator />}
  unstable_avoidThisFallback={true} // Nueva propiedad en React 19
>
  <TodoList />
</Suspense>
```

**Características destacadas:**
- **Interacción mejorada**: Evita mostrar indicadores de carga durante pequeñas actualizaciones
- **Experiencia continua**: Mantiene el contenido actual visible mientras el nuevo contenido se carga
- **Prevención de parpadeos**: Impide que la interfaz parpadee entre estados de carga
- **Integración perfecta**: Funciona en conjunto con useTransition y useDeferredValue

### 7. Acciones (Actions) y useActionState

**Implementación:** [AddTodo.jsx](./src/components/AddTodo.jsx)
- Demuestra el uso de acciones para manejar el envío de formularios
- Utiliza funciones asíncronas para gestionar las transiciones y estados de los formularios

**Uso correcto de useActionState:**
```jsx
// Ejemplo de uso correcto de useActionState
import { useActionState } from 'react'; // Importado de react, NO de react-dom

function MyComponent() {
  const [formState, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      try {
        await submitData(formData);
        return { success: true };
      } catch (error) {
        return { error: 'Failed to submit data' };
      }
    },
    null
  );

  return (
    <form action={submitAction}>
      {/* Form elements */}
      <button disabled={isPending}>Submit</button>
      {formState?.error && <p>{formState.error}</p>}
    </form>
  );
}
```

### 8. Manejo Avanzado de Datos con useActionState en Formularios

**Implementación:** [AddTodo.jsx](./src/components/AddTodo.jsx)
- Devuelve datos enriquecidos (incluido el todo creado) después de operaciones exitosas
- Permite el acceso al objeto creado para posibles usos posteriores
- Integra actualizaciones asíncronas con la gestión del estado del formulario

```jsx
// En AddTodo.jsx
async function handleAddTodo(previousState, formData) {
  try {
    const addedTodo = await addTodo(newTodo);
    todos.refresh();
    
    // Devolvemos el todo creado para posibles usos posteriores
    return { 
      success: true, 
      error: null, 
      todo: addedTodo // Objeto creado disponible en formState.todo
    };
  } catch (error) {
    return { error: 'Failed to add todo', success: false };
  }
}
```

**Ventajas:**
- **Estado completo**: Proporciona no solo información de éxito/error sino también los datos creados
- **Mayor flexibilidad**: Permite acceder al objeto creado para operaciones posteriores
- **Optimizaciones futuras**: Facilita implementar actualizaciones optimistas o caché local
- **Experiencia mejorada**: Trabaja con el sistema de transiciones para UIs fluidas

### 9. Actualizaciones Optimistas con useOptimistic

**Implementación:** [TodoItem.jsx](./src/components/TodoItem.jsx)
- Proporciona actualizaciones optimistas de la UI para una mejor experiencia de usuario
- Actualiza inmediatamente el estado en la interfaz y luego sincroniza con el servidor
- Revierte automáticamente al estado original cuando finaliza la transición

**Implementación correcta:**
```jsx
// 1. Definir el estado optimista y el modificador
const [optimisticTodo, setOptimisticTodo] = useOptimistic(
  todo, // Estado original/actual
  (currentTodo, newValues) => ({ ...currentTodo, ...newValues }) // Función de actualización
);

// 2. Función para manejar la acción
async function toggleTodo() {
  // Limpiar errores previos
  setErrorMessage(null);
  
  startTransition(async () => {
    try {
      // Primero, aplicar la actualización optimista inmediatamente
      setOptimisticTodo({ completed: !todo.completed });
      
      // Luego, realizar la operación real (con retraso para demostración)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Opcionalmente, simular un error
      if (simulateError) {
        throw new Error("Error simulado");
      }
      
      // Realizar la actualización real en el backend
      await updateTodo(todo.id, { completed: !todo.completed });
      
      // Si la operación es exitosa, el estado optimista se mantiene
    } catch (error) {
      // Almacenar el error para mostrarlo en la UI
      setErrorMessage(error.message);
      
      // No es necesario hacer nada especial aquí - la reversión es automática
      // cuando finaliza la transición, independientemente del resultado
    }
  });
}
```

### 10. Nueva Sintaxis de Context

**Implementación:** [TodoContext.jsx](./src/components/TodoContext.jsx)
- Usa `<Context>` directamente como proveedor en lugar de `<Context.Provider>`
- Simplifica la API para la creación y uso de contextos

### 11. Arquitectura Completa del Sistema de Todos

Esta aplicación implementa una arquitectura moderna basada en las nuevas características de React 19:

1. **Separación de datos estáticos y dinámicos**:
   - Datos estáticos (categorías, prioridades): Cargados una vez al inicio
   - Datos dinámicos (todos): Refrescados según necesidad

2. **Hook personalizado `useTodos` para gestión centralizada**:
   - Encapsula toda la lógica relacionada con los todos
   - Proporciona una API clara y coherente (refresh, filterBy)
   - Integra useTransition para actualizaciones fluidas

3. **Contexto optimizado con la nueva API**:
   - Usa la sintaxis simplificada de Context en React 19
   - Evita recreaciones innecesarias de promesas
   - Proporciona acceso estructurado a todos los datos necesarios

4. **Componentes que consumen datos de forma declarativa**:
   - Usan `use()` para leer directamente de promesas
   - Implementan actualizaciones optimistas con useOptimistic
   - Aprovechan useDeferredValue para prevenir parpadeos

5. **Manejo robusto de errores**:
   - Captura errores cerca de donde ocurren
   - Proporciona feedback visual claro al usuario
   - Implementa reversiones automáticas con useOptimistic

## Simulación de Entornos Realistas

Para demostrar con mayor claridad los estados y comportamientos de React 19, se han implementado varias técnicas de simulación:

### 1. Retrasos Deliberados
- **AddTodo.jsx**: Retraso de 2 segundos en el envío para ver el estado de carga y pending
- **TodoItem.jsx**: Retraso de 2 segundos en toggleTodo para visualizar la actualización optimista
- **NameChange.jsx**: Retraso de 2 segundos para ver el estado de carga y pending

### 2. Simulación de Errores
- **TodoItem.jsx**: Interruptor para simular errores de red en la actualización y eliminación de tareas
  - Demuestra cómo `useOptimistic` revierte al estado original cuando hay un error
  - Muestra indicadores visuales durante la transición
- **NameChange.jsx**: Interruptor para simular un error de conexión durante la actualización del nombre

### 3. Patrones de implementación correctos
- **Actualización optimista primero**: Aplicar inmediatamente la actualización optimista antes de iniciar la operación asíncrona
- **Gestión de estado con useTransition**: Usar `useTransition` para manejar el estado pendiente
- **Indicadores visuales**: Elementos que muestran claramente cuando una operación está en progreso
- **Mensajes explicativos**: Texto que explica lo que está sucediendo en cada momento

## Soluciones a Problemas Comunes

### Error con useActionState

Según el PR #28491 de React, `useActionState` (anteriormente conocido como `useFormState`) se ha movido del paquete `react-dom` al paquete `react`.

**Problema**: Si intentas importar `useActionState` desde `react-dom`, obtendrás el error:

```jsx
// Error que aparecerá en consola
TypeError: useActionState is not a function or its return value is not iterable
```

**Solución**: Importar correctamente desde el paquete `react`:

```jsx
// ✅ Correcto: Importar desde react
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom'; // useFormStatus sigue en react-dom

// ❌ Incorrecto: Causará error
import { useActionState } from 'react-dom'; // Error
```

### Ciclo de Suspensión Infinita con `use`

Al utilizar la API `use` en componentes cliente, es importante crear las promesas fuera del componente. 

**Problema**: Si se crean promesas dentro del componente durante el renderizado, cuando React suspende el componente debido a una promesa pendiente, al reanudar el renderizado se crearán nuevas promesas, causando un ciclo infinito.

**Solución**: Crear todas las promesas fuera del componente:

```jsx
// ✅ Correcto: Promesas creadas fuera del componente
const dataPromise = fetchData();

function Component() {
  const data = use(dataPromise);
  // ...
}

// ❌ Incorrecto: Causa ciclo de suspensión infinita
function Component() {
  const dataPromise = fetchData(); // Se crea una nueva promesa en cada renderizado
  const data = use(dataPromise);
  // ...
}
```

## Mejoras Visuales
- Se han actualizado los colores a tonos de indigo y violeta para una interfaz más moderna
- Se han añadido transiciones y animaciones para mejorar la experiencia de usuario
- Se ha implementado el efecto "pulse" en elementos que están en estado de carga
- Se han agregado efectos de sombra y transiciones suaves

## Características No Implementadas (Mencionadas para Referencia)

### 1. React Server Components y Server Actions
- Componentes que se ejecutan exclusivamente en el servidor
- Permiten ejecutar código en el servidor sin necesidad de crear un API

### 2. Nuevas APIs Estáticas de React DOM
- `prerender`: Para la generación de HTML estático
- `prerenderToNodeStream`: Para streaming de HTML prerrenderizado
- Mejoras en la generación de HTML estático y manejo de datos

### 3. Otras Mejoras
- `ref` como prop en componentes funcionales
- Mejoras en la visualización de errores de hidratación 
- Funciones de limpieza (cleanup) en callbacks de ref
- Opción `initialValue` en `useDeferredValue`
- Soporte nativo para metadatos de documento (`<title>`, `<meta>`, `<link>`)
- Integración avanzada de hojas de estilo (stylesheets)
- Mejor soporte para scripts asíncronos en componentes

## Estructura del proyecto

A continuación se muestra la estructura de archivos de este proyecto:

```folder-tree
react-19/
├── src/
│   ├── components/
│   │   ├── TodoItem.jsx
│   │   ├── TodoList.jsx
│   │   ├── AddTodo.jsx
│   │   ├── Documentation.jsx
│   │   ├── Documentation.css
│   │   ├── TodoFilter.jsx
│   │   ├── TodoContext.jsx
│   │   ├── NameChange.jsx
│   │   └── RefExample.jsx
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   └── App.css
├── server/
│   ├── api.js
│   └── json-server.js
├── scripts/
│   └── prepare.js
├── index.html
├── vite.config.js
├── package.json
├── README.md
└── REACT19_FEATURES.md
```

## Tecnologías Utilizadas

- React 19
- Tailwind CSS para estilos
- json-server para simular un backend
