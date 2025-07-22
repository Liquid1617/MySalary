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
const { ValidatedSqlToolkit } = require('../AIInit/customSqlTool');
const { createSupervisorGraph } = require('../AIInit/supervisor');
const { HumanMessage, SystemMessage, AIMessage } = require("@langchain/core/messages");

router.post('/chat', authMiddleware, async (req, res) => {
  try {
    console.log('Получен запрос к DeepSeek API:', req.body);
    console.log('Авторизованный пользователь:', req.user.id);

    const db = await SqlDatabase.fromDataSourceParams({
      appDataSource: datasource,
    });

    // Используем валидированный SQL toolkit вместо обычного
    const toolkit = new ValidatedSqlToolkit(db, model);
    const tools = toolkit.getTools();
    console.log('Инструменты с валидацией загружены:', tools.map(t => t.name));
    
    // Модифицируем системный промпт для ограничения доступа к данным только авторизованного пользователя
    const messages = [...req.body.messages];
    if (messages.length > 0 && messages[0].role === 'system') {
      messages[0].content += `\n\nВАЖНО: Ты работаешь ТОЛЬКО с данными пользователя user_id = ${req.user.id}. 
      При выполнении любых SQL запросов ОБЯЗАТЕЛЬНО используй WHERE user_id = ${req.user.id} 
      или WHERE account.user_id = ${req.user.id} (для транзакций через таблицу accounts).
      НЕ ПОКАЗЫВАЙ и НЕ ИСПОЛЬЗУЙ данные других пользователей!
      
      СТРУКТУРА БАЗЫ ДАННЫХ:
      1. "Transactions" (Транзакции):
         - id: INT (PK)
         - user_id: INT (FK -> Users)
         - account_id: INT (FK -> Accounts)
         - category_id: INT (FK -> Categories)
         - amount: DECIMAL(10,2)
         - transaction_type: ENUM('income', 'expense')
         - description: STRING
         - transaction_date: DATE
      
      2. "Categories" (Категории):
         - id: INT (PK)
         - category_type: ENUM('income', 'expense')
         - category_name: STRING
      
      3. "Accounts" (Счета):
         - id: INT (PK)
         - user_id: INT (FK -> Users)
         - currency_id: INT (FK -> Currencies)
         - account_name: STRING
         - balance: DECIMAL(10,2)
      
      4. "Currencies" (Валюты):
         - id: INT (PK)
         - code: STRING (например, 'USD', 'EUR')
         - name: STRING
      
      ВАЖНЫЕ ЗАМЕЧАНИЯ:
      1. Все суммы хранятся в базовой валюте счета (поле currency_id в Accounts)
      2. Тип транзакции (transaction_type) должен совпадать с типом категории (category_type)
      3. Используй JOIN для получения информации о валюте через таблицу Accounts
      4. Для работы с датами используй DATE_TRUNC('month', transaction_date)
      
      КРИТИЧЕСКИ ВАЖНО для имен таблиц:
      - Используй правильные имена с учетом регистра: "Transactions", "Users", "Accounts", "Categories", "Currencies"
      - НЕ используй: "transactions", "users", "accounts" (с маленькой буквы)
      - В PostgreSQL имена таблиц регистрозависимы!`;
    }

    // Определяем, использовать ли супервизора
    const useSupervisor = process.env.USE_SUPERVISOR === 'true' || true; // По умолчанию включен

    let finalAnswer = '';

    if (useSupervisor) {
      console.log('Используется архитектура с супервизором');
      
      try {
        // Берем только последний вопрос пользователя и системный промпт
        const relevantMessages = messages.filter((msg, index) => {
          if (index === 0 && msg.role === 'system') return true;
          if (index === messages.length - 1 && msg.role === 'user') return true;
          return false;
        });

        // Преобразуем сообщения в формат LangChain
        const langchainMessages = relevantMessages.map(msg => {
          switch (msg.role) {
            case 'system':
              return new SystemMessage(msg.content);
            case 'user':
              return new HumanMessage(msg.content);
            case 'assistant':
              return new AIMessage(msg.content);
            default:
              return new HumanMessage(msg.content);
          }
        });

        console.log('Преобразованные сообщения:', langchainMessages);

        // Создаем граф с супервизором
        const graph = createSupervisorGraph(db, model, tools);

        // Запускаем граф с начальным состоянием
        const initialState = {
          messages: langchainMessages,
          userId: req.user.id,
          attempts: 0,
          hasData: false,
          sqlQuery: '',
          sqlResult: '',
          next: 'sql_agent'
        };

        console.log('Начальное состояние:', JSON.stringify(initialState, null, 2));

        // Вызываем граф
        const result = await graph.invoke(initialState);
        console.log('Результат работы графа:', JSON.stringify(result, null, 2));

        // Получаем последнее сообщение из цепочки
        if (result && Array.isArray(result.messages) && result.messages.length > 0) {
          const lastMessage = result.messages[result.messages.length - 1];
          finalAnswer = lastMessage.content;
        } else {
          throw new Error('Некорректный формат ответа от графа');
        }

      } catch (graphError) {
        console.error('Ошибка при выполнении графа:', graphError);
        finalAnswer = 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте переформулировать вопрос или обратитесь позже.';
      }

    } else {
      // Старая логика без супервизора (для обратной совместимости)
      console.log('Используется стандартная архитектура');
      
      const agentExecutor = createReactAgent({ llm: model, tools });

      const events = await agentExecutor.stream(
        { messages: messages },
        { streamMode: "values" }
      );

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

router.get('/chat/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    supervisor: process.env.USE_SUPERVISOR === 'true' || true,
    message: 'Chat service with supervisor is running' 
  });
});

module.exports = router; 