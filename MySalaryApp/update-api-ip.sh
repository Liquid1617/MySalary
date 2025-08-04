#!/bin/bash

# Скрипт для автоматического обновления IP-адреса в конфигурации API

echo "🔍 Определение текущего IP-адреса..."

# Получаем текущий IP (исключаем localhost)
CURRENT_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

if [ -z "$CURRENT_IP" ]; then
    echo "❌ Не удалось определить IP-адрес"
    exit 1
fi

echo "📡 Текущий IP: $CURRENT_IP"

# Путь к конфигурационному файлу
CONFIG_FILE="src/config/api.ts"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Файл конфигурации не найден: $CONFIG_FILE"
    exit 1
fi

# Создаем резервную копию
cp "$CONFIG_FILE" "$CONFIG_FILE.backup"
echo "💾 Создана резервная копия: $CONFIG_FILE.backup"

# Обновляем IP в файле конфигурации
sed -i.tmp "s|BASE_URL: 'http://[0-9]\+\.[0-9]\+\.[0-9]\+\.[0-9]\+:3001/api'|BASE_URL: 'http://$CURRENT_IP:3001/api'|g" "$CONFIG_FILE"

# Удаляем временный файл
rm "$CONFIG_FILE.tmp" 2>/dev/null

echo "✅ IP-адрес обновлен в $CONFIG_FILE"
echo "🔗 Новый URL: http://$CURRENT_IP:3001/api"

# Проверяем доступность сервера
echo "🧪 Проверка подключения к серверу..."
if curl -s "http://$CURRENT_IP:3001/api/countries" > /dev/null; then
    echo "✅ Сервер доступен!"
else
    echo "❌ Сервер недоступен. Проверьте, что сервер запущен на порту 3001"
    echo "💡 Восстанавливаем резервную копию..."
    mv "$CONFIG_FILE.backup" "$CONFIG_FILE"
    exit 1
fi

# Удаляем резервную копию если все успешно
rm "$CONFIG_FILE.backup"

echo "🎉 Конфигурация API успешно обновлена!"
echo "🔄 Перезапустите приложение для применения изменений"