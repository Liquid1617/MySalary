const express = require('express');
const { User, Account, Currency } = require('./db/models');
const exchangeRateService = require('./services/exchangeRate');

async function testNetWorthAPI() {
  try {
    console.log('🔍 Testing Net Worth API for user 8...');
    
    // Simulate the API logic
    const userId = 8;
    
    // Get user with primary currency
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Currency,
          as: 'primaryCurrency',
          attributes: ['id', 'code', 'name', 'symbol']
        }
      ]
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    let primaryCurrency = user.primaryCurrency;
    if (!primaryCurrency) {
      const usdCurrency = await Currency.findOne({ where: { code: 'USD' } });
      if (usdCurrency) {
        await user.update({ primary_currency_id: usdCurrency.id });
        primaryCurrency = usdCurrency;
      }
    }

    console.log('✅ User found:', user.id, 'Primary currency:', primaryCurrency?.code);

    // Get all active accounts
    const accounts = await Account.findAll({
      where: { 
        user_id: userId,
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

    console.log('📊 Found accounts:', accounts.length);
    
    if (accounts.length === 0) {
      console.log('❌ No accounts found');
      return;
    }

    // Get exchange rates
    const exchangeRates = await exchangeRateService.getExchangeRates(primaryCurrency.code);

    let totalNetWorth = 0;
    const accountsData = [];

    console.log('\n=== NET WORTH CALCULATION ===');
    
    // Convert each account to primary currency
    for (const account of accounts) {
      const accountCurrency = account.currency.code;
      let accountBalance = parseFloat(account.balance) || 0;
      
      console.log(`Account: ${account.account_name}`);
      console.log(`  Balance: ${accountBalance} ${accountCurrency}`);
      
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
          const fallbackRate = exchangeRates[accountCurrency] || 1;
          convertedBalance = accountBalance / fallbackRate;
        }
      }

      console.log(`  Converted: ${convertedBalance} ${primaryCurrency.code}`);
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
    
    console.log('\n💰 Total Net Worth:', Math.round(totalNetWorth * 100) / 100);
    console.log('=== END CALCULATION ===\n');

    const result = {
      netWorth: Math.round(totalNetWorth * 100) / 100,
      primaryCurrency: primaryCurrency,
      accounts: accountsData,
      exchangeRatesTimestamp: Date.now(),
      message: accounts.length === 1 ? 
        `Your total balance from ${accounts.length} account` : 
        `Your total balance from ${accounts.length} accounts`
    };

    console.log('📊 API Response would be:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  testNetWorthAPI().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { testNetWorthAPI };