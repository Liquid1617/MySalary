const axios = require('axios');

async function testNetWorthAPI() {
  try {
    // Сначала логинимся
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      login: 'Liquid16',
      password: '1234qQ'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    // Теперь запрашиваем net worth
    console.log('\n2. Fetching net worth...');
    const networthResponse = await axios.get('http://localhost:3001/api/networth', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Net worth fetched successfully:');
    console.log(JSON.stringify(networthResponse.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status);
      console.error('Response:', error.response.data);
    } else {
      console.error('❌ Request Error:', error.message);
    }
  }
}

// Запускаем тест
testNetWorthAPI();