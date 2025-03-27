import { Suspense, useState, useEffect } from 'react'
import { TodoProvider } from './components/TodoContext'
import TodoList from './components/TodoList'
import AddTodo from './components/AddTodo'
import TodoFilter from './components/TodoFilter'
import RefExample from './components/RefExample'
import NameChange from './components/NameChange'
import Documentation from './components/Documentation'
import './App.css'

// Componente para la navegación - separado para evitar renderizados innecesarios
function AppRouter({ children }) {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    // Este es un caso donde useEffect sigue siendo apropiado:
    // - Nos suscribimos a eventos del navegador
    // - Limpiamos la suscripción al desmontar
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Exponemos el navigate como una función para los componentes hijos
  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Patrón de renderizado condicional - esto es válido en React 19
  if (currentPath === '/docs') {
    // Envolvemos en Suspense para manejar la carga de Documentation
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-gray-100 py-10 px-4">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
              <div className="h-10 w-40 bg-gray-200 rounded"></div>
              <div className="h-10 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-6"></div>
              <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-40 bg-gray-200 rounded mb-6"></div>
            </div>
          </div>
        </div>
      }>
        <main className="min-h-screen bg-gray-100 py-10 px-4">
          <Documentation />
        </main>
      </Suspense>
    );
  }

  // Pasamos el navigate a los hijos a través del children function
  return children({ navigate });
}

function App() {
  return (
    <AppRouter>
      {({ navigate }) => (
        <main className="min-h-screen bg-gray-100 py-10 px-4">
          <div className="max-w-lg mx-auto">
            <header className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">React 19 Todo Demo</h1>
              <p className="text-gray-600">Showcasing new React 19 features</p>
            </header>

            <div className="mb-4 text-center">
              <button 
                onClick={() => navigate('/docs')}
                className="text-indigo-600 hover:text-indigo-800 bg-white px-4 py-2 rounded-md shadow-sm hover:shadow transition-all"
              >
                Ver documentación completa →
              </button>
            </div>

            <TodoProvider>
              <div className="space-y-4">
                <AddTodo />
                
                <TodoFilter />
                
                <Suspense fallback={
                  <div className="p-4 text-center bg-white rounded-lg border border-gray-200">
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded mb-3"></div>
                      <div className="h-6 bg-gray-200 rounded mb-3 w-3/4 mx-auto"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                  </div>
                }>
                  <TodoList />
                </Suspense>
                
                <NameChange 
                  currentName="John Doe" 
                  onSuccess={(name) => console.log(`Name updated to: ${name}`)} 
                />
                
                <RefExample />
              </div>
            </TodoProvider>
            
            <footer className="mt-10 text-center text-sm text-gray-500">
              <p>Created with React 19 - Demo application</p>
              <button 
                onClick={() => navigate('/docs')}
                className="text-indigo-600 hover:text-indigo-800 block mt-2 underline"
              >
                Documentación
              </button>
            </footer>
          </div>
        </main>
      )}
    </AppRouter>
  )
}

export default App
