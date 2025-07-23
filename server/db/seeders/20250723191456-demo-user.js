'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Получаем USD валюту для установки по умолчанию
    const [currencies] = await queryInterface.sequelize.query(
      `SELECT id FROM "Currencies" WHERE code = 'USD' LIMIT 1;`
    );
    
    const usdId = currencies.length > 0 ? currencies[0].id : null;
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Создаем тестового пользователя
    await queryInterface.bulkInsert('Users', [{
      name: 'Test User',
      login: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      primary_currency_id: usdId,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'test@example.com' }, {});
  }
};