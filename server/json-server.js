// JSON Server configuration
import jsonServer from 'json-server';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import routes from './routes.js';

/* global process */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create server
const server = jsonServer.create();
const router = jsonServer.router(join(__dirname, '../db.json'));
const middlewares = jsonServer.defaults({
  static: join(__dirname, 'public')
});

// Configure middleware
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Setup custom routes
routes(server);

// Use default router
server.use(router);

// Endpoint para devolver la estructura del proyecto
server.get('/api/project-structure', (req, res) => {
  // Estructura del proyecto - puedes personalizarla según la estructura real
  const projectStructure = {
    src: {
      components: {
        'Documentation.jsx': true,
        'Documentation.css': true,
        'App.jsx': true,
        'TodoList.jsx': true,
        'TodoItem.jsx': true,
        'ErrorBoundary.jsx': true
      },
      assets: {
        'logo.svg': true,
        'react-logo.png': true
      },
      'index.css': true,
      'main.jsx': true,
      'App.css': true
    },
    public: {
      'favicon.ico': true,
      'index.html': true,
      'README.md': true,
      'REACT19_FEATURES.md': true
    },
    'package.json': true,
    'vite.config.js': true,
    'README.md': true,
    'REACT19_FEATURES.md': true,
    'tailwind.config.js': true,
    'eslint.config.js': true
  };

  // Simular carga con pequeño delay
  setTimeout(() => {
    res.jsonp(projectStructure);
  }, 500);
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
  console.log(`Access the API at http://localhost:${PORT}`);
  console.log(`View documentation at http://localhost:${PORT}/docs`);
}); 