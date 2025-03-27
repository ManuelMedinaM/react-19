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
const router = jsonServer.router(join(__dirname, '../../db.json'));
const middlewares = jsonServer.defaults();

// Configure middleware
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Setup custom routes
routes(server);

// Use default router
server.use(router);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
  console.log(`Access the API at http://localhost:${PORT}`);
}); 