# React 19 Demo - Todo App

Este proyecto es una demostración de las nuevas características de React 19, implementadas en una aplicación de lista de tareas (Todo).

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar el servidor JSON (en una terminal)
npm run server

# Iniciar la aplicación React (en otra terminal)
npm run dev
```

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

### 1. Acciones (Actions)
Las acciones son una nueva forma de manejar estados pendientes, errores y actualizaciones optimistas.

**Implementación:** [AddTodo.jsx](./src/components/AddTodo.jsx)
- Demuestra el uso de acciones para manejar el envío de formularios
- Utiliza funciones asíncronas para gestionar las transiciones y estados de los formularios
- **Nuevo:** Incluye retrasos deliberados (2 segundos) para visualizar mejor los estados pendientes

### 2. Nuevos Hooks y APIs para gestionar Actions

#### 2.1 useActionState
**Implementación:** [AddTodo.jsx](./src/components/AddTodo.jsx), [NameChange.jsx](./src/components/NameChange.jsx)
- Gestiona el estado y errores del formulario automáticamente
- Proporciona acceso al estado de envío del formulario y resultados de las acciones
- Resetea automáticamente el formulario cuando la acción tiene éxito
- **Importante**: Se importa desde 'react' (no desde 'react-dom'): `import { useActionState } from 'react'`
- **Uso correcto**: `const [state, action, isPending] = useActionState(handler, initialState)`
- **Nuevo:** En NameChange.jsx se implementa un interruptor para simular errores de red, demostrando el manejo de errores

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

#### 2.2 useOptimistic
**Implementación:** [TodoItem.jsx](./src/components/TodoItem.jsx)
- Proporciona actualizaciones optimistas de la UI para una mejor experiencia de usuario
- Actualiza inmediatamente el estado en la interfaz y luego sincroniza con el servidor
- Revierte automáticamente al estado original si ocurre un error
- **Nuevo:** Incluye un interruptor para simular errores, permitiendo ver cómo la interfaz revierte a su estado original cuando falla una operación
- **Nuevo:** Implementa un retraso deliberado de 2 segundos para visualizar mejor el efecto de la actualización optimista

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
      
      // Lanzar el error para que useOptimistic revierta automáticamente
      throw error;
    }
  });
}
```

**Aspectos importantes:**
- El orden es crucial: primero la actualización optimista, luego la operación asíncrona
- La actualización optimista debe ser inmediata para que el usuario vea el cambio sin esperar
- `useTransition` se utiliza para gestionar el estado pendiente (isPending)
- Hay dos opciones para manejar errores con useOptimistic:
  1. **Opción 1 - Reversión automática**: Lanzar el error dentro de la transición para que `useOptimistic` revierta automáticamente
  2. **Opción 2 - Reversión manual**: Almacenar el estado original y revertir manualmente sin propagar el error

### 3. Integraciones en React DOM para Formularios

#### 3.1 Soporte para funciones en props action y formAction
**Implementación:** [AddTodo.jsx](./src/components/AddTodo.jsx)
- Utiliza `formAction` para manejar la presentación del formulario
- Gestiona automáticamente el ciclo de vida de envío del formulario

#### 3.2 useFormStatus
**Implementación:** [AddTodo.jsx](./src/components/AddTodo.jsx)
- Lee el estado del formulario (pendiente, error, etc.)
- Permite crear indicadores de carga y manejar estados de formulario

### 4. Nuevo API: use
**Implementación:** [TodoList.jsx](./src/components/TodoList.jsx) y [AddTodo.jsx](./src/components/AddTodo.jsx)
- Lee recursos asíncronos directamente en render
- Proporciona suspense automático durante la carga de datos
- **Importante**: Las promesas se crean fuera del componente para evitar ciclos de suspensión infinita
- Evita el error "async/await is not yet supported in Client Components" al manejar correctamente las promesas

### 5. Nueva Sintaxis de Context
**Implementación:** [TodoContext.jsx](./src/components/TodoContext.jsx)
- Usa `<Context>` directamente como proveedor en lugar de `<Context.Provider>`
- Simplifica la API para la creación y uso de contextos

### 6. Ref en componentes funcionales
**Implementación:** [RefExample.jsx](./src/components/RefExample.jsx)
- Demuestra cómo los componentes funcionales pueden recibir refs a través de forwardRef
- Compara con el enfoque anterior de reenvío de refs

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

### 4. Solución a errores comunes
- **"An optimistic state update occurred outside a transition or action"**: Este error ocurre cuando se actualiza un estado optimista fuera de un contexto de transición. Para solucionarlo, debe usarse `startTransition` o una acción.

