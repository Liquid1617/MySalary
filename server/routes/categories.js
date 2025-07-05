const express = require('express');
const router = express.Router();
const { Category } = require('../db/models');

// Вспомогательные функции для иконок и цветов
const getIconForCategory = (categoryName) => {
  const iconMap = {
    'Зарплата': '💰',
    'Подарки': '🎁',
    'Фриланс': '💼',
    'Инвестиции': '📈',
    'Еда': '🍔',
    'Транспорт': '🚗',
    'Жилье': '🏠',
    'Развлечения': '🎮',
    'Одежда': '👕',
    'Здоровье': '💊',
    'Образование': '📚',
    'Покупки': '🛒'
  };
  return iconMap[categoryName] || '📁';
};

const getColorForCategory = (categoryType) => {
  return categoryType === 'income' ? '#4CAF50' : '#F44336';
};

// Middleware для проверки авторизации (упрощенная версия)
const authenticateUser = (req, res, next) => {
  const userId = req.headers['user-id'] || 9; // Для демо используем ID 9
  req.userId = userId;
  next();
};

// GET /api/categories - получить все категории
router.get('/', authenticateUser, async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'category_name', 'category_type'],
      order: [['category_type', 'ASC'], ['category_name', 'ASC']]
    });

    // Преобразуем данные для клиента
    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.category_name,
      type: cat.category_type,
      icon: getIconForCategory(cat.category_name),
      color: getColorForCategory(cat.category_type)
    }));

    res.json({
      success: true,
      data: formattedCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении категорий',
      error: error.message
    });
  }
});

// GET /api/categories/by-type/:type - получить категории по типу (income/expense)
router.get('/by-type/:type', authenticateUser, async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Неверный тип категории. Используйте income или expense'
      });
    }

    const categories = await Category.findAll({
      where: { category_type: type },
      attributes: ['id', 'category_name', 'category_type'],
      order: [['category_name', 'ASC']]
    });

    // Преобразуем данные для клиента
    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.category_name,
      type: cat.category_type,
      icon: getIconForCategory(cat.category_name),
      color: getColorForCategory(cat.category_type)
    }));

    res.json({
      success: true,
      data: formattedCategories
    });
  } catch (error) {
    console.error('Error fetching categories by type:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении категорий',
      error: error.message
    });
  }
});

module.exports = router; 