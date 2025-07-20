const { Account, Transaction, Currency } = require('./db/models');

async function recalculateAccountBalances(options = {}) {
  const { dryRun = false, userId = null } = options;
  
  console.log('🔄 Recalculating account balances based on posted transactions only...');
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made to the database');
  }
  if (userId) {
    console.log(`👤 Filtering for user ID: ${userId}`);
  }
  
  try {
    // Получаем все активные счета
    const whereClause = { is_active: true };
    if (userId) {
      whereClause.user_id = userId;
    }
    
    const accounts = await Account.findAll({
      where: whereClause,
      include: [
        {
          model: Currency,
          as: 'currency',
          attributes: ['code', 'symbol']
        }
      ]
    });

    console.log(`📊 Found ${accounts.length} active accounts`);
    
    let totalAccountsChecked = 0;
    let accountsWithMismatch = 0;
    let totalDiscrepancy = 0;
    const mismatchReport = [];

    for (const account of accounts) {
      totalAccountsChecked++;
      console.log(`\n💳 Processing account: ${account.account_name} (${account.currency.code})`);
      console.log(`   User ID: ${account.user_id}`);
      console.log(`   Account ID: ${account.id}`);
      console.log(`   Current balance: ${account.balance}`);

      // Получаем все posted транзакции для этого счета
      const transactions = await Transaction.findAll({
        where: {
          account_id: account.id,
          status: 'posted' // Только posted транзакции
        },
        order: [['transaction_date', 'ASC'], ['createdAt', 'ASC']]
      });

      console.log(`   Found ${transactions.length} posted transactions`);
      
      // Check for scheduled transactions that might have affected balance
      const scheduledTransactions = await Transaction.findAll({
        where: {
          account_id: account.id,
          status: 'scheduled'
        }
      });
      
      if (scheduledTransactions.length > 0) {
        console.log(`   ⚠️  Found ${scheduledTransactions.length} scheduled transactions (should NOT affect balance)`);
      }

      // Пересчитываем баланс с нуля
      let calculatedBalance = 0;
      const transactionDetails = [];
      
      for (const transaction of transactions) {
        const amount = parseFloat(transaction.amount);
        if (transaction.transaction_type === 'income') {
          calculatedBalance += amount;
          transactionDetails.push(`+${amount} (income)`);
          console.log(`     +${transaction.amount} (income) -> ${calculatedBalance}`);
        } else if (transaction.transaction_type === 'expense') {
          calculatedBalance -= amount;
          transactionDetails.push(`-${amount} (expense)`);
          console.log(`     -${transaction.amount} (expense) -> ${calculatedBalance}`);
        } else if (transaction.transaction_type === 'transfer') {
          // Для transfer проверяем, это исходящий или входящий transfer
          if (transaction.account_id === account.id) {
            // Исходящий transfer
            calculatedBalance -= amount;
            transactionDetails.push(`-${amount} (transfer out)`);
            console.log(`     -${transaction.amount} (transfer out) -> ${calculatedBalance}`);
          }
          // Входящие transfers обрабатываются отдельно через transfer_to
        }
      }

      // Обрабатываем входящие transfers
      const incomingTransfers = await Transaction.findAll({
        where: {
          transfer_to: account.id,
          status: 'posted'
        }
      });

      for (const transfer of incomingTransfers) {
        const amount = parseFloat(transfer.amount);
        calculatedBalance += amount;
        transactionDetails.push(`+${amount} (transfer in)`);
        console.log(`     +${transfer.amount} (transfer in) -> ${calculatedBalance}`);
      }

      console.log(`   Calculated balance: ${calculatedBalance}`);
      
      const currentBalance = parseFloat(account.balance);
      const discrepancy = Math.abs(currentBalance - calculatedBalance);
      
      if (discrepancy > 0.01) {
        accountsWithMismatch++;
        totalDiscrepancy += discrepancy;
        
        const mismatchInfo = {
          accountId: account.id,
          accountName: account.account_name,
          userId: account.user_id,
          currentBalance: currentBalance,
          calculatedBalance: calculatedBalance,
          discrepancy: discrepancy,
          currency: account.currency.code,
          transactionCount: transactions.length + incomingTransfers.length,
          scheduledCount: scheduledTransactions.length
        };
        
        mismatchReport.push(mismatchInfo);
        
        console.log(`   ⚠️  Balance mismatch! Current: ${account.balance}, Calculated: ${calculatedBalance}, Difference: ${discrepancy}`);
        
        if (!dryRun) {
          await account.update({ balance: calculatedBalance });
          console.log(`   ✅ Balance updated successfully`);
        } else {
          console.log(`   📋 DRY RUN: Would update balance from ${account.balance} to ${calculatedBalance}`);
        }
      } else {
        console.log(`   ✅ Balance is correct (difference: ${discrepancy})`);
      }
    }

    console.log('\n🎉 Account balance recalculation completed!');
    
    // Summary report
    console.log('\n📊 SUMMARY REPORT:');
    console.log(`   Total accounts checked: ${totalAccountsChecked}`);
    console.log(`   Accounts with correct balances: ${totalAccountsChecked - accountsWithMismatch}`);
    console.log(`   Accounts with balance mismatches: ${accountsWithMismatch}`);
    console.log(`   Total discrepancy amount: ${totalDiscrepancy.toFixed(2)}`);
    
    if (mismatchReport.length > 0) {
      console.log('\n⚠️  DETAILED MISMATCH REPORT:');
      mismatchReport.forEach((item, index) => {
        console.log(`   ${index + 1}. Account: ${item.accountName} (ID: ${item.accountId}, User: ${item.userId})`);
        console.log(`      Current: ${item.currentBalance} ${item.currency}`);
        console.log(`      Calculated: ${item.calculatedBalance} ${item.currency}`);
        console.log(`      Discrepancy: ${item.discrepancy.toFixed(2)} ${item.currency}`);
        console.log(`      Posted transactions: ${item.transactionCount}`);
        console.log(`      Scheduled transactions: ${item.scheduledCount}`);
        console.log('');
      });
      
      if (dryRun) {
        console.log('\n🔧 To fix these issues, run this script without the --dry-run flag');
      } else {
        console.log('\n✅ All balance mismatches have been corrected');
      }
    }

  } catch (error) {
    console.error('❌ Error recalculating balances:', error);
    throw error;
  }
}

// Запускаем если файл вызван напрямую
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const userIdArg = args.find(arg => arg.startsWith('--user='));
  const userId = userIdArg ? parseInt(userIdArg.split('=')[1]) : null;
  
  console.log('🚀 Starting account balance recalculation...');
  if (dryRun) {
    console.log('🔍 Running in DRY RUN mode');
  }
  if (userId) {
    console.log(`👤 Filtering for user ID: ${userId}`);
  }
  console.log('\nUsage: node fix-account-balances.js [--dry-run] [--user=USER_ID]');
  console.log('  --dry-run: Show what would be changed without making actual changes');
  console.log('  --user=ID: Only process accounts for specific user\n');
  
  recalculateAccountBalances({ dryRun, userId }).then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  }).catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { recalculateAccountBalances };