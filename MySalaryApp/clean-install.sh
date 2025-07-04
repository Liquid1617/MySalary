#!/bin/bash

echo "🧹 Очистка кеша и зависимостей..."

# Очистка Node modules
rm -rf node_modules
rm -rf package-lock.json

# Очистка iOS
cd ios
rm -rf Pods
rm -rf Podfile.lock
rm -rf build
rm -rf DerivedData
cd ..

# Очистка Metro cache
npx react-native start --reset-cache &
sleep 3
pkill -f "react-native"

echo "📦 Переустановка зависимостей..."

# Установка Node dependencies
npm install

# Установка iOS dependencies
cd ios
pod install
cd ..

echo "✅ Готово! Попробуйте запустить проект." 