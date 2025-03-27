// Custom routes for json-server
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import MarkdownIt from 'markdown-it';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default (server) => {
  // Add delay to simulate network latency
  server.use((req, res, next) => {
    setTimeout(next, 300);
  });

  // Log requests
  server.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Route for README documentation
  server.get('/docs', async (req, res) => {
    try {
      // Read README.md file
      const readmePath = join(__dirname, '../README.md');
      const readmeContent = await fs.readFile(readmePath, 'utf8');
      
      // Read HTML template
      const templatePath = join(__dirname, './public/readme-template.html');
      const template = await fs.readFile(templatePath, 'utf8');
      
      // Convert markdown to HTML
      const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
        highlight: function (str, lang) {
          return `<pre class="language-${lang}"><code>${str}</code></pre>`;
        }
      });
      
      const htmlContent = md.render(readmeContent);
      
      // Replace placeholder with HTML content
      const fullHtml = template.replace('{{content}}', htmlContent);
      
      // Send response
      res.setHeader('Content-Type', 'text/html');
      res.end(fullHtml);
    } catch (error) {
      console.error('Error rendering README:', error);
      res.statusCode = 500;
      res.end('Error rendering documentation');
    }
  });

  // Custom routes
  server.get('/todos/active', (req, res) => {
    const db = req.app.db;
    const activeTodos = db.get('todos').filter({ completed: false }).value();
    res.jsonp(activeTodos);
  });

  server.get('/todos/completed', (req, res) => {
    const db = req.app.db;
    const completedTodos = db.get('todos').filter({ completed: true }).value();
    res.jsonp(completedTodos);
  });

  // Custom route for stats
  server.get('/stats', (req, res) => {
    const db = req.app.db;
    const todos = db.get('todos').value();
    const stats = {
      total: todos.length,
      active: todos.filter(todo => !todo.completed).length,
      completed: todos.filter(todo => todo.completed).length
    };
    res.jsonp(stats);
  });
}; 