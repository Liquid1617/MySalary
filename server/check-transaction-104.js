const { Transaction, Account, Currency } = require('./db/models');

async function checkTransaction104() {
  try {
    console.log('🔍 Checking transaction 104...');
    
    const transaction = await Transaction.findByPk(104, {
      include: [
        {
          model: Account,
          as: 'account',
          include: [
            {
              model: Currency,
              as: 'currency'
            }
          ]
        }
      ]
    });

    if (!transaction) {
      console.log('❌ Transaction 104 not found');
      return;
    }

    console.log('✅ Transaction 104 found:');
    console.log('  ID:', transaction.id);
    console.log('  User ID:', transaction.user_id);
    console.log('  Account ID:', transaction.account_id);
    console.log('  Account Name:', transaction.account?.account_name);
    console.log('  Currency:', transaction.account?.currency?.code);
    console.log('  Amount:', transaction.amount);
    console.log('  Type:', transaction.transaction_type);
    console.log('  Status:', transaction.status);
    console.log('  Date:', transaction.transaction_date);
    console.log('  Description:', transaction.description);

    // Check user 8 accounts
    console.log('\n🏦 Checking user 8 accounts...');
    const user8Accounts = await Account.findAll({
      where: { user_id: 8, is_active: true },
      include: [
        {
          model: Currency,
          as: 'currency'
        }
      ]
    });

    console.log(`Found ${user8Accounts.length} active accounts for user 8:`);
    user8Accounts.forEach((account, index) => {
      console.log(`  ${index + 1}. ${account.account_name}: ${account.balance} ${account.currency.code}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Запускаем если файл вызван напрямую
if (require.main === module) {
  checkTransaction104().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { checkTransaction104 };