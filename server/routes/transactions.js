const express = require('express');
const router = express.Router();
const { Transaction, Account, Category, Currency } = require('../db/models');
const auth = require('../middleware/auth');

// Получить все транзакции пользователя
router.get('/', auth, async (req, res) => {
  try {
    console.log('🔍 Fetching transactions with ORDER BY createdAt DESC');
    const transactions = await Transaction.findAll({
      where: { 
        '$account.user_id$': req.user.id 
      },
      include: [
        {
          model: Account,
          as: 'account',
          include: [
            {
              model: Currency,
              as: 'currency',
            }
          ]
        },
        {
          model: Account,
          as: 'targetAccount',
          required: false, // LEFT JOIN для transfer транзакций
          include: [
            {
              model: Currency,
              as: 'currency',
            }
          ]
        },
        {
          model: Category,
          as: 'category',
          required: false, // LEFT JOIN так как transfer не имеют категории
        }
      ],
      order: [['createdAt', 'DESC']], // Сортировка по времени создания
    });
    res.json(transactions);
  } catch (error) {
    console.error('Ошибка получения транзакций:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создать новую транзакцию
router.post('/', auth, async (req, res) => {
  try {
    const { account_id, category_id, amount, transaction_type, description, transfer_to } = req.body;
    
    console.log('Создание транзакции:', {
      user_id: req.user.id,
      account_id,
      category_id,
      amount,
      transaction_type,
      description,
      transfer_to
    });

    // Базовая валидация
    if (!account_id || !amount || !transaction_type) {
      return res.status(400).json({ message: 'Обязательные поля: account_id, amount, transaction_type' });
    }

    if (!['income', 'expense', 'transfer'].includes(transaction_type)) {
      return res.status(400).json({ message: 'Тип транзакции должен быть income, expense или transfer' });
    }

    // Валидация для разных типов транзакций
    if (transaction_type === 'transfer') {
      if (!transfer_to) {
        return res.status(400).json({ message: 'Для transfer необходимо указать transfer_to' });
      }
      if (account_id === transfer_to) {
        return res.status(400).json({ message: 'Нельзя перевести средства на тот же счёт' });
      }
    } else {
      if (!category_id) {
        return res.status(400).json({ message: 'Для income/expense необходимо указать category_id' });
      }
    }

    // Проверяем, что исходный счет принадлежит пользователю
    const account = await Account.findOne({
      where: { id: account_id, user_id: req.user.id },
      include: [{ model: Currency, as: 'currency' }]
    });

    if (!account) {
      return res.status(404).json({ message: 'Исходный счет не найден' });
    }

    let targetAccount = null;
    if (transaction_type === 'transfer') {
      // Проверяем, что целевой счет принадлежит пользователю
      targetAccount = await Account.findOne({
        where: { id: transfer_to, user_id: req.user.id },
        include: [{ model: Currency, as: 'currency' }]
      });

      if (!targetAccount) {
        return res.status(404).json({ message: 'Целевой счет не найден' });
      }
    } else {
      // Проверяем, что категория существует для обычных транзакций
      const category = await Category.findByPk(category_id);

      if (!category) {
        return res.status(404).json({ message: 'Категория не найдена' });
      }
    }

    // Подготавливаем данные для создания транзакции
    const transactionData = {
      user_id: req.user.id,
      account_id,
      amount: parseFloat(amount),
      transaction_type,
      description: description || '',
      transaction_date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD формат
    };

    // Добавляем специфичные поля для разных типов
    if (transaction_type === 'transfer') {
      transactionData.transfer_to = transfer_to;
      transactionData.category_id = null;
    } else {
      transactionData.category_id = category_id;
    }

    // Создаем транзакцию
    const transaction = await Transaction.create(transactionData);

    console.log('Транзакция создана:', transaction.id);

    // Обновляем балансы
    if (transaction_type === 'transfer') {
      // Для transfer обновляем оба счёта
      const transferAmount = parseFloat(amount);
      
      // Списываем с исходного счёта
      await account.update({
        balance: parseFloat(account.balance) - transferAmount
      });

      // Конвертируем валюту если нужно
      let targetAmount = transferAmount;
      if (account.currency.code !== targetAccount.currency.code) {
        const exchangeRateService = require('../services/exchangeRate');
        try {
          targetAmount = await exchangeRateService.convertCurrency(
            transferAmount, 
            account.currency.code, 
            targetAccount.currency.code
          );
          console.log(`Конвертация: ${transferAmount} ${account.currency.code} = ${targetAmount} ${targetAccount.currency.code}`);
        } catch (error) {
          console.error('Ошибка конвертации валюты при transfer:', error);
          // В случае ошибки используем 1:1
          targetAmount = transferAmount;
        }
      }

      // Зачисляем на целевой счёт
      await targetAccount.update({
        balance: parseFloat(targetAccount.balance) + targetAmount
      });

      console.log(`Transfer completed: ${account.account_name} (-${transferAmount} ${account.currency.code}) -> ${targetAccount.account_name} (+${targetAmount} ${targetAccount.currency.code})`);
    } else {
      // Для обычных транзакций обновляем один счёт
      const balanceChange = transaction_type === 'income' ? amount : -amount;
      await account.update({
        balance: parseFloat(account.balance) + parseFloat(balanceChange)
      });

      console.log('Баланс счета обновлен:', account.balance, '->', parseFloat(account.balance) + parseFloat(balanceChange));
    }

    // Получаем созданную транзакцию с включенными данными
    const includeOptions = [
      {
        model: Account,
        as: 'account',
        include: [
          {
            model: Currency,
            as: 'currency',
          }
        ]
      },
      {
        model: Category,
        as: 'category',
      }
    ];

    // Для transfer добавляем целевой аккаунт
    if (transaction_type === 'transfer') {
      includeOptions.push({
        model: Account,
        as: 'targetAccount',
        include: [
          {
            model: Currency,
            as: 'currency',
          }
        ]
      });
    }

    const createdTransaction = await Transaction.findByPk(transaction.id, {
      include: includeOptions
    });

    res.status(201).json(createdTransaction);
  } catch (error) {
    console.error('Ошибка создания транзакции:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить транзакцию
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { account_id, category_id, amount, transaction_type, description } = req.body;

    const transaction = await Transaction.findOne({
      where: { id },
      include: [
        {
          model: Account,
          as: 'account',
          where: { user_id: req.user.id }
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Транзакция не найдена' });
    }

    // Сохраняем старые данные для отката баланса
    const oldAmount = transaction.amount;
    const oldTransactionType = transaction.transaction_type;
    const oldAccount = transaction.account;

    // Обновляем транзакцию
    await transaction.update({
      account_id: account_id || transaction.account_id,
      category_id: category_id || transaction.category_id,
      amount: amount ? parseFloat(amount) : transaction.amount,
      transaction_type: transaction_type || transaction.transaction_type,
      description: description !== undefined ? description : transaction.description,
    });

    // Пересчитываем баланс
    if (amount !== undefined || transaction_type !== undefined) {
      // Откатываем старую транзакцию
      const oldBalanceChange = oldTransactionType === 'income' ? -oldAmount : oldAmount;
      await oldAccount.update({
        balance: parseFloat(oldAccount.balance) + parseFloat(oldBalanceChange)
      });

      // Применяем новую транзакцию
      const newAccount = await Account.findByPk(account_id || transaction.account_id);
      const newBalanceChange = transaction.transaction_type === 'income' ? transaction.amount : -transaction.amount;
      await newAccount.update({
        balance: parseFloat(newAccount.balance) + parseFloat(newBalanceChange)
      });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Ошибка обновления транзакции:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удалить все транзакции по account_id  
router.delete('/account/:accountId/all', auth, async (req, res) => {
  try {
    const { accountId } = req.params;
    console.log('🗑️ Deleting transactions for account:', accountId);
    
    // Проверяем, что счет принадлежит пользователю
    const account = await Account.findOne({
      where: { id: accountId, user_id: req.user.id }
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Счет не найден' });
    }
    
    // Находим все транзакции по этому счету
    const transactions = await Transaction.findAll({
      where: { account_id: accountId },
      include: [
        {
          model: Account,
          as: 'account',
          where: { user_id: req.user.id }
        }
      ]
    });
    
    // Откатываем все изменения баланса и удаляем транзакции
    let totalBalanceChange = 0;
    for (const transaction of transactions) {
      const balanceChange = transaction.transaction_type === 'income' ? -transaction.amount : transaction.amount;
      totalBalanceChange += parseFloat(balanceChange);
      await transaction.destroy();
    }
    
    // Обновляем баланс счета
    await account.update({
      balance: parseFloat(account.balance) + totalBalanceChange
    });
    
    res.json({ 
      message: `Удалено ${transactions.length} транзакций`,
      deletedCount: transactions.length 
    });
  } catch (error) {
    console.error('Ошибка удаления транзакций по счету:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удалить транзакцию
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { id },
      include: [
        {
          model: Account,
          as: 'account',
          where: { user_id: req.user.id }
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Транзакция не найдена' });
    }

    // Откатываем изменение баланса
    const balanceChange = transaction.transaction_type === 'income' ? -transaction.amount : transaction.amount;
    await transaction.account.update({
      balance: parseFloat(transaction.account.balance) + parseFloat(balanceChange)
    });

    // Удаляем транзакцию
    await transaction.destroy();

    res.json({ message: 'Транзакция удалена' });
  } catch (error) {
    console.error('Ошибка удаления транзакции:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router; 