- **Opciones para manejar errores con useOptimistic**: 
  1. **Con reversión automática (lanzando error)**: 
     ```jsx
     startTransition(async () => {
       try {
         // Actualización optimista
         setOptimisticItem({ value: newValue });
         
         // Operación real que puede fallar
         await updateItem(item.id, { value: newValue });
       } catch (error) {
         // Almacenar el error para UI
         setErrorMessage(error.message);
         
         // Lanzar el error para que useOptimistic revierta automáticamente
         throw error; // Esto propagará el error - requiere Error Boundary
       }
     });
     ```
  
  2. **Con reversión manual (sin propagar errores)**:
     ```jsx
     // Almacenar estado original
     const originalRef = useRef(item);
     
     // Actualizar ref cuando cambia el item
     useEffect(() => {
       originalRef.current = item;
     }, [item]);
     
     startTransition(async () => {
       try {
         // Actualización optimista
         setOptimisticItem({ value: newValue });
         
         // Operación real que puede fallar
         await updateItem(item.id, { value: newValue });
       } catch (error) {
         // Almacenar el error para UI
         setErrorMessage(error.message);
         
         // Revertir manualmente sin propagar el error
         setOptimisticItem({ value: originalRef.current.value });
       }
     });
     ```

- **Orden correcto**: Primero actualizar optimistamente, luego hacer la operación asíncrona
- **Mantener actualizaciones optimistas visibles**: Asegurarse de que el usuario vea inmediatamente la actualización optimista
- **Mostrar errores adecuadamente**: Almacenar los mensajes de error en el estado del componente para mostrarlos en la UI

### 5. Manejo de errores simplificado
La aplicación implementa un enfoque sencillo para el manejo de errores:

1. **Manejo local de errores**: Cada componente maneja sus propios errores localmente mediante bloques try/catch sin propagarlos.
2. **UI de errores integrada**: Los errores se muestran directamente en los componentes donde ocurren.
3. **Reversión controlada de estados**: En lugar de depender de la reversión automática (que requiere lanzar errores), almacenamos el estado original y revertimos manualmente.
4. **Mensajes de error contextuales**: Los mensajes se muestran cerca de la acción que causó el error.

Este enfoque mantiene la simplicidad de la aplicación eliminando la necesidad de componentes Error Boundary adicionales, a la vez que preserva la experiencia de usuario con actualizaciones optimistas y manejo de errores.

### 6. Mejoras Visuales
- Se han actualizado los colores a tonos de indigo y violeta para una interfaz más moderna
- Se han añadido transiciones y animaciones para mejorar la experiencia de usuario
- Se ha implementado el efecto "pulse" en elementos que están en estado de carga
- Se han agregado efectos de sombra y transiciones suaves

## Soluciones a Problemas Comunes

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

### Error con useActionState
Según el PR #28491 de React, `useActionState` (anteriormente conocido como `useFormState`) se ha movido del paquete `react-dom` al paquete `react`.

**Problema**: Si intentas importar `useActionState` desde `react-dom`, obtendrás el error: `TypeError: useActionState is not a function or its return value is not iterable`.

**Solución**: Importar correctamente desde el paquete `react`:

```jsx
// ✅ Correcto: Importar desde react
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom'; // useFormStatus sigue en react-dom

// ❌ Incorrecto: Causará error
import { useActionState } from 'react-dom'; // Error
```

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

## Estructura del Proyecto

```
src/
  ├── components/
  │   ├── AddTodo.jsx      - useActionState, useFormStatus, form actions
  │   ├── NameChange.jsx   - Ejemplo de uso correcto de useActionState con simulación de errores
  │   ├── TodoContext.jsx  - New Context provider syntax
  │   ├── TodoFilter.jsx   - Context consumer component
  │   ├── TodoItem.jsx     - useOptimistic for UI updates con simulación de errores
  │   ├── TodoList.jsx     - use API for async data
  │   └── RefExample.jsx   - ref as prop in function components
  │
  ├── server/
  │   ├── api.js           - API client functions for data fetching
  │   ├── json-server.js   - Configuración del servidor
  │   └── routes.js        - Rutas personalizadas para json-server
  │
  ├── App.jsx              - Main application with Suspense
  ├── main.jsx             - Entry point
  └── index.css            - Styles with Tailwind
```

## Tecnologías Utilizadas

- React 19
- Tailwind CSS para estilos
- json-server para simular un backend
