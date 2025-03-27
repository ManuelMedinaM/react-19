import { Suspense } from 'react'
import { TodoProvider } from './components/TodoContext'
import TodoList from './components/TodoList'
import AddTodo from './components/AddTodo'
import TodoFilter from './components/TodoFilter'
import RefExample from './components/RefExample'
import NameChange from './components/NameChange'
import './App.css'

function App() {
  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">React 19 Todo Demo</h1>
          <p className="text-gray-600">Showcasing new React 19 features</p>
        </header>

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
        </footer>
      </div>
    </main>
  )
}

export default App
