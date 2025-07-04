require('dotenv').config()
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const db = require('./db/models')
const authRoutes = require('./routes/auth');
const countriesRoutes = require('./routes/countries');

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/countries', countriesRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

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