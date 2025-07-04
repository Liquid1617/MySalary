'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Categories', [
      // Категории расходов
      {
        category_type: 'expense',
        category_name: 'Продукты питания',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'expense',
        category_name: 'Транспорт',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'expense',
        category_name: 'Коммунальные услуги',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'expense',
        category_name: 'Развлечения',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'expense',
        category_name: 'Одежда и обувь',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'expense',
        category_name: 'Медицина и здоровье',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'expense',
        category_name: 'Образование',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'expense',
        category_name: 'Дом и быт',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'expense',
        category_name: 'Кредиты и займы',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'expense',
        category_name: 'Спорт и фитнес',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'expense',
        category_name: 'Путешествия',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'expense',
        category_name: 'Рестораны и кафе',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'expense',
        category_name: 'Бензин и парковка',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'expense',
        category_name: 'Красота и уход',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'expense',
        category_name: 'Подарки',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'expense',
        category_name: 'Прочие расходы',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Категории доходов
      {
        category_type: 'income',
        category_name: 'Зарплата',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'income',
        category_name: 'Премии и бонусы',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'income',
        category_name: 'Фриланс и подработка',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'income',
        category_name: 'Инвестиции и дивиденды',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'income',
        category_name: 'Продажи и торговля',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'income',
        category_name: 'Аренда и недвижимость',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'income',
        category_name: 'Пенсия и пособия',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'income',
        category_name: 'Стипендия',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'income',
        category_name: 'Подарки и наследство',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'income',
        category_name: 'Возврат налогов',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'income',
        category_name: 'Кэшбэк и бонусы',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_type: 'income',
        category_name: 'Прочие доходы',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {});
  }
}; 