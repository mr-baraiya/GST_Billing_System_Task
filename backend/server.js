const app = require('./src/app');
const { initDb } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`GSTKhata backend running on http://localhost:${PORT}`);
  await initDb();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is in use. Retrying...`);
  } else {
    console.error('Server error:', err);
  }
});
