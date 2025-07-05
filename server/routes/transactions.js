const express = require('express');
const router = express.Router();
const { Transaction, Account, Category } = require('../db/models');

// Создание новой транзакции
router.post('/', async (req, res) => {
  try {
    const { type, amount, description, category_id, account_id } = req.body;
    const userId = req.headers['user-id'];

    // Валидация обязательных полей
    if (!type || !amount || !category_id || !account_id) {
      return res.status(400).json({
        success: false,
        message: 'Все поля обязательны: type, amount, category_id, account_id'
      });
    }

    // Проверяем, что тип транзакции корректный
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Тип транзакции должен быть income или expense'
      });
    }

    // Проверяем, что сумма положительная
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Сумма должна быть положительной'
      });
    }

    // Проверяем, что счет принадлежит пользователю
    const account = await Account.findOne({
      where: { id: account_id, user_id: userId }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Счет не найден или не принадлежит пользователю'
      });
    }

    // Проверяем, что категория существует
    const category = await Category.findOne({
      where: { id: category_id, category_type: type }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена или не соответствует типу транзакции'
      });
    }

    // Создаем транзакцию
    const transaction = await Transaction.create({
      user_id: userId,
      account_id: account_id,
      category_id: category_id,
      transaction_type: type,
      amount: parseFloat(amount),
      description: description || null,
      transaction_date: new Date().toISOString().split('T')[0] // Только дата без времени
    });

    // Обновляем баланс счета
    const balanceChange = type === 'income' ? parseFloat(amount) : -parseFloat(amount);
    const newBalance = parseFloat(account.balance) + balanceChange;
    
    await Account.update(
      { balance: newBalance },
      { where: { id: account_id } }
    );

    // Получаем обновленные данные
    const updatedAccount = await Account.findByPk(account_id);
    const transactionWithDetails = await Transaction.findByPk(transaction.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Account, as: 'account' }
      ]
    });

    res.json({
      success: true,
      message: 'Транзакция успешно создана',
      data: {
        transaction: transactionWithDetails,
        updatedBalance: updatedAccount.balance
      }
    });

  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании транзакции',
      error: error.message
    });
  }
});

// Получение всех транзакций пользователя
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { limit = 50, offset = 0 } = req.query;

    const transactions = await Transaction.findAll({
      where: { user_id: userId },
      include: [
        { model: Category, as: 'category' },
        { model: Account, as: 'account' }
      ],
      order: [['transaction_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении транзакций',
      error: error.message
    });
  }
});

module.exports = router; 