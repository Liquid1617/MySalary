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
    const { name, login, email, password } = req.body;

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
      message: 'Пользователь успешно зарегистрирован',
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
    const { username, password } = req.body;

    // Проверка обязательных полей
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username и пароль обязательны' 
      });
    }

    // Поиск пользователя по логину
    const user = await User.findOne({ where: { login: username } });
    if (!user) {
      return res.status(401).json({ 
        error: 'Неверный username или пароль' 
      });
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Неверный username или пароль' 
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
      message: 'Авторизация прошла успешно',
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
    console.error('Ошибка авторизации:', error);
    res.status(500).json({ error: 'Ошибка сервера при авторизации' });
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
      return res.status(404).json({ error: 'Пользователь не найден' });
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
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
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
          error: 'Указанная валюта не найдена или неактивна' 
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
      message: 'Профиль успешно обновлен',
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
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера при обновлении профиля' });
  }
});

module.exports = router; 