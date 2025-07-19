require('dotenv').config()
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const db = require('./db/models')
const authRoutes = require('./routes/auth');
const countriesRoutes = require('./routes/countries');
const accountsRoutes = require('./routes/accounts');
const currenciesRoutes = require('./routes/currencies');
const categoriesRoutes = require('./routes/categories');
const transactionsRoutes = require('./routes/transactions');
const networthRoutes = require('./routes/networth');
const chatRoutes = require('./routes/chat');
const budgetsRoutes = require('./routes/budgets');

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add custom request logging
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📝 Body:`, JSON.stringify(req.body, null, 2));
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/countries', countriesRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/currencies', currenciesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/networth', networthRoutes);
app.use('/api', chatRoutes);
app.use('/api/budgets', budgetsRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// Chart debugging enabled
console.log('📊 Chart API debugging enabled');

const PORT = process.env.PORT || 3002;

async function testConnection() {
  try {
    await db.sequelize.authenticate()
    console.log('✅ Database connection successful')
  } catch (error) {
    console.log('❌ Database connection failed: ', error)
  }
}

testConnection()

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error('Stack:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`🌐 Server listening on all interfaces on port ${PORT}`);
  console.log(`📱 iOS Simulator can access via localhost:${PORT}`);
  console.log(`📱 Network access via http://192.168.100.24:${PORT}`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  console.error('❌ Error details:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  }
  process.exit(1);
});