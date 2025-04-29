// JSON Server configuration
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import routes from './routes.js';
import { promises as fs } from 'fs';
import cron from 'node-cron';

/* global process */

const require = createRequire(import.meta.url);
const jsonServer = require('json-server');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Store the path to the database file
const dbPath = join(__dirname, './db.json');
// Variable to store initial data
let initialData = null;

// Function to read and store initial data
async function storeInitialData() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    initialData = data;
    console.log('Initial data stored successfully');
  } catch (error) {
    console.error('Error reading initial data:', error);
  }
}

// Function to restore initial data
async function restoreInitialData() {
  if (initialData) {
    try {
      await fs.writeFile(dbPath, initialData, 'utf8');
      console.log(`[${new Date().toISOString()}] Database restored to initial state`);
      
      // Reload the router to use the restored data
      router.db.read();
    } catch (error) {
      console.error('Error restoring initial data:', error);
    }
  }
}

// Create server
const server = jsonServer.create();
const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults({
  static: join(__dirname, 'public')
});

// Configure middleware
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Setup custom routes
routes(server);

// Add cats endpoint that returns todos list
server.get('/cats', (req, res) => {
  const db = router.db;
  const todos = db.get('todos').value();
  res.jsonp(todos);
});

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

// Add CORS headers to allow cross-origin requests
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Start server
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Store initial data before starting server
storeInitialData().then(() => {
  // Set up a cron job to run at midnight (00:00) every day
  // Cron format: second(optional) minute hour dayOfMonth month dayOfWeek
  cron.schedule('0 0 * * *', () => {
    console.log(`[${new Date().toISOString()}] Scheduled midnight database restoration triggered`);
    restoreInitialData();
  });
  
  server.listen(PORT, HOST, () => {
    console.log(`JSON Server is running on http://${HOST}:${PORT}`);
    console.log(`Access the API at http://localhost:${PORT}`);
    console.log(`View documentation at http://localhost:${PORT}/docs`);
    console.log(`Database will be restored to initial state at midnight every day (cron: 0 0 * * *)`);
  });
});