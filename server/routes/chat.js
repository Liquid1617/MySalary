const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const DEEPSEEK_CONFIG = require('../config/deepseek');
const { SqlToolkit } = require("langchain/agents/toolkits/sql");
const { SqlDatabase } = require("langchain/sql_db");
const { datasource } = require('../AIInit/initDBResponse');
const { model } = require('../AIInit/init');
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const authMiddleware = require('../middleware/auth');

router.post('/chat', authMiddleware, async (req, res) => {
  try {
    console.log('Получен запрос к DeepSeek API:', req.body);
    console.log('Авторизованный пользователь:', req.user.id);

    const db = await SqlDatabase.fromDataSourceParams({
      appDataSource: datasource,
    })
    const toolkit = new SqlToolkit(db, model);
    const tools = toolkit.getTools();
    console.log('tools', tools);
    
    // Модифицируем системный промпт для ограничения доступа к данным только авторизованного пользователя
    const messages = [...req.body.messages];
    if (messages.length > 0 && messages[0].role === 'system') {
      messages[0].content += `\n\nВАЖНО: Ты работаешь ТОЛЬКО с данными пользователя user_id = ${req.user.id}. 
      При выполнении любых SQL запросов ОБЯЗАТЕЛЬНО используй WHERE user_id = ${req.user.id} 
      или WHERE account.user_id = ${req.user.id} (для транзакций через таблицу accounts).
      НЕ ПОКАЗЫВАЙ и НЕ ИСПОЛЬЗУЙ данные других пользователей!`;
    }

    const agentExecutor = createReactAgent({ llm:model, tools });

    const events = await agentExecutor.stream(
      { messages: messages },
      { streamMode: "values" }
    );

    let finalAnswer = '';

    for await (const event of events) {
      const lastMsg = event.messages[event.messages.length - 1];
      if (lastMsg.tool_calls?.length) {
        console.dir(lastMsg.tool_calls, { depth: null });
      } else if (lastMsg.content) {
        console.log(lastMsg.content);
        // Собираем финальный ответ (обычно это последнее сообщение без tool_calls)
        if (!lastMsg.tool_calls || lastMsg.tool_calls.length === 0) {
          finalAnswer = lastMsg.content;
        }
      }
    }

    // Если не получили ответ, устанавливаем сообщение по умолчанию
    if (!finalAnswer) {
      finalAnswer = 'Извините, я не смог обработать ваш запрос. Попробуйте переформулировать вопрос.';
    }

    // Отправляем ответ в формате, который ожидает клиент (как DeepSeek API)
    const responseData = {
      choices: [{
        message: {
          content: finalAnswer
        }
      }]
    };

    console.log('Отправляем ответ клиенту:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 