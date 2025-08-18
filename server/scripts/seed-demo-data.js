#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🌱 Запуск создания демо данных...\n');

try {
  // Переходим в директорию сервера
  process.chdir(path.join(__dirname, '..'));
  
  console.log('📁 Текущая директория:', process.cwd());
  
  // Запускаем конкретный сидер для продакшн БД
  console.log('🚀 Выполняем сидер для создания демо пользователя на удаленной БД...');
  execSync('NODE_ENV=production npx sequelize-cli db:seed --seed 20250118-demo-user-data.js', { 
    stdio: 'inherit' 
  });
  
  console.log('\n✅ Демо данные успешно созданы!');
  console.log('\n📋 Что было создано:');
  console.log('👤 Демо пользователь: demo_user / demo123');
  console.log('💳 5 аккаунтов разных типов с деньгами');
  console.log('💸 100+ транзакций за последние 3 месяца');
  console.log('⏰ Несколько запланированных транзакций');
  console.log('📊 3 бюджета с категориями (частично потраченные)');
  console.log('\n🔑 Данные для входа:');
  console.log('Login: demo_user');
  console.log('Password: demo123');
  
} catch (error) {
  console.error('❌ Ошибка при создании демо данных:', error.message);
  process.exit(1);
}