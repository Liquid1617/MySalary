require('dotenv').config()
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const db = require('./db/models')
const authRoutes = require('./routes/auth');
const countriesRoutes = require('./routes/countries');
const accountsRoutes = require('./routes/accounts');
const categoriesRoutes = require('./routes/categories');
const transactionsRoutes = require('./routes/transactions');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Разрешаем запросы с любого источника в режиме разработки
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id'],
  credentials: true
}));

// Расширенное логирование
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use((req, res, next) => {
  console.log('Request Body:', req.body);
  console.log('Request Headers:', req.headers);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/countries', countriesRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/transactions', transactionsRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

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

app.listen(PORT, () =>
  console.log(`🚀 Server listening on http://localhost:${PORT}`)
);