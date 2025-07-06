const axios = require('axios');

class ExchangeRateService {
  constructor() {
    // Используем бесплатный API exchangerate-api.com
    this.baseURL = 'https://api.exchangerate-api.com/v4/latest';
    this.cache = new Map();
    this.cacheTimeout = 1000 * 60 * 60; // 1 час кеширования
  }

  /**
   * Получить курсы валют для базовой валюты
   * @param {string} baseCurrency - код базовой валюты (например, 'USD')
   * @returns {Promise<Object>} объект с курсами валют
   */
  async getExchangeRates(baseCurrency = 'USD') {
    const cacheKey = baseCurrency.toUpperCase();
    const now = Date.now();
    
    // Проверяем кеш
    const cached = this.cache.get(cacheKey);
    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    try {
      console.log(`Запрос курсов валют для базовой валюты: ${baseCurrency}`);
      const response = await axios.get(`${this.baseURL}/${baseCurrency}`, {
        timeout: 10000 // 10 секунд
      });

      const rates = response.data.rates;
      
      // Кешируем результат
      this.cache.set(cacheKey, {
        data: rates,
        timestamp: now
      });

      return rates;
    } catch (error) {
      console.error('Ошибка получения курсов валют:', error.message);
      
      // Если есть кешированные данные, возвращаем их даже если они устарели
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log('Используем устаревшие данные из кеша');
        return cached.data;
      }
      
      // Fallback курсы (приблизительные)
      console.log('Используем fallback курсы валют');
      return this.getFallbackRates(baseCurrency);
    }
  }

  /**
   * Конвертировать сумму из одной валюты в другую
   * @param {number} amount - сумма для конвертации
   * @param {string} fromCurrency - исходная валюта
   * @param {string} toCurrency - целевая валюта
   * @param {Object} rates - курсы валют (опционально)
   * @returns {Promise<number>} конвертированная сумма
   */
  async convertCurrency(amount, fromCurrency, toCurrency, rates = null) {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    if (!rates) {
      rates = await this.getExchangeRates(toCurrency);
    }

    // Если базовая валюта = целевой валюте, просто используем курс
    const rate = rates[fromCurrency];
    if (rate) {
      return amount / rate;
    }

    // Если нужна конвертация через USD
    if (toCurrency !== 'USD') {
      const usdRates = await this.getExchangeRates('USD');
      const amountInUSD = amount / (usdRates[fromCurrency] || 1);
      const targetRates = await this.getExchangeRates(toCurrency);
      return amountInUSD * (targetRates['USD'] || 1);
    }

    throw new Error(`Не удалось конвертировать ${fromCurrency} в ${toCurrency}`);
  }

  /**
   * Резервные курсы валют на случай недоступности API
   */
  getFallbackRates(baseCurrency) {
    const fallbackRates = {
      'USD': {
        'RUB': 75.00,
        'EUR': 0.85,
        'GBP': 0.73,
        'CNY': 6.45,
        'KZT': 425.00,
        'BYN': 2.60,
        'UAH': 27.50,
        'USD': 1.00
      },
      'EUR': {
        'USD': 1.18,
        'RUB': 88.00,
        'GBP': 0.86,
        'CNY': 7.60,
        'KZT': 500.00,
        'BYN': 3.05,
        'UAH': 32.00,
        'EUR': 1.00
      },
      'RUB': {
        'USD': 0.013,
        'EUR': 0.011,
        'GBP': 0.0097,
        'CNY': 0.086,
        'KZT': 5.67,
        'BYN': 0.035,
        'UAH': 0.37,
        'RUB': 1.00
      }
    };

    return fallbackRates[baseCurrency] || fallbackRates['USD'];
  }

  /**
   * Очистить кеш курсов валют
   */
  clearCache() {
    this.cache.clear();
  }
}

module.exports = new ExchangeRateService(); 