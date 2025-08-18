'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    // 1. Создаем демо пользователя (созданного 3 месяца назад)
    const [demoUser] = await queryInterface.bulkInsert('Users', [{
      name: 'Демо Пользователь',
      login: 'demo_user',
      email: 'demo@example.com',
      phone: '+79001234567',
      password: '$2b$10$LQv3c1yqBfVFaogkjPVtEOPP4RFZKDqY5xOoQY5oQoQY5oQY5oQY5', // demo123
      primary_currency_id: 1, // RUB
      country_id: 1, // Russia
      createdAt: threeMonthsAgo,
      updatedAt: now,
    }], { returning: true });

    const userId = demoUser.id;

    // 2. Создаем 5 аккаунтов разного типа с деньгами
    const accounts = await queryInterface.bulkInsert('Accounts', [
      {
        user_id: userId,
        account_type: 'cash',
        account_name: 'Наличные',
        currency_id: 1, // RUB
        balance: 25000.00,
        is_active: true,
        description: 'Кошелек с наличными',
        createdAt: threeMonthsAgo,
        updatedAt: now,
      },
      {
        user_id: userId,
        account_type: 'debit_card',
        account_name: 'Дебетовая карта Сбербанк',
        currency_id: 1, // RUB
        balance: 150000.00,
        is_active: true,
        description: 'Основная дебетовая карта',
        createdAt: threeMonthsAgo,
        updatedAt: now,
      },
      {
        user_id: userId,
        account_type: 'credit_card',
        account_name: 'Кредитная карта Тинькофф',
        currency_id: 1, // RUB
        balance: -35000.00,
        is_active: true,
        description: 'Кредитная карта с долгом',
        createdAt: threeMonthsAgo,
        updatedAt: now,
      },
      {
        user_id: userId,
        account_type: 'bank_account',
        account_name: 'Накопительный счет',
        currency_id: 1, // RUB
        balance: 500000.00,
        is_active: true,
        description: 'Сбережения под процент',
        createdAt: threeMonthsAgo,
        updatedAt: now,
      },
      {
        user_id: userId,
        account_type: 'digital_wallet',
        account_name: 'Яндекс.Деньги',
        currency_id: 1, // RUB
        balance: 8500.00,
        is_active: true,
        description: 'Цифровой кошелек',
        createdAt: threeMonthsAgo,
        updatedAt: now,
      }
    ], { returning: true });

    // 3. Получаем категории для транзакций
    const categories = await queryInterface.sequelize.query('SELECT * FROM "Categories" WHERE "is_system" = true LIMIT 20', { type: Sequelize.QueryTypes.SELECT });
    
    // Функция для генерации случайной даты в пределах диапазона
    const randomDate = (start, end) => {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };

    // 4. Создаем 100+ транзакций за последние 3 месяца
    const transactions = [];
    for (let i = 0; i < 100; i++) {
      const randomAccount = accounts[Math.floor(Math.random() * accounts.length)];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const isExpense = Math.random() > 0.3; // 70% расходов, 30% доходов
      const transactionDate = randomDate(threeMonthsAgo, now);
      
      let amount, transactionType, categoryId;
      if (isExpense) {
        amount = Math.random() * 15000 + 100; // Расходы от 100 до 15100 (ПОЛОЖИТЕЛЬНЫЕ!)
        transactionType = 'expense';
        categoryId = categories.find(c => c.category_type === 'expense')?.id || randomCategory.id;
      } else {
        amount = Math.random() * 50000 + 1000; // Доходы от 1000 до 51000 (положительные)
        transactionType = 'income';
        categoryId = categories.find(c => c.category_type === 'income')?.id || randomCategory.id;
      }

      transactions.push({
        user_id: userId,
        account_id: randomAccount.id,
        category_id: categoryId,
        amount: Math.round(amount * 100) / 100, // Округляем до копеек
        transaction_type: transactionType,
        description: isExpense 
          ? `Покупка в категории ${randomCategory.category_name}` 
          : `Доход: ${randomCategory.category_name}`,
        transaction_date: transactionDate.toISOString().split('T')[0], // DATEONLY format
        status: 'posted',
        confirmed_at: transactionDate,
        createdAt: transactionDate,
        updatedAt: transactionDate,
      });
    }

    // Добавляем будущие транзакции (запланированные)
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 7); // Через неделю

    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 15); // Через 2 недели

    const futureDate3 = new Date();
    futureDate3.setMonth(futureDate3.getMonth() + 1); // Через месяц

    const incomeCategory = categories.find(c => c.category_type === 'income');
    const expenseCategory = categories.find(c => c.category_type === 'expense');

    transactions.push(
      {
        user_id: userId,
        account_id: accounts[1].id, // Дебетовая карта
        category_id: incomeCategory?.id || categories[0].id,
        amount: 85000.00,
        transaction_type: 'income',
        description: 'Зарплата за текущий месяц',
        transaction_date: futureDate1.toISOString().split('T')[0],
        status: 'scheduled',
        createdAt: now,
        updatedAt: now,
      },
      {
        user_id: userId,
        account_id: accounts[0].id, // Наличные
        category_id: expenseCategory?.id || categories[1].id,
        amount: 8500.00,
        transaction_type: 'expense',
        description: 'Оплата коммунальных услуг',
        transaction_date: futureDate2.toISOString().split('T')[0],
        status: 'scheduled',
        createdAt: now,
        updatedAt: now,
      },
      {
        user_id: userId,
        account_id: accounts[2].id, // Кредитная карта
        category_id: expenseCategory?.id || categories[2].id,
        amount: 25000.00,
        transaction_type: 'expense',
        description: 'Запланированный отпуск',
        transaction_date: futureDate3.toISOString().split('T')[0],
        status: 'scheduled',
        createdAt: now,
        updatedAt: now,
      }
    );

    await queryInterface.bulkInsert('Transactions', transactions);

    // 5. Создаем бюджеты (новая структура)
    const budgets = await queryInterface.bulkInsert('Budgets', [
      {
        user_id: userId,
        name: 'Бюджет на продукты',
        limit_amount: 30000.00,
        currency: 'RUB',
        period_type: 'month',
        rollover: false,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        user_id: userId,
        name: 'Развлечения и досуг',
        limit_amount: 15000.00,
        currency: 'RUB',
        period_type: 'month',
        rollover: true,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        user_id: userId,
        name: 'Транспортные расходы',
        limit_amount: 8000.00,
        currency: 'RUB',
        period_type: 'week',
        rollover: false,
        is_active: true,
        created_at: now,
        updated_at: now,
      }
    ], { returning: true });

    // 6. Связываем бюджеты с категориями через BudgetCategories
    const budgetCategories = [];
    
    // Пытаемся найти подходящие категории по именам
    const expenseCategories = categories.filter(c => c.category_type === 'expense');
    
    if (budgets.length > 0 && expenseCategories.length > 0) {
      // Связываем каждый бюджет с подходящей категорией
      for (let i = 0; i < Math.min(budgets.length, expenseCategories.length); i++) {
        budgetCategories.push({
          budget_id: budgets[i].id,
          category_id: expenseCategories[i].id,
          created_at: now,
          updated_at: now,
        });
      }
    }

    if (budgetCategories.length > 0) {
      await queryInterface.bulkInsert('BudgetCategories', budgetCategories);
    }

    console.log('✅ Демо пользователь создан успешно!');
    console.log(`👤 Пользователь ID: ${userId}`);
    console.log(`💳 Создано ${accounts.length} аккаунтов`);
    console.log(`💸 Создано ${transactions.length} транзакций`);
    console.log(`📊 Создано ${budgets.length} бюджетов`);
    console.log(`🔗 Создано ${budgetCategories.length} связей бюджет-категория`);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем все данные демо пользователя
    const demoUser = await queryInterface.sequelize.query(
      'SELECT id FROM "Users" WHERE login = ? LIMIT 1',
      {
        replacements: ['demo_user'],
        type: Sequelize.QueryTypes.SELECT
      }
    );

    if (demoUser.length > 0) {
      const userId = demoUser[0].id;
      
      // Удаляем в правильном порядке (из-за foreign keys)
      await queryInterface.bulkDelete('BudgetCategories', {
        budget_id: {
          [Sequelize.Op.in]: queryInterface.sequelize.literal(
            `(SELECT id FROM "Budgets" WHERE user_id = ${userId})`
          )
        }
      });
      
      await queryInterface.bulkDelete('Transactions', { user_id: userId });
      await queryInterface.bulkDelete('Budgets', { user_id: userId });
      await queryInterface.bulkDelete('Accounts', { user_id: userId });
      await queryInterface.bulkDelete('Users', { id: userId });
      
      console.log('✅ Демо данные удалены');
    }
  }
};