#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Устанавливаем production окружение
process.env.NODE_ENV = 'production';

console.log('🌱 Запуск создания демо данных на УДАЛЕННОЙ БД...');
console.log('🚨 ВНИМАНИЕ: Данные будут созданы в продакшн базе данных!');
console.log('');

// Спрашиваем подтверждение
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Вы уверены, что хотите создать демо данные в продакшн БД? (yes/no): ', (answer) => {
  rl.close();
  
  if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
    console.log('❌ Отменено пользователем');
    process.exit(0);
  }

  try {
    // Переходим в директорию сервера
    process.chdir(path.join(__dirname, '..'));
    
    console.log('📁 Текущая директория:', process.cwd());
    console.log('🌍 Окружение: PRODUCTION');
    
    // Запускаем исправленный сидер
    console.log('🚀 Выполняем сидер для создания демо пользователя...');
    execSync('npx sequelize-cli db:seed --seed 20250118-demo-user-data-fixed.js', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    console.log('\n✅ Демо данные успешно созданы в продакшн БД!');
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
});