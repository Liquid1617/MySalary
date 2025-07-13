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

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/countries', countriesRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/currencies', currenciesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/networth', networthRoutes);
app.use('/api', chatRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// Chart debugging enabled
console.log('📊 Chart API debugging enabled');

const PORT = process.env.PORT || 3001;

async function testConnection() {
  try {
    await db.sequelize.authenticate()
    console.log('✅ Database connection successful')
  } catch (error) {
    console.log('❌ Database connection failed: ', error)
  }
}

testConnection()

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on http://0.0.0.0:${PORT}`);
  console.log(`🌐 Also available at http://192.168.100.11:${PORT}`);
});