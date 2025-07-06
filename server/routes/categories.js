const express = require('express');
const router = express.Router();
const { Category } = require('../db/models');
const auth = require('../middleware/auth');

// Получить все категории
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['category_name', 'ASC']],
    });
    
    // Преобразуем данные для фронтенда с подходящими иконками
    const formattedCategories = categories.map(category => {
      let icon = '💰';
      let color = category.category_type === 'income' ? '#28a745' : '#dc3545';
      
      // Устанавливаем иконки в зависимости от названия категории
      const name = category.category_name.toLowerCase();
      if (name.includes('зарплата')) icon = '💰';
      else if (name.includes('продукты') || name.includes('питание')) icon = '🛒';
      else if (name.includes('транспорт')) icon = '🚗';
      else if (name.includes('коммунальные')) icon = '🏠';
      else if (name.includes('развлечения')) icon = '🎬';
      else if (name.includes('одежда')) icon = '👕';
      else if (name.includes('медицина') || name.includes('здоровье')) icon = '⚕️';
      else if (name.includes('образование')) icon = '📚';
      else if (name.includes('дом') || name.includes('быт')) icon = '🏠';
      else if (name.includes('кредит') || name.includes('займ')) icon = '💳';
      else if (name.includes('спорт') || name.includes('фитнес')) icon = '🏋️';
      else if (name.includes('путешествия')) icon = '✈️';
      else if (name.includes('ресторан') || name.includes('кафе')) icon = '🍽️';
      else if (name.includes('бензин') || name.includes('парковка')) icon = '⛽';
      else if (name.includes('красота') || name.includes('уход')) icon = '💄';
      else if (name.includes('подарки')) icon = '🎁';
      else if (name.includes('прочие')) icon = '💸';
      
      return {
        id: category.id,
        name: category.category_name,
        type: category.category_type,
        icon: icon,
        color: color,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      };
    });
    
    res.json(formattedCategories);
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создать новую категорию
router.post('/', auth, async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Название и тип категории обязательны' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Тип категории должен быть income или expense' });
    }

    const category = await Category.create({
      category_name: name,
      category_type: type,
    });

    // Возвращаем отформатированный ответ
    const formattedCategory = {
      id: category.id,
      name: category.category_name,
      type: category.category_type,
      icon: '💰',
      color: category.category_type === 'income' ? '#28a745' : '#dc3545',
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };

    res.status(201).json(formattedCategory);
  } catch (error) {
    console.error('Ошибка создания категории:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить категорию
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }

    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Тип категории должен быть income или expense' });
    }

    await category.update({
      category_name: name || category.category_name,
      category_type: type || category.category_type,
    });

    // Возвращаем отформатированный ответ
    const formattedCategory = {
      id: category.id,
      name: category.category_name,
      type: category.category_type,
      icon: '💰',
      color: category.category_type === 'income' ? '#28a745' : '#dc3545',
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };

    res.json(formattedCategory);
  } catch (error) {
    console.error('Ошибка обновления категории:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удалить категорию
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }

    await category.destroy();

    res.json({ message: 'Категория удалена' });
  } catch (error) {
    console.error('Ошибка удаления категории:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router; 