const express = require('express');
const router = express.Router();
const { Currency } = require('../db/models');

// GET /api/currencies - получить все валюты
router.get('/', async (req, res) => {
  try {
    const currencies = await Currency.findAll({
      where: { is_active: true },
      attributes: ['id', 'code', 'name', 'symbol'],
      order: [['code', 'ASC']]
    });

    res.json({ currencies });
  } catch (error) {
    console.error('Ошибка при получении валют:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 