const express = require('express');
const { Country } = require('../db/models');

const router = express.Router();

// Получение всех стран
router.get('/', async (req, res) => {
  try {
    const countries = await Country.findAll({
      attributes: ['id', 'name', 'code'],
      order: [['name', 'ASC']]
    });

    res.json({
      countries
    });

  } catch (error) {
    console.error('Ошибка получения стран:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении стран' });
  }
});

// Получение конкретной страны
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const country = await Country.findByPk(id, {
      attributes: ['id', 'name', 'code']
    });

    if (!country) {
      return res.status(404).json({ error: 'Страна не найдена' });
    }

    res.json({
      country
    });

  } catch (error) {
    console.error('Ошибка получения страны:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении страны' });
  }
});

module.exports = router; 