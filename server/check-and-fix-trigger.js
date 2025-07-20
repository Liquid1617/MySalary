const { sequelize } = require('./db/models');

async function checkAndFixTrigger() {
  console.log('🔍 Checking for problematic database triggers and functions...\n');
  
  try {
    // Check if the problematic trigger exists
    console.log('1️⃣ Checking for update_balance_trigger...');
    const triggerQuery = `
      SELECT trigger_name, event_manipulation, event_object_table, action_statement
      FROM information_schema.triggers 
      WHERE trigger_name = 'update_balance_trigger'
      AND event_object_schema = current_schema();
    `;
    
    const [triggers] = await sequelize.query(triggerQuery);
    
    if (triggers.length > 0) {
      console.log('❌ Found problematic trigger:');
      triggers.forEach(trigger => {
        console.log(`   - Name: ${trigger.trigger_name}`);
        console.log(`   - Event: ${trigger.event_manipulation}`);
        console.log(`   - Table: ${trigger.event_object_table}`);
        console.log(`   - Action: ${trigger.action_statement}`);
      });
      
      console.log('\n🔧 Removing problematic trigger...');
      await sequelize.query('DROP TRIGGER IF EXISTS update_balance_trigger ON "Transactions";');
      console.log('✅ Trigger removed successfully');
    } else {
      console.log('✅ No problematic trigger found');
    }

    // Check if the problematic function exists
    console.log('\n2️⃣ Checking for update_account_balance function...');
    const functionQuery = `
      SELECT routine_name, routine_type, routine_definition
      FROM information_schema.routines 
      WHERE routine_name = 'update_account_balance'
      AND routine_schema = current_schema();
    `;
    
    const [functions] = await sequelize.query(functionQuery);
    
    if (functions.length > 0) {
      console.log('❌ Found problematic function:');
      functions.forEach(func => {
        console.log(`   - Name: ${func.routine_name}`);
        console.log(`   - Type: ${func.routine_type}`);
        console.log(`   - Definition: ${func.routine_definition ? func.routine_definition.substring(0, 100) + '...' : 'N/A'}`);
      });
      
      console.log('\n🔧 Removing problematic function...');
      await sequelize.query('DROP FUNCTION IF EXISTS update_account_balance();');
      console.log('✅ Function removed successfully');
    } else {
      console.log('✅ No problematic function found');
    }

    // Check for any other triggers on Transactions table
    console.log('\n3️⃣ Checking for other triggers on Transactions table...');
    const allTriggersQuery = `
      SELECT trigger_name, event_manipulation, action_timing, action_statement
      FROM information_schema.triggers 
      WHERE event_object_table = 'Transactions'
      AND event_object_schema = current_schema();
    `;
    
    const [allTriggers] = await sequelize.query(allTriggersQuery);
    
    if (allTriggers.length > 0) {
      console.log('⚠️  Found other triggers on Transactions table:');
      allTriggers.forEach(trigger => {
        console.log(`   - Name: ${trigger.trigger_name}`);
        console.log(`   - Event: ${trigger.event_manipulation}`);
        console.log(`   - Timing: ${trigger.action_timing}`);
        console.log(`   - Action: ${trigger.action_statement ? trigger.action_statement.substring(0, 100) + '...' : 'N/A'}`);
        console.log('');
      });
      console.log('📝 Please review these triggers manually to ensure they don\'t affect balance calculations');
    } else {
      console.log('✅ No other triggers found on Transactions table');
    }

    // Check for any functions that might affect account balances
    console.log('\n4️⃣ Checking for functions that might affect account balances...');
    const balanceFunctionsQuery = `
      SELECT routine_name, routine_type
      FROM information_schema.routines 
      WHERE routine_schema = current_schema()
      AND (routine_name LIKE '%balance%' OR routine_name LIKE '%account%')
      AND routine_type = 'FUNCTION';
    `;
    
    const [balanceFunctions] = await sequelize.query(balanceFunctionsQuery);
    
    if (balanceFunctions.length > 0) {
      console.log('📋 Found functions related to balance/account:');
      balanceFunctions.forEach(func => {
        console.log(`   - ${func.routine_name} (${func.routine_type})`);
      });
      console.log('📝 Please review these functions manually if needed');
    } else {
      console.log('✅ No balance-related functions found');
    }

    // Check constraints on Accounts table
    console.log('\n5️⃣ Checking constraints on Accounts table...');
    const constraintsQuery = `
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 'Accounts'
      AND table_schema = current_schema()
      AND constraint_type = 'CHECK';
    `;
    
    const [constraints] = await sequelize.query(constraintsQuery);
    
    if (constraints.length > 0) {
      console.log('📋 Found CHECK constraints on Accounts table:');
      constraints.forEach(constraint => {
        console.log(`   - ${constraint.constraint_name} (${constraint.constraint_type})`);
      });
    } else {
      console.log('✅ No CHECK constraints found on Accounts table');
    }

    console.log('\n🎉 Trigger and function check completed!');
    console.log('\n📊 Summary:');
    console.log(`   - Problematic triggers found and removed: ${triggers.length}`);
    console.log(`   - Problematic functions found and removed: ${functions.length}`);
    console.log(`   - Other triggers on Transactions: ${allTriggers.length}`);
    console.log(`   - Balance-related functions: ${balanceFunctions.length}`);
    console.log(`   - CHECK constraints on Accounts: ${constraints.length}`);
    
    if (triggers.length > 0 || functions.length > 0) {
      console.log('\n⚠️  IMPORTANT: Since problematic triggers/functions were found and removed,');
      console.log('   you should run the balance recalculation script to fix any incorrect balances:');
      console.log('   node fix-account-balances.js');
    }

  } catch (error) {
    console.error('❌ Error checking/fixing triggers:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  checkAndFixTrigger().then(() => {
    console.log('\n✅ Check and fix completed successfully');
    process.exit(0);
  }).catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { checkAndFixTrigger };