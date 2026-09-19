require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const partyRoutes = require('./src/routes/partyRoutes');
const itemRoutes = require('./src/routes/itemRoutes');
const billRoutes = require('./src/routes/billRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const shopRoutes = require('./src/routes/shopRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Application API Routes
app.use('/api/auth', authRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Central error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

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
