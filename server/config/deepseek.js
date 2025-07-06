const DEEPSEEK_CONFIG = {
  apiKey: process.env.DEEPSEEK_API_KEY || 'sk-cb19875cb7a74140822b7f93fd4ee69b',
  apiUrl: 'https://api.deepseek.com/v1/chat/completions',
  model: 'deepseek-chat',
  maxTokens: 1000,
  temperature: 0.7
};

module.exports = DEEPSEEK_CONFIG; 