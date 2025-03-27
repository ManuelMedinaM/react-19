import { useContext } from 'react';
import { TodoContext } from './TodoContext';

export default function TodoFilter() {
  const { filter, setFilter } = useContext(TodoContext);
  
  return (
    <div className="flex justify-center p-2 space-x-2 bg-white rounded-lg border border-gray-200">
      <FilterButton 
        label="All" 
        isActive={filter === 'all'} 
        onClick={() => setFilter('all')} 
      />
      <FilterButton 
        label="Active" 
        isActive={filter === 'active'} 
        onClick={() => setFilter('active')} 
      />
      <FilterButton 
        label="Completed" 
        isActive={filter === 'completed'} 
        onClick={() => setFilter('completed')} 
      />
    </div>
  );
}

// Filter button component
function FilterButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md transition-colors duration-200 ${
        isActive 
          ? 'bg-indigo-600 text-white shadow-md' 
          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
      }`}
    >
      {label}
    </button>
  );
} 