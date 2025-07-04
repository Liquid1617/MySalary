'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Currencies', [
      {
        code: 'RUB',
        name: 'Российский рубль',
        symbol: '₽',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'USD',
        name: 'Доллар США',
        symbol: '$',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'EUR',
        name: 'Евро',
        symbol: '€',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'GBP',
        name: 'Фунт стерлингов',
        symbol: '£',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CNY',
        name: 'Китайский юань',
        symbol: '¥',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'KZT',
        name: 'Казахский тенге',
        symbol: '₸',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BYN',
        name: 'Белорусский рубль',
        symbol: 'Br',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'UAH',
        name: 'Украинская гривна',
        symbol: '₴',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Currencies', null, {});
  }
}; 