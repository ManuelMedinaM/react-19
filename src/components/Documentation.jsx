import { use, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './Documentation.css';

// Creamos la promesa fuera del componente para evitar recreaciones
// Esto es una característica de React 19: promesas compartidas para consultas de datos
const readmePromise = fetch('/README.md')
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to fetch README: ${response.status}`);
    }
    return response.text();
  });

const react19FeaturesPromise = fetch('/REACT19_FEATURES.md')
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to fetch REACT19_FEATURES.md: ${response.status}`);
    }
    return response.text();
  });

// Componente para el error - usado por el boundary en App.jsx
function DocumentationError({ message }) {
  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-red-700">
        <h2 className="text-xl font-semibold mb-3">Error al cargar la documentación</h2>
        <p>{message}</p>
        <p className="mt-4">Por favor, recarga la página o intenta más tarde.</p>
      </div>
      <div className="mt-8">
        <button 
          onClick={() => window.location.href = '/'}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← Volver a la aplicación
        </button>
      </div>
    </div>
  );
}

// Componente que carga el markdown de forma segura con use()
function MarkdownContent({ showFeatures }) {
  // El hook use debe estar en el nivel superior, no en un renderizado condicional
  const markdownText = use(showFeatures ? react19FeaturesPromise : readmePromise);
  
  return (
    <div className="doc-content prose prose-indigo prose-headings:text-indigo-900 prose-a:text-indigo-600 prose-code:text-indigo-700 max-w-none">
      <ReactMarkdown
        components={{
          // Componente personalizado para bloques de código con resaltado de sintaxis
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {markdownText}
      </ReactMarkdown>
    </div>
  );
}

// Componente principal
export default function Documentation() {
  const [showFeatures, setShowFeatures] = useState(false);
  
  return (
    <div className="documentation-container">
      <div className="doc-header">
        <h1 className="doc-title">React 19 Demo - Documentación</h1>
        <div className="doc-actions">
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="doc-action-button"
          >
            {showFeatures ? 'Ver README' : 'Ver Características de React 19'}
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="doc-back-button"
          >
            ← Volver a la aplicación
          </button>
        </div>
      </div>

      {/* MarkdownContent usa el hook use() y maneja la carga de la promesa */}
      <MarkdownContent showFeatures={showFeatures} />
    </div>
  );
} 