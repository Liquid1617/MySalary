'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Countries', [
      {
        code: 'RU',
        name: 'Россия',
        currency_id: 1, // RUB
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'US',
        name: 'США',
        currency_id: 2, // USD
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'DE',
        name: 'Германия',
        currency_id: 3, // EUR
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'FR',
        name: 'Франция',
        currency_id: 3, // EUR
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'GB',
        name: 'Великобритания',
        currency_id: 4, // GBP
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CN',
        name: 'Китай',
        currency_id: 5, // CNY
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'KZ',
        name: 'Казахстан',
        currency_id: 6, // KZT
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BY',
        name: 'Беларусь',
        currency_id: 7, // BYN
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'UA',
        name: 'Украина',
        currency_id: 8, // UAH
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'IT',
        name: 'Италия',
        currency_id: 3, // EUR
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ES',
        name: 'Испания',
        currency_id: 3, // EUR
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CA',
        name: 'Канада',
        currency_id: 2, // USD (можно добавить CAD отдельно)
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Countries', null, {});
  }
}; 