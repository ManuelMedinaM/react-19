// Custom routes for json-server
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