const {ChatDeepSeek} = require("@langchain/deepseek");
require('dotenv').config();

const model = new ChatDeepSeek({
  apiKey: 'sk-cb19875cb7a74140822b7f93fd4ee69b', //разобраться
  model: 'deepseek-chat',
});

module.exports = {
  model
}