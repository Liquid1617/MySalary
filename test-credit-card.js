// Test script for credit card transaction logic

const axios = require('axios');

const API_URL = 'http://localhost:5001/api';
let authToken = '';
let creditCardId = '';
let userId = '';

// Test user credentials
const testUser = {
  username: 'testuser_' + Date.now(),
  email: `test_${Date.now()}@example.com`,
  password: 'TestPassword123!'
};

async function registerUser() {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, testUser);
    console.log('✅ User registered successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data || error.message);
    throw error;
  }
}

async function loginUser() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: testUser.username,
      password: testUser.password
    });
    authToken = response.data.token;
    userId = response.data.user.id;
    console.log('✅ User logged in successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function createCreditCard() {
  try {
    const response = await axios.post(
      `${API_URL}/accounts`,
      {
        account_name: 'Test Credit Card',
        account_type: 'credit_card',
        currency_id: 1, // USD
        balance: 0
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    creditCardId = response.data.id;
    console.log('✅ Credit card created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Credit card creation failed:', error.response?.data || error.message);
    throw error;
  }
}

async function createTransaction(type, amount, description) {
  try {
    const response = await axios.post(
      `${API_URL}/transactions`,
      {
        account_id: creditCardId,
        amount: amount,
        transaction_type: type,
        description: description,
        category_id: type === 'income' ? 1 : 11, // Salary for income, Food for expense
        transaction_date: new Date().toISOString().split('T')[0]
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log(`✅ ${type} transaction created:`, {
      amount: response.data.amount,
      new_balance: response.data.account.balance
    });
    return response.data;
  } catch (error) {
    console.error(`❌ ${type} transaction failed:`, error.response?.data || error.message);
    throw error;
  }
}

async function getAccount() {
  try {
    const response = await axios.get(
      `${API_URL}/accounts`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    const creditCard = response.data.find(acc => acc.id === creditCardId);
    console.log('📊 Current credit card balance:', creditCard.balance);
    return creditCard;
  } catch (error) {
    console.error('❌ Failed to get account:', error.response?.data || error.message);
    throw error;
  }
}

async function runTests() {
  console.log('🚀 Starting credit card transaction tests...\n');

  try {
    // Setup
    await registerUser();
    await loginUser();
    await createCreditCard();

    console.log('\n📋 Test 1: Expense on credit card (using credit)');
    await createTransaction('expense', 100, 'Test purchase');
    const afterExpense = await getAccount();
    console.log(`Expected balance: 100 (debt), Actual: ${afterExpense.balance}`);
    console.assert(parseFloat(afterExpense.balance) === 100, '❌ Expense test failed');

    console.log('\n📋 Test 2: Income on credit card (paying off debt)');
    await createTransaction('income', 50, 'Payment to credit card');
    const afterPayment = await getAccount();
    console.log(`Expected balance: 50 (remaining debt), Actual: ${afterPayment.balance}`);
    console.assert(parseFloat(afterPayment.balance) === 50, '❌ Income test failed');

    console.log('\n📋 Test 3: Full payment');
    await createTransaction('income', 50, 'Full payment');
    const afterFullPayment = await getAccount();
    console.log(`Expected balance: 0, Actual: ${afterFullPayment.balance}`);
    console.assert(parseFloat(afterFullPayment.balance) === 0, '❌ Full payment test failed');

    console.log('\n📋 Test 4: Overpayment (credit balance)');
    await createTransaction('income', 100, 'Overpayment');
    const afterOverpayment = await getAccount();
    console.log(`Expected balance: -100 (credit), Actual: ${afterOverpayment.balance}`);
    console.assert(parseFloat(afterOverpayment.balance) === -100, '❌ Overpayment test failed');

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();