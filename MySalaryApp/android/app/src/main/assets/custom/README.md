# Установка шрифтов Commissioner

## Шаг 1: Скачайте шрифты

Скачайте файлы шрифтов Commissioner с Google Fonts:
https://fonts.google.com/specimen/Commissioner

Необходимые файлы:
- Commissioner-Regular.ttf
- Commissioner-SemiBold.ttf 
- Commissioner-Bold.ttf

## Шаг 2: Поместите файлы в эту папку

Скачанные .ttf файлы поместите в папку `/assets/fonts/`

## Шаг 3: Настройка для iOS

1. Откройте проект в Xcode
2. Перетащите файлы шрифтов в папку проекта
3. Убедитесь, что они добавлены в "Copy Bundle Resources"
4. Файлы уже добавлены в Info.plist в секции UIAppFonts

## Шаг 4: Настройка для Android

Файлы шрифтов будут автоматически скопированы при сборке благодаря react-native.config.js

## Шаг 5: Пересоберите приложение

iOS:
```bash
cd ios && pod install
npm run ios
```

Android:
```bash
npm run android
```