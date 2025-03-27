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
- Hay dos opciones para manejar errores con useOptimistic:
  1. **Opción 1 - Reversión automática**: Lanzar el error dentro de la transición para que `useOptimistic` revierta automáticamente.
  2. **Opción 2 - Reversión manual**: Almacenar el estado original y revertir manualmente sin propagar el error.

```jsx
// En TodoItem.jsx
const [optimisticTodo, addOptimistic] = useOptimistic(
  todo,
  (state, newCompleted) => ({ ...state, completed: newCompleted })
);

const toggleTodo = () => {
  // Actualización optimista y transición
  const newCompleted = !optimisticTodo.completed;
  startTransition(async () => {
    try {
      // Si falla, useOptimistic revierte automáticamente
      await updateTodo(todo.id, { completed: newCompleted });
    } catch (error) {
      // El error se lanza y useOptimistic revierte
      throw error;
    }
  });
};
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

## ¿Cómo probar estas características?

1. Navega por la aplicación y prueba las diferentes funcionalidades.
2. Observa cómo los cambios en las tareas se reflejan inmediatamente (gracias a useOptimistic).
3. Prueba a desconectar la red y ver cómo se comporta la aplicación con manejo de errores.
4. Examina el código fuente para ver las implementaciones específicas.

## Recursos adicionales

- [Documentación oficial de React 19](https://react.dev)
- [Guía de migración a React 19](https://react.dev/blog/2023/03/16/introducing-react-19)
- [Ejemplo completo de useOptimistic](https://react.dev/reference/react/useOptimistic) 