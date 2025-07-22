// Проверяем наличие переменных окружения
if (!process.env.DEEPSEEK_API_KEY) {
  console.warn("Warning: DEEPSEEK_API_KEY not found in environment variables");
}

const DEEPSEEK_CONFIG = {
  apiKey: process.env.DEEPSEEK_API_KEY,
  apiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions',
  model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  maxTokens: parseInt(process.env.DEEPSEEK_MAX_TOKENS) || 1000,
  temperature: parseFloat(process.env.DEEPSEEK_TEMPERATURE) || 0.7
};

// Проверяем обязательные поля
if (!DEEPSEEK_CONFIG.apiKey) {
  throw new Error("DEEPSEEK_API_KEY is required but not provided");
}

module.exports = DEEPSEEK_CONFIG; 