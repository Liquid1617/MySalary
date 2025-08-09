const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Currency } = require('../db/models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Проверка уникальности логина
router.post('/check-login', async (req, res) => {
  try {
    const { login } = req.body;

    if (!login || !login.trim()) {
      return res.status(400).json({ 
        error: 'Login cannot be empty' 
      });
    }

    const trimmedLogin = login.trim();

    // Проверяем длину логина
    if (trimmedLogin.length < 3) {
      return res.status(400).json({ 
        error: 'Login must be at least 3 characters' 
      });
    }

    if (trimmedLogin.length > 50) {
      return res.status(400).json({ 
        error: 'Login must be no more than 50 characters' 
      });
    }

    // Проверяем формат логина (только буквы, цифры, точки, подчеркивания)
    const loginRegex = /^[a-zA-Z0-9._]+$/;
    if (!loginRegex.test(trimmedLogin)) {
      return res.status(400).json({ 
        error: 'Login can only contain letters, numbers, dots and underscores' 
      });
    }

    // Проверяем существование логина в базе
    const existingUser = await User.findOne({ where: { login: trimmedLogin } });
    
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Login is already taken' 
      });
    }

    res.json({ 
      message: 'Login is available',
      available: true 
    });

  } catch (error) {
    console.error('Login check error:', error);
    res.status(500).json({ error: 'Server error while checking login' });
  }
});

// Проверка уникальности email
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ 
        error: 'Email cannot be empty' 
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Проверяем формат email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ 
        error: 'Please enter a valid email' 
      });
    }

    // Проверяем существование email в базе
    const existingUser = await User.findOne({ where: { email: trimmedEmail } });
    
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }

    res.json({ 
      message: 'Email is available',
      available: true 
    });

  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({ error: 'Server error while checking email' });
  }
});

// Проверка уникальности телефона
router.post('/check-phone', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !phone.trim()) {
      return res.status(400).json({ 
        error: 'Phone number cannot be empty' 
      });
    }

    const trimmedPhone = phone.trim();

    // Проверяем формат телефона
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      return res.status(400).json({ 
        error: 'Please enter a valid phone number' 
      });
    }

    // Проверяем существование телефона в базе
    const existingUser = await User.findOne({ where: { phone: trimmedPhone } });
    
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this phone number already exists' 
      });
    }

    res.json({ 
      message: 'Phone number is available',
      available: true 
    });

  } catch (error) {
    console.error('Phone check error:', error);
    res.status(500).json({ error: 'Server error while checking phone' });
  }
});

// Регистрация пользователя
router.post('/register', async (req, res) => {
  try {
    const { name, login, email, password } = req.body;

    // Проверка обязательных полей
    if (!login || !email || !password) {
      return res.status(400).json({ 
        error: 'Login, email and password are required' 
      });
    }

    const trimmedLogin = login.trim();

    // Валидация логина
    if (trimmedLogin.length < 3 || trimmedLogin.length > 50) {
      return res.status(400).json({ 
        error: 'Login must be between 3 and 50 characters' 
      });
    }

    const loginRegex = /^[a-zA-Z0-9._]+$/;
    if (!loginRegex.test(trimmedLogin)) {
      return res.status(400).json({ 
        error: 'Login can only contain letters, numbers, dots and underscores' 
      });
    }

    // Проверка существования пользователя по email
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Проверка существования пользователя по логину
    const existingUserByLogin = await User.findOne({ where: { login: trimmedLogin } });
    if (existingUserByLogin) {
      return res.status(400).json({ 
        error: 'User with this login already exists' 
      });
    }

    // Хеширование пароля
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Устанавливаем USD как валюту по умолчанию
    let currencyId = null;
    const usdCurrency = await Currency.findOne({ where: { code: 'USD' } });
    if (usdCurrency) {
      currencyId = usdCurrency.id;
    }

    // Создание пользователя
    const userData = {
      login: trimmedLogin,
      email,
      password: hashedPassword
    };

    // Добавляем имя если указано
    if (name && name.trim()) {
      userData.name = name.trim();
    }

    // Добавляем primary_currency_id (USD по умолчанию)
    if (currencyId) {
      userData.primary_currency_id = currencyId;
    }

    const user = await User.create(userData);

    // Получаем пользователя с валютой для ответа
    const userWithCurrency = await User.findByPk(user.id, {
      include: [{
        model: Currency,
        as: 'primaryCurrency',
        attributes: ['id', 'code', 'name', 'symbol']
      }]
    });

    // Создание JWT токена
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User successfully registered',
      user: {
        id: userWithCurrency.id,
        name: userWithCurrency.name,
        login: userWithCurrency.login,
        email: userWithCurrency.email,
        phone: userWithCurrency.phone,
        country_id: userWithCurrency.country_id,
        primary_currency_id: userWithCurrency.primary_currency_id,
        primaryCurrency: userWithCurrency.primaryCurrency
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Обработка специфических ошибок
    if (error.name === 'SequelizeUniqueConstraintError') {
      if (error.errors.some(err => err.path === 'email')) {
        return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
      }
      if (error.errors.some(err => err.path === 'login')) {
        return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
      }
    }
    
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Авторизация пользователя
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Проверка обязательных полей
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    // Поиск пользователя по логину или email
    const { Op } = require('sequelize');
    const user = await User.findOne({ 
      where: {
        [Op.or]: [
          { login: username },
          { email: username.toLowerCase() }
        ]
      }
    });
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid username or password' 
      });
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid username or password' 
      });
    }

    // Получаем пользователя с валютой для ответа
    const userWithCurrency = await User.findByPk(user.id, {
      include: [{
        model: Currency,
        as: 'primaryCurrency',
        attributes: ['id', 'code', 'name', 'symbol']
      }]
    });

    // Создание JWT токена
    const token = jwt.sign(
      { id: user.id, login: user.login },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Successfully logged in',
      user: {
        id: userWithCurrency.id,
        name: userWithCurrency.name,
        login: userWithCurrency.login,
        email: userWithCurrency.email,
        phone: userWithCurrency.phone,
        country_id: userWithCurrency.country_id,
        primary_currency_id: userWithCurrency.primary_currency_id,
        primaryCurrency: userWithCurrency.primaryCurrency
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Получение информации о текущем пользователе
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Currency,
        as: 'primaryCurrency',
        attributes: ['id', 'code', 'name', 'symbol']
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        login: user.login,
        email: user.email,
        phone: user.phone,
        country_id: user.country_id,
        primary_currency_id: user.primary_currency_id,
        primaryCurrency: user.primaryCurrency
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Обновление профиля пользователя
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const { primary_currency_id } = req.body;

    if (primary_currency_id) {
      // Проверяем, что валюта существует и активна
      const currency = await Currency.findOne({ 
        where: { id: primary_currency_id, is_active: true } 
      });
      if (!currency) {
        return res.status(400).json({ 
          error: 'Specified currency not found or inactive' 
        });
      }
    }

    // Обновляем пользователя
    await User.update(
      { primary_currency_id },
      { where: { id: req.user.id } }
    );

    // Получаем обновленного пользователя с валютой
    const updatedUser = await User.findByPk(req.user.id, {
      include: [{
        model: Currency,
        as: 'primaryCurrency',
        attributes: ['id', 'code', 'name', 'symbol']
      }]
    });

    res.json({
      message: 'Profile successfully updated',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        login: updatedUser.login,
        email: updatedUser.email,
        phone: updatedUser.phone,
        country_id: updatedUser.country_id,
        primary_currency_id: updatedUser.primary_currency_id,
        primaryCurrency: updatedUser.primaryCurrency
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
});

module.exports = router; 