const express = require('express');
const router = express.Router();
const { Account, Currency, User } = require('../db/models');

// Middleware для проверки авторизации (упрощенная версия)
const authenticateUser = (req, res, next) => {
  const userId = req.headers['user-id'] || 9; // Для демо используем ID 9 (созданный пользователь)
  req.userId = userId;
  next();
};

// GET /api/accounts - получить все счета пользователя
router.get('/', authenticateUser, async (req, res) => {
  try {
    const accounts = await Account.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Currency,
          as: 'currency',
          attributes: ['id', 'code', 'symbol']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении счетов',
      error: error.message
    });
  }
});

// POST /api/accounts - создать новый счет
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { account_type, account_name, currency_id, balance, description } = req.body;

    // Валидация обязательных полей
    if (!account_type || !account_name || !currency_id) {
      return res.status(400).json({
        success: false,
        message: 'Заполните все обязательные поля: тип счета, название и валюта'
      });
    }

    // Проверяем, существует ли валюта
    const currency = await Currency.findByPk(currency_id);
    if (!currency) {
      return res.status(400).json({
        success: false,
        message: 'Выбранная валюта не найдена'
      });
    }

    // Создаем новый счет
    const newAccount = await Account.create({
      user_id: req.userId,
      account_type,
      account_name,
      currency_id,
      balance: balance || 0,
      description: description || null
    });

    // Получаем созданный счет с включенной валютой
    const accountWithCurrency = await Account.findByPk(newAccount.id, {
      include: [
        {
          model: Currency,
          as: 'currency',
          attributes: ['id', 'code', 'symbol']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Счет успешно создан',
      data: accountWithCurrency
    });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании счета',
      error: error.message
    });
  }
});

// PUT /api/accounts/:id - обновить счет
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const accountId = req.params.id;
    const { account_type, account_name, currency_id, balance, description } = req.body;

    // Находим счет пользователя
    const account = await Account.findOne({
      where: { id: accountId, user_id: req.userId }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Счет не найден'
      });
    }

    // Обновляем счет
    await account.update({
      account_type: account_type || account.account_type,
      account_name: account_name || account.account_name,
      currency_id: currency_id || account.currency_id,
      balance: balance !== undefined ? balance : account.balance,
      description: description !== undefined ? description : account.description
    });

    // Получаем обновленный счет с валютой
    const updatedAccount = await Account.findByPk(accountId, {
      include: [
        {
          model: Currency,
          as: 'currency',
          attributes: ['id', 'code', 'symbol']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Счет успешно обновлен',
      data: updatedAccount
    });
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении счета',
      error: error.message
    });
  }
});

// DELETE /api/accounts/:id - удалить счет
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const accountId = req.params.id;

    // Находим счет пользователя
    const account = await Account.findOne({
      where: { id: accountId, user_id: req.userId }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Счет не найден'
      });
    }

    // Удаляем счет
    await account.destroy();

    res.json({
      success: true,
      message: 'Счет успешно удален'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении счета',
      error: error.message
    });
  }
});

// GET /api/accounts/currencies - получить список валют
router.get('/currencies', async (req, res) => {
  try {
    const currencies = await Currency.findAll({
      attributes: ['id', 'code', 'name', 'symbol'],
      order: [['code', 'ASC']]
    });

    res.json({
      success: true,
      data: currencies
    });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении валют',
      error: error.message
    });
  }
});

module.exports = router; 