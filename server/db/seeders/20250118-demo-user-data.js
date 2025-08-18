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
      phone: '+7 (900) 123-45-67',
      password: '$2b$10$LQv3c1yqBfVFaogkjPVtEOPP4RFZKDqY5xOoQY5oQoQY5oQY5oQY5', // demo123
      primary_currency_id: 1, // RUB
      country_id: 1, // Russia
      created_at: threeMonthsAgo,
      updated_at: now,
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
        created_at: threeMonthsAgo,
        updated_at: now,
      },
      {
        user_id: userId,
        account_type: 'debit_card',
        account_name: 'Дебетовая карта Сбербанк',
        currency_id: 1, // RUB
        balance: 150000.00,
        is_active: true,
        description: 'Основная дебетовая карта',
        created_at: threeMonthsAgo,
        updated_at: now,
      },
      {
        user_id: userId,
        account_type: 'credit_card',
        account_name: 'Кредитная карта Тинькофф',
        currency_id: 1, // RUB
        balance: -35000.00,
        is_active: true,
        description: 'Кредитная карта с долгом',
        created_at: threeMonthsAgo,
        updated_at: now,
      },
      {
        user_id: userId,
        account_type: 'bank_account',
        account_name: 'Накопительный счет',
        currency_id: 1, // RUB
        balance: 500000.00,
        is_active: true,
        description: 'Сбережения под процент',
        created_at: threeMonthsAgo,
        updated_at: now,
      },
      {
        user_id: userId,
        account_type: 'digital_wallet',
        account_name: 'Яндекс.Деньги',
        currency_id: 1, // RUB
        balance: 8500.00,
        is_active: true,
        description: 'Цифровой кошелек',
        created_at: threeMonthsAgo,
        updated_at: now,
      }
    ], { returning: true });

    // 3. Создаем 100+ транзакций за последние 3 месяца
    const transactions = [];
    const categories = await queryInterface.sequelize.query('SELECT * FROM "Categories" LIMIT 20', { type: Sequelize.QueryTypes.SELECT });
    
    // Функция для генерации случайной даты в пределах диапазона
    const randomDate = (start, end) => {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };

    // Генерируем исторические транзакции (100 штук)
    for (let i = 0; i < 100; i++) {
      const randomAccount = accounts[Math.floor(Math.random() * accounts.length)];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const isExpense = Math.random() > 0.3; // 70% расходов, 30% доходов
      const transactionDate = randomDate(threeMonthsAgo, now);
      
      let amount, transactionType;
      if (isExpense) {
        amount = -(Math.random() * 15000 + 100); // Расходы от 100 до 15100
        transactionType = 'expense';
      } else {
        amount = Math.random() * 50000 + 1000; // Доходы от 1000 до 51000
        transactionType = 'income';
      }

      transactions.push({
        user_id: userId,
        account_id: randomAccount.id,
        category_id: randomCategory.id,
        amount: Math.round(amount * 100) / 100, // Округляем до копеек
        transaction_type: transactionType,
        description: isExpense 
          ? `Покупка в категории ${randomCategory.category_name}` 
          : `Доход: ${randomCategory.category_name}`,
        transaction_date: transactionDate,
        status: 'posted',
        confirmed_at: transactionDate,
        created_at: transactionDate,
        updated_at: transactionDate,
      });
    }

    // Добавляем будущие транзакции (запланированные)
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 7); // Через неделю

    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 15); // Через 2 недели

    const futureDate3 = new Date();
    futureDate3.setMonth(futureDate3.getMonth() + 1); // Через месяц

    transactions.push(
      {
        user_id: userId,
        account_id: accounts[1].id, // Дебетовая карта
        category_id: categories.find(c => c.category_name === 'Зарплата')?.id || categories[0].id,
        amount: 85000.00,
        transaction_type: 'income',
        description: 'Зарплата за текущий месяц',
        transaction_date: futureDate1,
        status: 'scheduled',
        created_at: now,
        updated_at: now,
      },
      {
        user_id: userId,
        account_id: accounts[0].id, // Наличные
        category_id: categories.find(c => c.category_name === 'Коммунальные услуги')?.id || categories[1].id,
        amount: -8500.00,
        transaction_type: 'expense',
        description: 'Оплата коммунальных услуг',
        transaction_date: futureDate2,
        status: 'scheduled',
        created_at: now,
        updated_at: now,
      },
      {
        user_id: userId,
        account_id: accounts[2].id, // Кредитная карта
        category_id: categories.find(c => c.category_name === 'Развлечения')?.id || categories[2].id,
        amount: -25000.00,
        transaction_type: 'expense',
        description: 'Запланированный отпуск',
        transaction_date: futureDate3,
        status: 'scheduled',
        created_at: now,
        updated_at: now,
      }
    );

    await queryInterface.bulkInsert('Transactions', transactions);

    // 4. Создаем бюджеты (частично потраченные)
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

    // 5. Связываем бюджеты с категориями
    const budgetCategories = [];
    
    // Бюджет на продукты
    const foodCategory = categories.find(c => c.category_name === 'Продукты питания');
    if (foodCategory && budgets[0]) {
      budgetCategories.push({
        budget_id: budgets[0].id,
        category_id: foodCategory.id,
        created_at: now,
        updated_at: now,
      });
    }

    // Бюджет на развлечения
    const entertainmentCategory = categories.find(c => c.category_name === 'Развлечения');
    if (entertainmentCategory && budgets[1]) {
      budgetCategories.push({
        budget_id: budgets[1].id,
        category_id: entertainmentCategory.id,
        created_at: now,
        updated_at: now,
      });
    }

    // Бюджет на транспорт
    const transportCategory = categories.find(c => c.category_name === 'Транспорт');
    if (transportCategory && budgets[2]) {
      budgetCategories.push({
        budget_id: budgets[2].id,
        category_id: transportCategory.id,
        created_at: now,
        updated_at: now,
      });
    }

    await queryInterface.bulkInsert('BudgetCategories', budgetCategories);

    console.log('✅ Демо пользователь создан успешно!');
    console.log(`👤 Пользователь ID: ${userId}`);
    console.log(`💳 Создано ${accounts.length} аккаунтов`);
    console.log(`💸 Создано ${transactions.length} транзакций`);
    console.log(`📊 Создано ${budgets.length} бюджетов`);
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