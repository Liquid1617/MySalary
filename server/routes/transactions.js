const express = require('express');
const router = express.Router();
const { Transaction, Account, Category, Currency } = require('../db/models');
const auth = require('../middleware/auth');

// Получить все транзакции пользователя
router.get('/', auth, async (req, res) => {
  try {
    console.log('🔍 Fetching transactions with ORDER BY createdAt DESC');
    
    // Добавляем опциональную фильтрацию по дате и статусу
    const { excludeFuture, maxDate, status } = req.query;
    const whereConditions = { 
      user_id: req.user.id 
    };
    
    // Фильтрация по статусу
    if (status && ['scheduled', 'posted'].includes(status)) {
      whereConditions.status = status;
      console.log(`📊 Filtering transactions by status: ${status}`);
    }
    
    // Если запрошено исключение будущих транзакций или указана максимальная дата
    if (excludeFuture === 'true' || maxDate) {
      const { Op } = require('sequelize');
      const today = new Date().toISOString().slice(0, 10);
      const filterDate = maxDate || today;
      
      whereConditions.transaction_date = {
        [Op.lte]: filterDate
      };
      
      console.log(`📅 Filtering transactions up to: ${filterDate}`);
    }
    
    const transactions = await Transaction.findAll({
      where: whereConditions,
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
      order: [['transaction_date', 'DESC'], ['createdAt', 'DESC']], // Сортировка по дате транзакции, затем по времени создания
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
    const { account_id, category_id, amount, transaction_type, description, transfer_to, transaction_date } = req.body;
    
    console.log('Создание транзакции:', {
      user_id: req.user.id,
      account_id,
      category_id,
      amount,
      transaction_type,
      description,
      transfer_to,
      transaction_date
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

    // Валидация даты транзакции
    let transactionDate = transaction_date;
    if (transactionDate) {
      // Проверяем формат даты
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(transactionDate)) {
        return res.status(400).json({ message: 'Неверный формат даты. Используйте YYYY-MM-DD' });
      }
      
      // Разрешаем будущие даты для запланированных платежей
    } else {
      // Если дата не указана, используем сегодня
      transactionDate = new Date().toISOString().slice(0, 10);
    }

    // Определяем статус транзакции в зависимости от даты
    const today = new Date().toISOString().slice(0, 10);
    const isScheduled = transactionDate > today;
    
    console.log('\n=== TRANSACTION DATE ANALYSIS ===');
    console.log('Today:', today);
    console.log('Transaction date:', transactionDate);
    console.log('Is scheduled (future date)?:', isScheduled);
    console.log('===============================');
    
    // Подготавливаем данные для создания транзакции
    const transactionData = {
      user_id: req.user.id,
      account_id,
      amount: parseFloat(amount),
      transaction_type,
      description: description || '',
      transaction_date: transactionDate, // Используем валидированную дату
      status: isScheduled ? 'scheduled' : 'posted',
      confirmed_at: isScheduled ? null : new Date()
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

    console.log('\n=== TRANSACTION CREATED ===');
    console.log('ID:', transaction.id);
    console.log('Status:', transaction.status);
    console.log('Type:', transaction.transaction_type);
    console.log('Amount:', transaction.amount);
    console.log('Scheduled?:', transaction.status === 'scheduled');

    // Обновляем балансы только для posted транзакций (не scheduled)
    const shouldUpdateBalance = transaction.status === 'posted';
    console.log('shouldUpdateBalance:', shouldUpdateBalance);
    console.log('Account balance before updates:', account.balance);
    
    if (shouldUpdateBalance && transaction_type === 'transfer') {
      // Для transfer обновляем оба счёта
      const transferAmount = parseFloat(amount);
      
      // Списываем с исходного счёта
      // Для кредитных карт списание увеличивает баланс (долг)
      const sourceBalanceChange = account.account_type === 'credit_card' ? transferAmount : -transferAmount;
      await account.update({
        balance: parseFloat(account.balance) + sourceBalanceChange
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
      // Для кредитных карт зачисление уменьшает баланс (погашение долга)
      const targetBalanceChange = targetAccount.account_type === 'credit_card' ? -targetAmount : targetAmount;
      await targetAccount.update({
        balance: parseFloat(targetAccount.balance) + targetBalanceChange
      });

      console.log(`Transfer completed: ${account.account_name} (-${transferAmount} ${account.currency.code}) -> ${targetAccount.account_name} (+${targetAmount} ${targetAccount.currency.code})`);
    } else if (shouldUpdateBalance) {
      // Для обычных транзакций обновляем один счёт
      let balanceChange;
      
      // Для кредитных карт логика инвертирована:
      // - income (погашение долга) уменьшает баланс (долг)
      // - expense (использование кредита) увеличивает баланс (долг)
      if (account.account_type === 'credit_card') {
        balanceChange = transaction_type === 'income' ? -amount : amount;
      } else {
        // Для остальных счетов стандартная логика:
        // - income увеличивает баланс
        // - expense уменьшает баланс
        balanceChange = transaction_type === 'income' ? amount : -amount;
      }
      
      const oldBalance = parseFloat(account.balance);
      const newBalance = oldBalance + parseFloat(balanceChange);
      
      console.log(`CREATING ${transaction_type.toUpperCase()}: Account ${account.account_name} (${account.account_type})`);
      console.log(`  Balance before: ${oldBalance}`);
      console.log(`  Balance change: ${balanceChange}`);
      console.log(`  Balance after: ${newBalance}`);
      
      await account.update({
        balance: newBalance
      });

      console.log('✅ Баланс счета обновлен при создании:', oldBalance, '->', newBalance);
    } else {
      console.log('❌ Запланированная транзакция создана, баланс НЕ изменен');
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
    const { account_id, category_id, amount, transaction_type, description, transaction_date } = req.body;

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

    // Валидация даты транзакции если предоставлена
    if (transaction_date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(transaction_date)) {
        return res.status(400).json({ message: 'Неверный формат даты. Используйте YYYY-MM-DD' });
      }
      
      // Разрешаем будущие даты для запланированных платежей
    }

    // Определяем новый статус в зависимости от даты
    const today = new Date().toISOString().slice(0, 10);
    const newDate = transaction_date || transaction.transaction_date;
    const isScheduled = newDate > today;
    
    // Подготавливаем данные для обновления
    const updateData = {
      account_id: account_id || transaction.account_id,
      category_id: category_id || transaction.category_id,
      amount: amount ? parseFloat(amount) : transaction.amount,
      transaction_type: transaction_type || transaction.transaction_type,
      description: description !== undefined ? description : transaction.description,
      transaction_date: newDate,
      status: isScheduled ? 'scheduled' : 'posted',
      confirmed_at: isScheduled ? null : (transaction.confirmed_at || new Date())
    };

    // Обновляем транзакцию
    await transaction.update(updateData);

    // Пересчитываем баланс только для транзакций до сегодняшнего дня
    const oldWasActive = transaction.transaction_date <= today;
    const newWillBeActive = newDate <= today;
    
    if (amount !== undefined || transaction_type !== undefined || transaction_date !== undefined) {
      // Откатываем старую транзакцию если она была активной
      if (oldWasActive) {
        let oldBalanceChange;
        // Для кредитных карт инвертируем логику
        if (oldAccount.account_type === 'credit_card') {
          oldBalanceChange = oldTransactionType === 'income' ? oldAmount : -oldAmount;
        } else {
          oldBalanceChange = oldTransactionType === 'income' ? -oldAmount : oldAmount;
        }
        await oldAccount.update({
          balance: parseFloat(oldAccount.balance) + parseFloat(oldBalanceChange)
        });
      }

      // Применяем новую транзакцию если она активна
      if (newWillBeActive) {
        const newAccount = await Account.findByPk(account_id || transaction.account_id, {
          include: [{
            model: Currency,
            as: 'currency'
          }]
        });
        let newBalanceChange;
        // Для кредитных карт инвертируем логику
        if (newAccount.account_type === 'credit_card') {
          newBalanceChange = transaction.transaction_type === 'income' ? -transaction.amount : transaction.amount;
        } else {
          newBalanceChange = transaction.transaction_type === 'income' ? transaction.amount : -transaction.amount;
        }
        await newAccount.update({
          balance: parseFloat(newAccount.balance) + parseFloat(newBalanceChange)
        });
      }
      
      console.log(`Транзакция обновлена: старая активна=${oldWasActive}, новая активна=${newWillBeActive}`);
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
      let balanceChange;
      // Для кредитных карт инвертируем логику
      if (account.account_type === 'credit_card') {
        balanceChange = transaction.transaction_type === 'income' ? transaction.amount : -transaction.amount;
      } else {
        balanceChange = transaction.transaction_type === 'income' ? -transaction.amount : transaction.amount;
      }
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
    let balanceChange;
    // Для кредитных карт инвертируем логику
    if (transaction.account.account_type === 'credit_card') {
      balanceChange = transaction.transaction_type === 'income' ? transaction.amount : -transaction.amount;
    } else {
      balanceChange = transaction.transaction_type === 'income' ? -transaction.amount : transaction.amount;
    }
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

// Подтвердить scheduled транзакцию
router.patch('/:id/confirm', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { mode } = req.body;

    console.log(`\n=== CONFIRM TRANSACTION START ===`);
    console.log(`Transaction ID: ${id}`);
    console.log(`Mode: ${mode}`);
    console.log(`User ID: ${req.user.id}`);

    // Валидация параметра mode
    if (!mode || !['today', 'scheduledDate'].includes(mode)) {
      return res.status(400).json({ message: 'Параметр mode должен быть "today" или "scheduledDate"' });
    }

    // Находим транзакцию
    const transaction = await Transaction.findOne({
      where: { id },
      include: [
        {
          model: Account,
          as: 'account',
          where: { user_id: req.user.id },
          include: [{ model: Currency, as: 'currency' }]
        },
        {
          model: Account,
          as: 'targetAccount',
          required: false,
          include: [{ model: Currency, as: 'currency' }]
        }
      ]
    });

    console.log(`Found transaction:`, {
      id: transaction?.id,
      status: transaction?.status,
      type: transaction?.transaction_type,
      amount: transaction?.amount,
      account_balance_before: transaction?.account?.balance
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Транзакция не найдена' });
    }

    // Проверяем, что транзакция имеет статус scheduled
    if (transaction.status !== 'scheduled') {
      return res.status(400).json({ message: 'Транзакция уже подтверждена' });
    }

    const today = new Date().toISOString().slice(0, 10);
    const transactionDate = transaction.transaction_date;

    // Определяем новую дату в зависимости от mode
    let newDate = transactionDate;
    if (mode === 'today' && transactionDate > today) {
      newDate = today;
    }

    console.log(`Updating transaction status to posted...`);
    
    // Обновляем транзакцию
    await transaction.update({
      status: 'posted',
      confirmed_at: new Date(),
      transaction_date: newDate
    });

    console.log(`Transaction status updated. Current account balance: ${transaction.account.balance}`);

    // Обновляем балансы счетов при подтверждении scheduled транзакции
    console.log(`Starting balance update for ${transaction.transaction_type} transaction...`);
    if (transaction.transaction_type === 'transfer') {
      // Для transfer обновляем оба счёта
      const transferAmount = parseFloat(transaction.amount);
      
      // Списываем с исходного счёта
      await transaction.account.update({
        balance: parseFloat(transaction.account.balance) - transferAmount
      });

      // Конвертируем валюту если нужно
      let targetAmount = transferAmount;
      if (transaction.targetAccount && transaction.account.currency.code !== transaction.targetAccount.currency.code) {
        const exchangeRateService = require('../services/exchangeRate');
        try {
          targetAmount = await exchangeRateService.convertCurrency(
            transferAmount, 
            transaction.account.currency.code, 
            transaction.targetAccount.currency.code
          );
        } catch (convError) {
          console.error('Ошибка конвертации валюты:', convError);
          targetAmount = transferAmount; // Используем 1:1 если конвертация не удалась
        }
      }

      // Зачисляем на целевой счёт
      if (transaction.targetAccount) {
        await transaction.targetAccount.update({
          balance: parseFloat(transaction.targetAccount.balance) + targetAmount
        });
      }
      
      console.log(`Transfer подтвержден: ${transaction.account.account_name} (-${transferAmount}) -> ${transaction.targetAccount?.account_name} (+${targetAmount})`);
    } else if (transaction.transaction_type === 'income') {
      const oldBalance = parseFloat(transaction.account.balance);
      let newBalance;
      
      // Для кредитных карт income уменьшает баланс (погашение долга)
      if (transaction.account.account_type === 'credit_card') {
        newBalance = oldBalance - parseFloat(transaction.amount);
        console.log(`Income подтвержден (кредитная карта): ${transaction.account.account_name} ${oldBalance} -> ${newBalance} (погашение долга)`);
      } else {
        newBalance = oldBalance + parseFloat(transaction.amount);
        console.log(`Income подтвержден: ${transaction.account.account_name} +${transaction.amount}`);
      }
      
      await transaction.account.update({
        balance: newBalance
      });
    } else if (transaction.transaction_type === 'expense') {
      const oldBalance = parseFloat(transaction.account.balance);
      let newBalance;
      
      // Для кредитных карт expense увеличивает баланс (использование кредита)
      if (transaction.account.account_type === 'credit_card') {
        newBalance = oldBalance + parseFloat(transaction.amount);
        console.log(`Expense подтвержден (кредитная карта): ${transaction.account.account_name} ${oldBalance} -> ${newBalance} (использование кредита)`);
      } else {
        newBalance = oldBalance - parseFloat(transaction.amount);
        console.log(`Expense подтвержден: ${transaction.account.account_name} ${oldBalance} -> ${newBalance}`);
      }
      
      console.log(`${transaction.transaction_type.toUpperCase()}: Account ${transaction.account.account_name} (${transaction.account.account_type})`);
      console.log(`  Balance before: ${oldBalance}`);
      console.log(`  Transaction amount: ${transaction.amount}`);
      console.log(`  Balance after: ${newBalance}`);
      
      await transaction.account.update({
        balance: newBalance
      });
    }

    console.log(`=== CONFIRM TRANSACTION END ===\n`);

    // Возвращаем обновленную транзакцию
    const updatedTransaction = await Transaction.findByPk(id, {
      include: [
        {
          model: Account,
          as: 'account',
          include: [{ model: Currency, as: 'currency' }]
        },
        {
          model: Account,
          as: 'targetAccount',
          required: false,
          include: [{ model: Currency, as: 'currency' }]
        },
        {
          model: Category,
          as: 'category',
          required: false
        }
      ]
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Ошибка подтверждения транзакции:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Отменить подтверждение scheduled транзакции
router.patch('/:id/unconfirm', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Находим транзакцию
    const transaction = await Transaction.findOne({
      where: { id },
      include: [
        {
          model: Account,
          as: 'account',
          where: { user_id: req.user.id },
          include: [{ model: Currency, as: 'currency' }]
        },
        {
          model: Account,
          as: 'targetAccount',
          required: false,
          include: [{ model: Currency, as: 'currency' }]
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Транзакция не найдена' });
    }

    // Проверяем, что транзакция имеет статус posted
    if (transaction.status !== 'posted') {
      return res.status(400).json({ message: 'Транзакция не подтверждена' });
    }

    // Обновляем транзакцию обратно в scheduled
    await transaction.update({
      status: 'scheduled',
      confirmed_at: null
    });

    // Откатываем изменения балансов счетов
    if (transaction.transaction_type === 'transfer') {
      // Для transfer откатываем оба счёта
      const transferAmount = parseFloat(transaction.amount);
      
      // Возвращаем на исходный счёт
      await transaction.account.update({
        balance: parseFloat(transaction.account.balance) + transferAmount
      });

      // Конвертируем валюту если нужно
      let targetAmount = transferAmount;
      if (transaction.targetAccount && transaction.account.currency.code !== transaction.targetAccount.currency.code) {
        const exchangeRateService = require('../services/exchangeRate');
        try {
          targetAmount = await exchangeRateService.convertCurrency(
            transferAmount, 
            transaction.account.currency.code, 
            transaction.targetAccount.currency.code
          );
        } catch (convError) {
          console.error('Ошибка конвертации валюты:', convError);
          targetAmount = transferAmount; // Используем 1:1 если конвертация не удалась
        }
      }

      // Списываем с целевого счёта
      if (transaction.targetAccount) {
        await transaction.targetAccount.update({
          balance: parseFloat(transaction.targetAccount.balance) - targetAmount
        });
      }
    } else if (transaction.transaction_type === 'income') {
      // Откатываем income
      let balanceChange;
      if (transaction.account.account_type === 'credit_card') {
        // Для кредитных карт income уменьшал баланс, поэтому увеличиваем обратно
        balanceChange = parseFloat(transaction.amount);
      } else {
        // Для остальных счетов income увеличивал баланс, поэтому уменьшаем обратно
        balanceChange = -parseFloat(transaction.amount);
      }
      await transaction.account.update({
        balance: parseFloat(transaction.account.balance) + balanceChange
      });
    } else if (transaction.transaction_type === 'expense') {
      // Откатываем expense
      let balanceChange;
      if (transaction.account.account_type === 'credit_card') {
        // Для кредитных карт expense увеличивал баланс, поэтому уменьшаем обратно
        balanceChange = -parseFloat(transaction.amount);
      } else {
        // Для остальных счетов expense уменьшал баланс, поэтому увеличиваем обратно
        balanceChange = parseFloat(transaction.amount);
      }
      await transaction.account.update({
        balance: parseFloat(transaction.account.balance) + balanceChange
      });
    }

    // Возвращаем обновленную транзакцию
    const updatedTransaction = await Transaction.findByPk(id, {
      include: [
        {
          model: Account,
          as: 'account',
          include: [{ model: Currency, as: 'currency' }]
        },
        {
          model: Account,
          as: 'targetAccount',
          required: false,
          include: [{ model: Currency, as: 'currency' }]
        },
        {
          model: Category,
          as: 'category',
          required: false
        }
      ]
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Ошибка отмены подтверждения транзакции:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router; 