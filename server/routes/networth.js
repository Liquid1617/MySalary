const express = require('express');
const router = express.Router();
const { User, Account, Currency } = require('../db/models');
const exchangeRateService = require('../services/exchangeRate');
const authMiddleware = require('../middleware/auth');

// GET /api/networth - get user's total balance in primary currency
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Получаем пользователя с его основной валютой
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Currency,
          as: 'primaryCurrency',
          attributes: ['id', 'code', 'name', 'symbol']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Если у пользователя нет основной валюты, устанавливаем USD по умолчанию
    let primaryCurrency = user.primaryCurrency;
    if (!primaryCurrency) {
      const usdCurrency = await Currency.findOne({ where: { code: 'USD' } });
      if (usdCurrency) {
        await user.update({ primary_currency_id: usdCurrency.id });
        primaryCurrency = usdCurrency;
      }
    }

    if (!primaryCurrency) {
      return res.status(500).json({ error: 'Could not determine primary currency' });
    }

    // Получаем все активные счета пользователя
    const accounts = await Account.findAll({
      where: { 
        user_id: req.user.id,
        is_active: true 
      },
      include: [
        {
          model: Currency,
          as: 'currency',
          attributes: ['id', 'code', 'name', 'symbol']
        }
      ]
    });

    if (accounts.length === 0) {
      return res.json({
        netWorth: 0,
        primaryCurrency: primaryCurrency,
        accounts: [],
        message: 'You have no active accounts yet'
      });
    }

    // Получаем курсы валют для основной валюты пользователя
    const exchangeRates = await exchangeRateService.getExchangeRates(primaryCurrency.code);

    let totalNetWorth = 0;
    const accountsData = [];

    // Конвертируем каждый счет в основную валюту
    for (const account of accounts) {
      const accountCurrency = account.currency.code;
      const accountBalance = parseFloat(account.balance) || 0;
      
      let convertedBalance = accountBalance;
      
      if (accountCurrency !== primaryCurrency.code) {
        try {
          convertedBalance = await exchangeRateService.convertCurrency(
            accountBalance,
            accountCurrency,
            primaryCurrency.code,
            exchangeRates
          );
        } catch (error) {
          console.error(`Error converting ${accountCurrency} to ${primaryCurrency.code}:`, error);
          // In case of conversion error, use fallback
          const fallbackRate = exchangeRates[accountCurrency] || 1;
          convertedBalance = accountBalance / fallbackRate;
        }
      }

      totalNetWorth += convertedBalance;

      accountsData.push({
        id: account.id,
        name: account.account_name,
        type: account.account_type,
        originalBalance: accountBalance,
        originalCurrency: {
          code: account.currency.code,
          symbol: account.currency.symbol
        },
        convertedBalance: convertedBalance,
        exchangeRate: accountCurrency === primaryCurrency.code ? 1 : (exchangeRates[accountCurrency] || 1)
      });
    }

    res.json({
      netWorth: Math.round(totalNetWorth * 100) / 100, // Round to 2 decimal places
      primaryCurrency: primaryCurrency,
      accounts: accountsData,
      exchangeRatesTimestamp: Date.now(),
      message: accounts.length === 1 ? 
        `Your total balance from ${accounts.length} account` : 
        `Your total balance from ${accounts.length} accounts`
    });

  } catch (error) {
    console.error('Error calculating Net Worth:', error);
    res.status(500).json({ error: 'Server error calculating total balance' });
  }
});

// PUT /api/networth/currency - изменить основную валюту пользователя
router.put('/currency', authMiddleware, async (req, res) => {
  try {
    const { currency_id } = req.body;

    if (!currency_id) {
      return res.status(400).json({ error: 'currency_id is required' });
    }

    // Check if currency exists
    const currency = await Currency.findByPk(currency_id);
    if (!currency) {
      return res.status(404).json({ error: 'Currency not found' });
    }

    // Update user's primary currency
    await User.update(
      { primary_currency_id: currency_id },
      { where: { id: req.user.id } }
    );

    res.json({
      message: 'Primary currency successfully updated',
      primaryCurrency: currency
    });

  } catch (error) {
    console.error('Error changing primary currency:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 