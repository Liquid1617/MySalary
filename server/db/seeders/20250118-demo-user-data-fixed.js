'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    // 1. Используем существующего демо пользователя с id=8
    const userId = 8;
    console.log(`🔄 Добавляем транзакции для существующего пользователя ID: ${userId}`);

    // 2. Получаем существующие аккаунты пользователя
    let accounts = await queryInterface.sequelize.query(
      'SELECT * FROM "Accounts" WHERE user_id = :userId',
      {
        replacements: { userId },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    // Если у пользователя нет аккаунтов, создаем их
    if (accounts.length === 0) {
      console.log('🏦 Создаем аккаунты для пользователя...');
      accounts = await queryInterface.bulkInsert('Accounts', [
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
    } else {
      console.log(`✅ Найдено ${accounts.length} существующих аккаунтов`);
    }

    // 3. Получаем категории для транзакций
    const categories = await queryInterface.sequelize.query('SELECT * FROM "Categories"', { type: Sequelize.QueryTypes.SELECT });
    const expenseCategories = categories.filter(c => c.category_type === 'expense');
    const incomeCategories = categories.filter(c => c.category_type === 'income');
    
    // Функция для генерации случайной даты в пределах диапазона
    const randomDate = (start, end) => {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };

    // Определяем типичные суммы для разных категорий
    const expenseAmountRanges = {
      'Продукты питания': { min: 300, max: 5000 },
      'Транспорт': { min: 50, max: 1500 },
      'Коммунальные услуги': { min: 3000, max: 15000 },
      'Развлечения': { min: 500, max: 8000 },
      'Одежда и обувь': { min: 1000, max: 20000 },
      'Медицина и здоровье': { min: 500, max: 10000 },
      'Образование': { min: 2000, max: 30000 },
      'Дом и быт': { min: 200, max: 5000 },
      'Кредиты и займы': { min: 5000, max: 50000 },
      'Спорт и фитнес': { min: 1500, max: 5000 },
      'Путешествия': { min: 10000, max: 100000 },
      'Рестораны и кафе': { min: 800, max: 5000 },
      'Бензин и парковка': { min: 500, max: 5000 },
      'Красота и уход': { min: 1000, max: 8000 },
      'Подарки': { min: 500, max: 10000 },
      'Прочие расходы': { min: 100, max: 5000 }
    };

    const incomeAmountRanges = {
      'Зарплата': { min: 50000, max: 150000 },
      'Премии и бонусы': { min: 10000, max: 50000 },
      'Фриланс и подработка': { min: 5000, max: 40000 },
      'Инвестиции и дивиденды': { min: 1000, max: 30000 },
      'Продажи и торговля': { min: 1000, max: 50000 },
      'Аренда и недвижимость': { min: 20000, max: 80000 },
      'Пенсия и пособия': { min: 10000, max: 30000 },
      'Стипендия': { min: 2000, max: 10000 },
      'Подарки и наследство': { min: 1000, max: 100000 },
      'Возврат налогов': { min: 5000, max: 50000 },
      'Кэшбэк и бонусы': { min: 100, max: 5000 },
      'Прочие доходы': { min: 500, max: 20000 }
    };

    // Определяем описания для разных категорий
    const expenseDescriptions = {
      'Продукты питания': ['Пятерочка', 'Перекресток', 'Ашан', 'Магнит', 'Вкусвилл', 'Metro Cash & Carry', 'Лента', 'Дикси'],
      'Транспорт': ['Яндекс.Такси', 'Uber', 'Метро', 'Автобус', 'Электричка', 'Каршеринг Делимобиль', 'Ситидрайв', 'БелкаКар'],
      'Коммунальные услуги': ['Квартплата', 'Электричество', 'Газ', 'Интернет Ростелеком', 'Мобильная связь МТС', 'Домофон', 'Водоснабжение'],
      'Развлечения': ['Кинотеатр КАРО', 'Концерт', 'Театр', 'Боулинг', 'Квест', 'Парк аттракционов', 'Аквапарк', 'Зоопарк'],
      'Одежда и обувь': ['H&M', 'Zara', 'Uniqlo', 'Спортмастер', 'Декатлон', 'Reserved', 'Mango', 'Массимо Дутти'],
      'Медицина и здоровье': ['Аптека Ригла', 'Поликлиника', 'Стоматология', 'Анализы Инвитро', 'Массаж', 'МРТ', 'УЗИ', 'Витамины'],
      'Образование': ['Курсы английского', 'Онлайн-курс Skillbox', 'Учебники', 'Репетитор', 'Автошкола', 'Семинар', 'Вебинар', 'Подписка Coursera'],
      'Дом и быт': ['IKEA', 'Леруа Мерлен', 'OBI', 'Хозтовары', 'Посуда', 'Бытовая химия', 'Товары для дома', 'Ремонт техники'],
      'Кредиты и займы': ['Ипотека Сбербанк', 'Кредит Тинькофф', 'Погашение кредитной карты', 'Займ другу', 'Автокредит', 'Потребительский кредит'],
      'Спорт и фитнес': ['Фитнес-клуб WorldClass', 'Бассейн', 'Йога', 'Тренажерный зал', 'Спортивное питание', 'Экипировка', 'Теннис'],
      'Путешествия': ['Авиабилеты Аэрофлот', 'Отель Booking', 'Airbnb', 'Туристическая страховка', 'Экскурсии', 'Виза', 'Трансфер'],
      'Рестораны и кафе': ['Шоколадница', 'Starbucks', 'KFC', 'Теремок', 'Вкусно и точка', 'Додо Пицца', 'Тануки', 'Якитория'],
      'Бензин и парковка': ['Лукойл', 'Газпромнефть', 'Shell', 'BP', 'Парковка центр', 'Платная парковка', 'Мойка авто', 'Техосмотр'],
      'Красота и уход': ['Парикмахерская', 'Маникюр', 'Косметолог', 'СПА', 'Солярий', 'Барбершоп', 'Косметика', 'Парфюмерия'],
      'Подарки': ['Подарок на день рождения', 'Свадебный подарок', 'Новогодний подарок', 'Цветы', 'Подарочный сертификат', 'Сувениры'],
      'Прочие расходы': ['Нотариус', 'Госпошлина', 'Штраф', 'Комиссия банка', 'Страховка', 'Подписка', 'Благотворительность']
    };

    const incomeDescriptions = {
      'Зарплата': ['Зарплата за месяц', 'Аванс', 'Основная зарплата', 'Зарплата с премией'],
      'Премии и бонусы': ['Квартальная премия', 'Годовой бонус', '13-я зарплата', 'Премия за проект', 'Бонус за KPI'],
      'Фриланс и подработка': ['Проект для клиента', 'Консультация', 'Разработка сайта', 'Дизайн логотипа', 'Написание статей', 'Переводы'],
      'Инвестиции и дивиденды': ['Дивиденды Сбербанк', 'Доход от акций', 'Проценты по вкладу', 'Купонный доход', 'Продажа акций'],
      'Продажи и торговля': ['Продажа на Авито', 'Продажа старой техники', 'Продажа одежды', 'Handmade изделия', 'Продажа авто'],
      'Аренда и недвижимость': ['Аренда квартиры', 'Сдача комнаты', 'Аренда гаража', 'Сдача дачи', 'Коммерческая недвижимость'],
      'Пенсия и пособия': ['Пенсия', 'Пособие по безработице', 'Детское пособие', 'Социальная выплата', 'Материнский капитал'],
      'Стипендия': ['Стипендия за учебу', 'Повышенная стипендия', 'Стипендия за научную работу', 'Грант'],
      'Подарки и наследство': ['Подарок от родителей', 'Денежный подарок на свадьбу', 'Наследство', 'Подарок на день рождения'],
      'Возврат налогов': ['Налоговый вычет за квартиру', 'Вычет за обучение', 'Вычет за лечение', 'Возврат НДС', '3-НДФЛ'],
      'Кэшбэк и бонусы': ['Кэшбэк Тинькофф', 'Бонусы Спасибо', 'Кэшбэк за покупки', 'Мили Аэрофлот', 'Баллы лояльности'],
      'Прочие доходы': ['Выигрыш в лотерею', 'Находка', 'Компенсация', 'Возврат долга', 'Страховая выплата']
    };

    // 4. Создаем 200 транзакций за последние 3 месяца с равномерным распределением по категориям
    const transactions = [];
    
    // Создаем транзакции для каждой категории расходов
    for (const category of expenseCategories) {
      const range = expenseAmountRanges[category.category_name] || { min: 100, max: 5000 };
      const descriptions = expenseDescriptions[category.category_name] || ['Расход'];
      
      // 5-8 транзакций на категорию
      const transactionCount = Math.floor(Math.random() * 4) + 5;
      
      for (let i = 0; i < transactionCount; i++) {
        const randomAccount = accounts[Math.floor(Math.random() * accounts.length)];
        const transactionDate = randomDate(threeMonthsAgo, now);
        const amount = Math.random() * (range.max - range.min) + range.min;
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];
        
        transactions.push({
          user_id: userId,
          account_id: randomAccount.id,
          category_id: category.id,
          amount: Math.round(amount * 100) / 100,
          transaction_type: 'expense',
          description: description,
          transaction_date: transactionDate.toISOString().split('T')[0],
          status: 'posted',
          confirmed_at: transactionDate,
          createdAt: transactionDate,
          updatedAt: transactionDate,
        });
      }
    }
    
    // Создаем транзакции для каждой категории доходов
    for (const category of incomeCategories) {
      const range = incomeAmountRanges[category.category_name] || { min: 1000, max: 20000 };
      const descriptions = incomeDescriptions[category.category_name] || ['Доход'];
      
      // 2-4 транзакции на категорию (доходов обычно меньше)
      const transactionCount = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < transactionCount; i++) {
        const randomAccount = accounts[Math.floor(Math.random() * accounts.length)];
        const transactionDate = randomDate(threeMonthsAgo, now);
        const amount = Math.random() * (range.max - range.min) + range.min;
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];
        
        transactions.push({
          user_id: userId,
          account_id: randomAccount.id,
          category_id: category.id,
          amount: Math.round(amount * 100) / 100,
          transaction_type: 'income',
          description: description,
          transaction_date: transactionDate.toISOString().split('T')[0],
          status: 'posted',
          confirmed_at: transactionDate,
          createdAt: transactionDate,
          updatedAt: transactionDate,
        });
      }
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

    // 5. Проверяем существующие бюджеты и создаем новые при необходимости
    const existingBudgets = await queryInterface.sequelize.query(
      'SELECT * FROM "Budgets" WHERE user_id = :userId',
      {
        replacements: { userId },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    let budgets = existingBudgets;
    if (existingBudgets.length === 0) {
      console.log('💰 Создаем бюджеты для пользователя...');
      budgets = await queryInterface.bulkInsert('Budgets', [
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
    } else {
      console.log(`✅ Найдено ${existingBudgets.length} существующих бюджетов`);
    }

    // 6. Связываем бюджеты с категориями через BudgetCategories
    const budgetCategories = [];
    
    // Проверяем существующие связи бюджет-категория
    const existingBudgetCategories = await queryInterface.sequelize.query(
      'SELECT * FROM "BudgetCategories" WHERE budget_id IN (SELECT id FROM "Budgets" WHERE user_id = :userId)',
      {
        replacements: { userId },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    // Создаем связи только если их еще нет
    if (existingBudgetCategories.length === 0 && budgets.length > 0 && expenseCategories.length > 0) {
      console.log('🔗 Создаем связи бюджет-категория...');
      // Связываем каждый бюджет с подходящей категорией
      for (let i = 0; i < Math.min(budgets.length, expenseCategories.length); i++) {
        budgetCategories.push({
          budget_id: budgets[i].id,
          category_id: expenseCategories[i].id,
          created_at: now,
          updated_at: now,
        });
      }
      
      if (budgetCategories.length > 0) {
        await queryInterface.bulkInsert('BudgetCategories', budgetCategories);
      }
    } else {
      console.log(`✅ Найдено ${existingBudgetCategories.length} существующих связей бюджет-категория`);
    }

    console.log('\n✅ Данные для демо пользователя добавлены успешно!');
    console.log(`👤 Пользователь ID: ${userId}`);
    console.log(`💳 Аккаунтов: ${accounts.length}`);
    console.log(`💸 Добавлено ${transactions.length} транзакций`);
    console.log(`📊 Бюджетов: ${budgets.length}`);
    console.log(`🔗 Связей бюджет-категория: ${budgetCategories.length}`);
    console.log(`📈 Использовано категорий расходов: ${expenseCategories.length}`);
    console.log(`💰 Использовано категорий доходов: ${incomeCategories.length}`);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем только транзакции, созданные этим сидом (оставляем пользователя и аккаунты)
    const userId = 8;
    console.log(`\n🗑️  Удаляем транзакции для пользователя ID: ${userId}`);
    
    // Удаляем только транзакции (оставляем пользователя, аккаунты и бюджеты)
    await queryInterface.bulkDelete('Transactions', { user_id: userId });
    
    console.log('✅ Транзакции удалены');
  }
};