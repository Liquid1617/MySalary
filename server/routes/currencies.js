const express = require('express');
const router = express.Router();
const { Currency } = require('../db/models');
const exchangeRateService = require('../services/exchangeRate');

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

// POST /api/currencies/convert - конвертировать валюту
router.post('/convert', async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;

    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({ 
        error: 'Необходимы параметры: amount, fromCurrency, toCurrency' 
      });
    }

    if (fromCurrency === toCurrency) {
      return res.json({
        originalAmount: amount,
        convertedAmount: amount,
        fromCurrency,
        toCurrency,
        exchangeRate: 1
      });
    }

    const convertedAmount = await exchangeRateService.convertCurrency(
      parseFloat(amount), 
      fromCurrency, 
      toCurrency
    );

    // Получаем курс для отображения
    const rates = await exchangeRateService.getExchangeRates(toCurrency);
    const exchangeRate = rates[fromCurrency] ? (1 / rates[fromCurrency]) : 1;

    res.json({
      originalAmount: parseFloat(amount),
      convertedAmount: Math.round(convertedAmount * 100) / 100, // округляем до 2 знаков
      fromCurrency,
      toCurrency,
      exchangeRate: Math.round(exchangeRate * 10000) / 10000 // округляем курс до 4 знаков
    });

  } catch (error) {
    console.error('Ошибка конвертации валюты:', error);
    res.status(500).json({ error: 'Ошибка при конвертации валюты' });
  }
});

module.exports = router; 