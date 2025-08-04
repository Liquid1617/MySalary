const express = require('express');
const router = express.Router();
const { Category } = require('../db/models');
const auth = require('../middleware/auth');

// Получить все категории (системные + пользовательские)
router.get('/', auth, async (req, res) => {
  try {
    const { Op } = require('sequelize');
    
    // Получаем системные категории и пользовательские категории
    const categories = await Category.findAll({
      where: {
        [Op.or]: [
          { is_system: true },
          { user_id: req.user.id }
        ]
      },
      order: [
        ['is_system', 'DESC'], // Системные категории первыми
        ['category_type', 'ASC'],
        ['category_name', 'ASC']
      ],
    });
    
    // Преобразуем данные для фронтенда
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.category_name,
      type: category.category_type,
      icon: category.icon || (category.category_type === 'income' ? 'arrow-up' : 'arrow-down'),
      color: category.color || (category.category_type === 'income' ? '#10B981' : '#EF4444'),
      is_system: category.is_system,
      user_id: category.user_id,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }));
    
    res.json(formattedCategories);
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создать новую пользовательскую категорию
router.post('/', auth, async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Название и тип категории обязательны' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Тип категории должен быть income или expense' });
    }

    if (!icon) {
      return res.status(400).json({ message: 'Иконка категории обязательна' });
    }

    // Проверяем, что такая категория у пользователя еще не существует
    const existingCategory = await Category.findOne({
      where: {
        category_name: name,
        category_type: type,
        user_id: req.user.id
      }
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Категория с таким названием уже существует' });
    }

    const category = await Category.create({
      category_name: name,
      category_type: type,
      icon: icon,
      color: color || (type === 'income' ? '#10B981' : '#EF4444'),
      user_id: req.user.id,
      is_system: false
    });

    // Возвращаем отформатированный ответ
    const formattedCategory = {
      id: category.id,
      name: category.category_name,
      type: category.category_type,
      icon: category.icon,
      color: category.color,
      is_system: false,
      user_id: category.user_id,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };

    res.status(201).json(formattedCategory);
  } catch (error) {
    console.error('Ошибка создания категории:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Категория с таким названием уже существует' });
    }
    
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить пользовательскую категорию
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, icon, color } = req.body;

    const category = await Category.findOne({
      where: {
        id: id,
        user_id: req.user.id, // Можно редактировать только свои категории
        is_system: false // Системные категории нельзя редактировать
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена или недоступна для редактирования' });
    }

    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Тип категории должен быть income или expense' });
    }

    // Проверяем уникальность нового названия
    if (name && name !== category.category_name) {
      const existingCategory = await Category.findOne({
        where: {
          category_name: name,
          category_type: type || category.category_type,
          user_id: req.user.id,
          id: { [require('sequelize').Op.ne]: id }
        }
      });

      if (existingCategory) {
        return res.status(400).json({ message: 'Категория с таким названием уже существует' });
      }
    }

    await category.update({
      category_name: name || category.category_name,
      category_type: type || category.category_type,
      icon: icon || category.icon,
      color: color || category.color,
    });

    // Возвращаем отформатированный ответ
    const formattedCategory = {
      id: category.id,
      name: category.category_name,
      type: category.category_type,
      icon: category.icon,
      color: category.color,
      is_system: false,
      user_id: category.user_id,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };

    res.json(formattedCategory);
  } catch (error) {
    console.error('Ошибка обновления категории:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удалить пользовательскую категорию
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: {
        id: id,
        user_id: req.user.id, // Можно удалять только свои категории
        is_system: false // Системные категории нельзя удалять
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена или недоступна для удаления' });
    }

    // Проверяем, используется ли категория в транзакциях
    const { Transaction } = require('../db/models');
    const transactionCount = await Transaction.count({
      where: { category_id: id }
    });

    if (transactionCount > 0) {
      return res.status(400).json({ 
        message: `Категория используется в ${transactionCount} транзакциях и не может быть удалена` 
      });
    }

    await category.destroy();

    res.json({ message: 'Категория удалена' });
  } catch (error) {
    console.error('Ошибка удаления категории:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить доступные иконки
router.get('/icons', (req, res) => {
  const icons = {
    income: [
      'money-bill-wave', 'coins', 'piggy-bank', 'chart-line', 'hand-holding-usd',
      'gift', 'graduation-cap', 'home', 'laptop', 'handshake', 'shield-alt',
      'file-invoice-dollar', 'credit-card', 'plus-circle', 'arrow-up'
    ],
    expense: [
      'shopping-cart', 'car', 'bolt', 'gamepad', 'tshirt', 'heartbeat',
      'graduation-cap', 'home', 'credit-card', 'dumbbell', 'plane', 'utensils',
      'gas-pump', 'spa', 'gift', 'phone', 'wifi', 'dog', 'cat', 'music',
      'book', 'film', 'camera', 'coffee', 'beer', 'hamburger', 'pizza-slice',
      'birthday-cake', 'cut', 'brush', 'palette', 'tools', 'wrench',
      'hammer', 'paint-roller', 'leaf', 'tree', 'seedling', 'paw',
      'stethoscope', 'pills', 'syringe', 'glasses', 'eye', 'tooth',
      'baby', 'child', 'female', 'male', 'users', 'user-friends',
      'shopping-bag', 'store', 'building', 'university', 'hospital',
      'church', 'mosque', 'synagogue', 'ellipsis-h', 'arrow-down'
    ]
  };

  res.json(icons);
});

module.exports = router; 