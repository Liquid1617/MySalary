const fetch = require('node-fetch');

async function testBudgetCreation() {
  try {
    // First, login to get a token
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com', // You'll need to use a real user's credentials
        password: 'test123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.token) {
      console.log('No token received, cannot proceed with budget test');
      return;
    }

    // Now try to create a budget
    const budgetResponse = await fetch('http://localhost:3001/api/budgets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({
        name: 'Test Budget',
        limit_amount: 1000,
        currency: 'USD',
        period_type: 'month',
        rollover: false,
        categories: ['1', '2'] // Test with some category IDs
      })
    });

    const budgetData = await budgetResponse.json();
    console.log('Budget creation response:', budgetData);
    console.log('Status:', budgetResponse.status);
  } catch (error) {
    console.error('Error:', error);
  }
}

testBudgetCreation();