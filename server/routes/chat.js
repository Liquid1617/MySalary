const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const DEEPSEEK_CONFIG = require('../config/deepseek');

router.post('/chat', async (req, res) => {
  try {
    console.log('Получен запрос к DeepSeek API:', req.body);
    
    const response = await fetch(DEEPSEEK_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_CONFIG.model,
        messages: req.body.messages,
        max_tokens: DEEPSEEK_CONFIG.maxTokens,
        temperature: DEEPSEEK_CONFIG.temperature
      })
    });

    if (!response.ok) {
      console.error('Ошибка DeepSeek API:', response.status);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Получен ответ от DeepSeek API:', data);
    
    res.json(data);
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 