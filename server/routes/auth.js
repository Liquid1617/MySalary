const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../db/models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Проверка уникальности логина
router.post('/check-login', async (req, res) => {
  try {
    const { login } = req.body;

    if (!login || !login.trim()) {
      return res.status(400).json({ 
        error: 'Логин не может быть пустым' 
      });
    }

    const trimmedLogin = login.trim();

    // Проверяем длину логина
    if (trimmedLogin.length < 3) {
      return res.status(400).json({ 
        error: 'Логин должен быть не менее 3 символов' 
      });
    }

    if (trimmedLogin.length > 50) {
      return res.status(400).json({ 
        error: 'Логин должен быть не более 50 символов' 
      });
    }

    // Проверяем формат логина (только буквы, цифры, точки, подчеркивания)
    const loginRegex = /^[a-zA-Z0-9._]+$/;
    if (!loginRegex.test(trimmedLogin)) {
      return res.status(400).json({ 
        error: 'Логин может содержать только буквы, цифры, точки и подчеркивания' 
      });
    }

    // Проверяем существование логина в базе
    const existingUser = await User.findOne({ where: { login: trimmedLogin } });
    
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Логин уже занят' 
      });
    }

    res.json({ 
      message: 'Логин доступен',
      available: true 
    });

  } catch (error) {
    console.error('Ошибка проверки логина:', error);
    res.status(500).json({ error: 'Ошибка сервера при проверке логина' });
  }
});

// Проверка уникальности email
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ 
        error: 'Email не может быть пустым' 
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Проверяем формат email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ 
        error: 'Введите корректный email' 
      });
    }

    // Проверяем существование email в базе
    const existingUser = await User.findOne({ where: { email: trimmedEmail } });
    
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Пользователь с таким email уже существует' 
      });
    }

    res.json({ 
      message: 'Email доступен',
      available: true 
    });

  } catch (error) {
    console.error('Ошибка проверки email:', error);
    res.status(500).json({ error: 'Ошибка сервера при проверке email' });
  }
});

// Проверка уникальности телефона
router.post('/check-phone', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !phone.trim()) {
      return res.status(400).json({ 
        error: 'Номер телефона не может быть пустым' 
      });
    }

    const trimmedPhone = phone.trim();

    // Проверяем формат телефона
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      return res.status(400).json({ 
        error: 'Введите корректный номер телефона' 
      });
    }

    // Проверяем существование телефона в базе
    const existingUser = await User.findOne({ where: { phone: trimmedPhone } });
    
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Пользователь с таким номером телефона уже существует' 
      });
    }

    res.json({ 
      message: 'Номер телефона доступен',
      available: true 
    });

  } catch (error) {
    console.error('Ошибка проверки телефона:', error);
    res.status(500).json({ error: 'Ошибка сервера при проверке телефона' });
  }
});

// Регистрация пользователя
router.post('/register', async (req, res) => {
  try {
    const { login, email, password, phone, country_id } = req.body;

    // Проверка обязательных полей
    if (!login || !email || !password) {
      return res.status(400).json({ 
        error: 'Логин, email и пароль обязательны для заполнения' 
      });
    }

    const trimmedLogin = login.trim();

    // Валидация логина
    if (trimmedLogin.length < 3 || trimmedLogin.length > 50) {
      return res.status(400).json({ 
        error: 'Логин должен быть от 3 до 50 символов' 
      });
    }

    const loginRegex = /^[a-zA-Z0-9._]+$/;
    if (!loginRegex.test(trimmedLogin)) {
      return res.status(400).json({ 
        error: 'Логин может содержать только буквы, цифры, точки и подчеркивания' 
      });
    }

    // Проверка существования пользователя по email
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      return res.status(400).json({ 
        error: 'Пользователь с таким email уже существует' 
      });
    }

    // Проверка существования пользователя по логину
    const existingUserByLogin = await User.findOne({ where: { login: trimmedLogin } });
    if (existingUserByLogin) {
      return res.status(400).json({ 
        error: 'Пользователь с таким логином уже существует' 
      });
    }

    // Хеширование пароля
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Создание пользователя
    const userData = {
      login: trimmedLogin,
      email,
      password: hashedPassword
    };

    // Добавляем телефон если указан
    if (phone && phone.trim()) {
      userData.phone = phone.trim();
    }

    // Добавляем country_id если указан
    if (country_id) {
      userData.country_id = parseInt(country_id);
    }

    const user = await User.create(userData);

    // Создание JWT токена
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: user.id,
        login: user.login,
        email: user.email,
        phone: user.phone,
        country_id: user.country_id
      },
      token
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    
    // Обработка специфических ошибок
    if (error.name === 'SequelizeUniqueConstraintError') {
      if (error.errors.some(err => err.path === 'email')) {
        return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
      }
      if (error.errors.some(err => err.path === 'login')) {
        return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
      }
    }
    
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

// Авторизация пользователя
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Проверка обязательных полей
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email и пароль обязательны' 
      });
    }

    // Поиск пользователя
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        error: 'Неверный email или пароль' 
      });
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Неверный email или пароль' 
      });
    }

    // Создание JWT токена
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Авторизация прошла успешно',
      user: {
        id: user.id,
        login: user.login,
        email: user.email
      },
      token
    });

  } catch (error) {
    console.error('Ошибка авторизации:', error);
    res.status(500).json({ error: 'Ошибка сервера при авторизации' });
  }
});

// Получение информации о текущем пользователе
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        login: req.user.login,
        email: req.user.email,
        phone: req.user.phone,
        country_id: req.user.country_id
      }
    });
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 