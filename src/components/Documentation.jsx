import { use, useState } from 'react';
import React from 'react';
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
                PreTag={({ children, ...props }) => (
                  <div {...props} data-language={match[1]}>
                    {children}
                  </div>
                )}
                showLineNumbers={true}
                wrapLines={true}
                wrapLongLines={false}
                useInlineStyles={true}
                customStyle={{
                  backgroundColor: '#1e1e1e',
                  textDecoration: 'none',
                  WebkitTextDecoration: 'none',
                  color: '#e6edf3'
                }}
                codeTagProps={{
                  style: {
                    textDecoration: 'none',
                    WebkitTextDecoration: 'none',
                    color: '#e6edf3'
                  }
                }}
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
          // Personalización de párrafos para detectar listados de endpoints
          p({ node, children, ...props }) {
            // Detectar si el párrafo contiene enlaces que parecen endpoints
            const hasEndpoints = node?.children?.some(child => 
              child?.type === 'link' && child?.url?.startsWith('/'));
            
            // Detectar si tiene separadores pipe
            const hasPipes = node?.children?.some(child => 
              child?.type === 'text' && child?.value?.includes('|'));
            
            // Detectar si está bajo un encabezado de Endpoints
            const isEndpointList = hasEndpoints && hasPipes;
            
            if (isEndpointList) {
              // Procesar el contenido para encapsular el | en un span con estilo
              const enhancedChildren = React.Children.map(children, child => {
                // Si es texto y contiene pipe, transformarlo
                if (typeof child === 'string' && child.includes('|')) {
                  // Separar el texto por | y añadir estilo
                  return child.split('|').map((part, index, array) => {
                    if (index === array.length - 1) return part;
                    return <React.Fragment key={index}>
                      {part}<span className="pipe-separator">|</span>
                    </React.Fragment>;
                  });
                }
                return child;
              });
              
              return (
                <p {...props} className="endpoint-links">
                  {enhancedChildren}
                </p>
              );
            }
            
            return <p {...props}>{children}</p>;
          },
          // Personalizar listas para mejorar visualización de endpoints
          ul({ node, children, ...props }) {
            // Detectar si es una lista de endpoints
            const isEndpointList = node?.children?.some(child => {
              const firstChild = child?.children?.[0];
              return firstChild?.children?.[0]?.type === 'strong' && 
                    /GET|POST|PUT|DELETE|PATCH/i.test(firstChild?.children?.[0]?.children?.[0]?.value);
            });
            
            return (
              <ul className={isEndpointList ? 'endpoints' : undefined} {...props}>
                {children}
              </ul>
            );
          },
          // Personalizar elementos de lista para endpoints
          li({ node, children, ...props }) {
            // Verificar si este item parece ser un endpoint
            let isEndpoint = false;
            let httpMethod = '';
            
            if (node?.children?.[0]?.children?.[0]?.type === 'strong') {
              const methodText = node.children[0].children[0].children[0]?.value;
              if (methodText && /GET|POST|PUT|DELETE|PATCH/i.test(methodText)) {
                isEndpoint = true;
                httpMethod = methodText.toUpperCase();
              }
            }
            
            // Si encontramos un elemento de endpoints, aplicar clases especiales
            if (isEndpoint) {
              // Modificar el children para añadir un atributo data-method al elemento strong
              const modifiedChildren = React.Children.map(children, child => {
                if (React.isValidElement(child) && child.type === 'strong') {
                  return React.cloneElement(child, { 
                    'data-method': httpMethod,
                    className: `http-method ${httpMethod.toLowerCase()}`
                  });
                }
                return child;
              });
              
              return (
                <li {...props} className="endpoint-item">
                  {modifiedChildren}
                </li>
              );
            }
            
            return <li {...props}>{children}</li>;
          },
          // Personalizar tablas para mejorar visualización de APIs
          table({ node, children, ...props }) {
            // Detectar si es una tabla de API
            const isApiTable = node?.children?.[0]?.children?.[0]?.children?.some(cell => {
              return /método|method|endpoint|ruta|path/i.test(cell?.children?.[0]?.value);
            });
            
            return (
              <table className={isApiTable ? 'api-table' : undefined} {...props}>
                {children}
              </table>
            );
          },
          // Elemento strong para métodos HTTP
          strong({ node, children, ...props }) {
            const text = node?.children?.[0]?.value;
            const isHttpMethod = text && /^(GET|POST|PUT|DELETE|PATCH)$/i.test(text);
            
            if (isHttpMethod) {
              const method = text.toUpperCase();
              return (
                <strong {...props} data-method={method} className={`http-method ${method.toLowerCase()}`}>
                  {children}
                </strong>
              );
            }
            
            return <strong {...props}>{children}</strong>;
          }
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