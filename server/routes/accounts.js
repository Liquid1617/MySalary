const express = require('express');
const router = express.Router();
const { Account, Currency } = require('../db/models');
const authMiddleware = require('../middleware/auth');

// GET /api/accounts - получить активные счета пользователя
router.get('/', authMiddleware, async (req, res) => {
  try {
    const accounts = await Account.findAll({
      where: { 
        user_id: req.user.id,
        is_active: true  // Показываем только активные счета
      },
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

// GET /api/accounts/deactivated - получить деактивированные счета пользователя
router.get('/deactivated', authMiddleware, async (req, res) => {
  try {
    const deactivatedAccounts = await Account.findAll({
      where: { 
        user_id: req.user.id,
        is_active: false  // Показываем только деактивированные счета
      },
      include: [
        {
          model: Currency,
          as: 'currency',
          attributes: ['id', 'code', 'name', 'symbol']
        }
      ],
      order: [['updatedAt', 'DESC']]  // Сортируем по дате деактивации
    });

    res.json(deactivatedAccounts);
  } catch (error) {
    console.error('Ошибка при получении деактивированных счетов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/accounts/:id/balance - получить баланс конкретного счета
router.get('/:id/balance', authMiddleware, async (req, res) => {
  try {
    const account = await Account.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [
        {
          model: Currency,
          as: 'currency',
          attributes: ['id', 'code', 'name', 'symbol']
        }
      ]
    });

    if (!account) {
      return res.status(404).json({ error: 'Счет не найден' });
    }

    res.json({ 
      balance: account.balance,
      currency: account.currency
    });
  } catch (error) {
    console.error('Ошибка при получении баланса:', error);
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

// DELETE /api/accounts/:id - деактивировать счет (soft delete)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🔄 Deactivating account:', req.params.id);
    const account = await Account.findOne({
      where: { id: req.params.id, user_id: req.user.id, is_active: true }
    });

    if (!account) {
      return res.status(404).json({ error: 'Активный счет не найден' });
    }

    // Деактивируем счет вместо удаления
    await account.update({ is_active: false });
    console.log('✅ Account deactivated successfully:', req.params.id);
    
    res.json({ message: 'Счет успешно деактивирован' });
  } catch (error) {
    console.error('Ошибка при деактивации счета:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/accounts/:id/permanently - полностью удалить счет и все его транзакции
router.delete('/:id/permanently', authMiddleware, async (req, res) => {
  try {
    console.log('💀 Permanently deleting account and transactions:', req.params.id);
    const account = await Account.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!account) {
      return res.status(404).json({ error: 'Счет не найден' });
    }

    // Сначала удаляем все транзакции этого счета
    const { Transaction } = require('../db/models');
    const transactions = await Transaction.findAll({
      where: { account_id: req.params.id },
      include: [
        {
          model: Account,
          as: 'account',
          where: { user_id: req.user.id }
        }
      ]
    });

    // Откатываем баланс и удаляем транзакции
    let totalBalanceChange = 0;
    for (const transaction of transactions) {
      const balanceChange = transaction.transaction_type === 'income' ? -transaction.amount : transaction.amount;
      totalBalanceChange += parseFloat(balanceChange);
      await transaction.destroy();
    }
    console.log(`🗑️ Deleted ${transactions.length} transactions`);

    // Обновляем баланс счета перед удалением (хотя он все равно будет удален)
    await account.update({
      balance: parseFloat(account.balance) + totalBalanceChange
    });

    // Теперь физически удаляем счет
    await account.destroy();
    console.log('✅ Account permanently deleted:', req.params.id);
    
    res.json({ 
      message: `Счет и ${transactions.length} транзакций успешно удалены`,
      deletedTransactions: transactions.length 
    });
  } catch (error) {
    console.error('Ошибка при полном удалении счета:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 