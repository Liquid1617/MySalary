const express = require('express');
const router = express.Router();
const { Account, Currency } = require('../db/models');
const authMiddleware = require('../middleware/auth');

// GET /api/accounts - получить все счета пользователя
router.get('/', authMiddleware, async (req, res) => {
  try {
    const accounts = await Account.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Currency,
          as: 'currency',
          attributes: ['id', 'code', 'name', 'symbol']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(accounts);
  } catch (error) {
    console.error('Ошибка при получении счетов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/accounts - создать новый счет
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { account_type, account_name, currency_id, balance, description } = req.body;

    // Валидация обязательных полей
    if (!account_type || !account_name || !currency_id) {
      return res.status(400).json({ 
        error: 'Поля account_type, account_name и currency_id обязательны' 
      });
    }

    // Проверка валидности типа счета
    const validTypes = ['cash', 'debit_card', 'credit_card', 'bank_account', 'digital_wallet'];
    if (!validTypes.includes(account_type)) {
      return res.status(400).json({ 
        error: 'Недопустимый тип счета' 
      });
    }

    // Проверка существования валюты
    const currency = await Currency.findByPk(currency_id);
    if (!currency) {
      return res.status(400).json({ 
        error: 'Валюта не найдена' 
      });
    }

    const account = await Account.create({
      user_id: req.user.id,
      account_type,
      account_name,
      currency_id,
      balance: balance || 0,
      description
    });

    // Получаем созданный счет с валютой
    const createdAccount = await Account.findByPk(account.id, {
      include: [
        {
          model: Currency,
          as: 'currency',
          attributes: ['id', 'code', 'name', 'symbol']
        }
      ]
    });

    res.status(201).json(createdAccount);
  } catch (error) {
    console.error('Ошибка при создании счета:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PUT /api/accounts/:id - обновить счет
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { account_type, account_name, currency_id, balance, description, is_active } = req.body;

    const account = await Account.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!account) {
      return res.status(404).json({ error: 'Счет не найден' });
    }

    // Валидация типа счета если он передан
    if (account_type) {
      const validTypes = ['cash', 'debit_card', 'credit_card', 'bank_account', 'digital_wallet'];
      if (!validTypes.includes(account_type)) {
        return res.status(400).json({ 
          error: 'Недопустимый тип счета' 
        });
      }
    }

    // Проверка валюты если она передана
    if (currency_id) {
      const currency = await Currency.findByPk(currency_id);
      if (!currency) {
        return res.status(400).json({ 
          error: 'Валюта не найдена' 
        });
      }
    }

    await account.update({
      account_type: account_type || account.account_type,
      account_name: account_name || account.account_name,
      currency_id: currency_id || account.currency_id,
      balance: balance !== undefined ? balance : account.balance,
      description: description !== undefined ? description : account.description,
      is_active: is_active !== undefined ? is_active : account.is_active
    });

    // Получаем обновленный счет с валютой
    const updatedAccount = await Account.findByPk(account.id, {
      include: [
        {
          model: Currency,
          as: 'currency',
          attributes: ['id', 'code', 'name', 'symbol']
        }
      ]
    });

    res.json(updatedAccount);
  } catch (error) {
    console.error('Ошибка при обновлении счета:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/accounts/:id - удалить счет
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const account = await Account.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!account) {
      return res.status(404).json({ error: 'Счет не найден' });
    }

    await account.destroy();
    res.json({ message: 'Счет успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении счета:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 