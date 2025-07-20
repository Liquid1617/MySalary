const { User, Account, Currency, Transaction } = require('./db/models');
const { Op } = require('sequelize');

async function validateNetWorthIntegrity(options = {}) {
  const { userId = null, fix = false } = options;
  
  console.log('🔍 Validating Net Worth calculation integrity...\n');
  
  if (userId) {
    console.log(`👤 Checking for user ID: ${userId}`);
  } else {
    console.log('🌐 Checking for all users');
  }
  
  if (fix) {
    console.log('🔧 FIX MODE: Will correct balance discrepancies automatically');
  } else {
    console.log('📋 REPORT MODE: Will only report issues without fixing them');
  }
  
  try {
    // Get users to check
    const whereClause = userId ? { id: userId } : {};
    const users = await User.findAll({
      where: whereClause,
      include: [
        {
          model: Currency,
          as: 'primaryCurrency',
          attributes: ['id', 'code', 'name', 'symbol']
        }
      ]
    });
    
    if (users.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    console.log(`📊 Found ${users.length} users to check\n`);
    
    let totalIssues = 0;
    let totalAccountsChecked = 0;
    let totalUsersWithIssues = 0;
    const detailedReport = [];
    
    for (const user of users) {
      console.log(`👤 Checking user: ${user.name || user.login} (ID: ${user.id})`);
      
      if (!user.primaryCurrency) {
        console.log('   ⚠️  No primary currency set, skipping...');
        continue;
      }
      
      console.log(`   Primary currency: ${user.primaryCurrency.code}`);
      
      // Get user's active accounts
      const accounts = await Account.findAll({
        where: {
          user_id: user.id,
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
        console.log('   📭 No active accounts found');
        continue;
      }
      
      console.log(`   📊 Found ${accounts.length} active accounts`);
      
      let userHasIssues = false;
      let userNetWorth = 0;
      
      for (const account of accounts) {
        totalAccountsChecked++;
        
        console.log(`   \n   💳 Account: ${account.account_name} (${account.currency.code})`);
        console.log(`      Current balance: ${account.balance}`);
        
        // Calculate expected balance from posted transactions
        const postedTransactions = await Transaction.findAll({
          where: {
            account_id: account.id,
            status: 'posted'
          },
          order: [['transaction_date', 'ASC'], ['createdAt', 'ASC']]
        });
        
        let expectedBalance = 0;
        let transactionCount = 0;
        
        for (const transaction of postedTransactions) {
          const amount = parseFloat(transaction.amount) || 0;
          transactionCount++;
          
          if (transaction.transaction_type === 'income') {
            expectedBalance += amount;
          } else if (transaction.transaction_type === 'expense') {
            expectedBalance -= amount;
          } else if (transaction.transaction_type === 'transfer') {
            if (transaction.account_id === account.id) {
              expectedBalance -= amount; // Outgoing transfer
            }
          }
        }
        
        // Handle incoming transfers
        const incomingTransfers = await Transaction.findAll({
          where: {
            transfer_to: account.id,
            status: 'posted'
          }
        });
        
        for (const transfer of incomingTransfers) {
          expectedBalance += parseFloat(transfer.amount) || 0;
          transactionCount++;
        }
        
        // Check for scheduled transactions (shouldn't affect balance)
        const scheduledTransactions = await Transaction.findAll({
          where: {
            account_id: account.id,
            status: 'scheduled'
          }
        });
        
        console.log(`      Posted transactions: ${postedTransactions.length + incomingTransfers.length}`);
        console.log(`      Scheduled transactions: ${scheduledTransactions.length}`);
        console.log(`      Expected balance: ${expectedBalance}`);
        
        const currentBalance = parseFloat(account.balance) || 0;
        const discrepancy = Math.abs(currentBalance - expectedBalance);
        
        if (discrepancy > 0.01) {
          totalIssues++;
          userHasIssues = true;
          
          console.log(`      ❌ BALANCE MISMATCH!`);
          console.log(`         Discrepancy: ${discrepancy.toFixed(2)} ${account.currency.code}`);
          
          const issueReport = {
            userId: user.id,
            userName: user.name || user.login,
            accountId: account.id,
            accountName: account.account_name,
            currency: account.currency.code,
            currentBalance: currentBalance,
            expectedBalance: expectedBalance,
            discrepancy: discrepancy,
            postedTransactions: postedTransactions.length + incomingTransfers.length,
            scheduledTransactions: scheduledTransactions.length
          };
          
          detailedReport.push(issueReport);
          
          if (fix) {
            console.log(`      🔧 Fixing balance: ${currentBalance} → ${expectedBalance}`);
            await account.update({ balance: expectedBalance });
            console.log(`      ✅ Balance corrected`);
            userNetWorth += expectedBalance;
          } else {
            console.log(`      📝 Would fix: ${currentBalance} → ${expectedBalance}`);
            userNetWorth += currentBalance; // Use current balance for net worth calculation
          }
        } else {
          console.log(`      ✅ Balance is correct (difference: ${discrepancy.toFixed(4)})`);
          userNetWorth += currentBalance;
        }
      }
      
      if (userHasIssues) {
        totalUsersWithIssues++;
      }
      
      console.log(`   💰 User Net Worth: ${userNetWorth.toFixed(2)} ${user.primaryCurrency.code}`);
      console.log(`   ${userHasIssues ? '❌' : '✅'} User status: ${userHasIssues ? 'Has issues' : 'All accounts correct'}\n`);
    }
    
    // Summary report
    console.log('\n' + '='.repeat(60));
    console.log('📊 INTEGRITY VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total users checked: ${users.length}`);
    console.log(`Total accounts checked: ${totalAccountsChecked}`);
    console.log(`Users with balance issues: ${totalUsersWithIssues}`);
    console.log(`Total balance mismatches found: ${totalIssues}`);
    
    if (totalIssues > 0) {
      console.log('\n❌ ISSUES FOUND:');
      
      const issuesByUser = {};
      detailedReport.forEach(issue => {
        if (!issuesByUser[issue.userId]) {
          issuesByUser[issue.userId] = {
            userName: issue.userName,
            issues: []
          };
        }
        issuesByUser[issue.userId].issues.push(issue);
      });
      
      Object.entries(issuesByUser).forEach(([userId, userData]) => {
        console.log(`\n👤 User: ${userData.userName} (ID: ${userId})`);
        userData.issues.forEach((issue, index) => {
          console.log(`   ${index + 1}. Account: ${issue.accountName}`);
          console.log(`      Current: ${issue.currentBalance} ${issue.currency}`);
          console.log(`      Expected: ${issue.expectedBalance} ${issue.currency}`);
          console.log(`      Discrepancy: ${issue.discrepancy.toFixed(2)} ${issue.currency}`);
          console.log(`      Transactions: ${issue.postedTransactions} posted, ${issue.scheduledTransactions} scheduled`);
        });
      });
      
      if (!fix) {
        console.log('\n🔧 To fix these issues, run with --fix flag:');
        console.log('   node validate-networth-integrity.js --fix');
        if (userId) {
          console.log(`   node validate-networth-integrity.js --fix --user=${userId}`);
        }
      } else {
        console.log('\n✅ All balance issues have been corrected!');
      }
    } else {
      console.log('\n✅ No balance integrity issues found!');
      console.log('All account balances correctly reflect posted transactions only.');
    }
    
    // Check for orphaned transactions - only if we have accounts to check against
    if (totalAccountsChecked > 0) {
      console.log('\n🔍 Checking for orphaned transactions...');
      
      // Get all accounts for the users we're checking
      const allUserAccounts = await Account.findAll({
        where: userId ? { user_id: userId } : {},
        attributes: ['id']
      });
      
      const accountIds = allUserAccounts.map(acc => acc.id);
      
      if (accountIds.length > 0) {
        const orphanedTransactions = await Transaction.findAll({
          where: {
            account_id: {
              [Op.notIn]: accountIds
            }
          }
        });
        
        if (orphanedTransactions.length > 0) {
          console.log(`⚠️  Found ${orphanedTransactions.length} orphaned transactions (pointing to non-existent accounts)`);
        } else {
          console.log('✅ No orphaned transactions found');
        }
      }
    }
    
    console.log('\n🎉 Net Worth integrity validation completed!');
    
  } catch (error) {
    console.error('❌ Error during validation:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const fix = args.includes('--fix');
  const userIdArg = args.find(arg => arg.startsWith('--user='));
  const userId = userIdArg ? parseInt(userIdArg.split('=')[1]) : null;
  
  console.log('🚀 Starting Net Worth integrity validation...');
  console.log('\nUsage: node validate-networth-integrity.js [--fix] [--user=USER_ID]');
  console.log('  --fix: Fix balance discrepancies automatically');
  console.log('  --user=ID: Only check specific user\n');
  
  validateNetWorthIntegrity({ userId, fix }).then(() => {
    console.log('\n✅ Validation completed successfully');
    process.exit(0);
  }).catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { validateNetWorthIntegrity };