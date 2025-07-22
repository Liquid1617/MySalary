const { ChatDeepSeek } = require("@langchain/deepseek");
const { HumanMessage, AIMessage, SystemMessage } = require("@langchain/core/messages");
const { END, START, StateGraph } = require("@langchain/langgraph");
const { z } = require("zod");
const { JsonOutputParser } = require("@langchain/core/output_parsers");
const DEEPSEEK_CONFIG = require("../config/deepseek");

// Проверяем наличие конфигурации
if (!DEEPSEEK_CONFIG || !DEEPSEEK_CONFIG.apiKey) {
  throw new Error("DeepSeek configuration is missing or invalid");
}

// Инициализация DeepSeek API
const deepseek = new ChatDeepSeek({
  apiKey: DEEPSEEK_CONFIG.apiKey,
  temperature: 0,
  modelName: DEEPSEEK_CONFIG.model || 'deepseek-chat'
});

/**
 * Класс для генерации SQL запросов
 */
class SqlGenerator {
  constructor(db, tools) {
    this.db = db;
    this.tools = Array.isArray(tools) ? tools : Object.values(tools);
  }

  // Получаем схему таблицы для контекста
  async getTableSchema(tableName) {
    try {
      const schemaTool = this.tools.find(t => t.name === "sql-db-schema");
      if (!schemaTool) {
        throw new Error("Schema tool not found");
      }
      const schema = await schemaTool.call(tableName);
      return schema;
    } catch (error) {
      console.error("Ошибка при получении схемы:", error);
      return null;
    }
  }

  // Генерируем SQL запрос с помощью AI
  async generateSql(question, userId) {
    try {
      // Получаем схемы основных таблиц для контекста
      const schemas = await Promise.all([
        this.getTableSchema("Transactions"),
        this.getTableSchema("Categories"),
        this.getTableSchema("Accounts"),
        this.getTableSchema("Currencies")
      ]);

      // Базовый SQL запрос для расходов
      const sqlQuery = `
        SELECT 
          c.category_name,
          SUM(t.amount) as total_amount,
          cur.code as currency_code
        FROM "Transactions" t
        JOIN "Categories" c ON t.category_id = c.id
        JOIN "Accounts" a ON t.account_id = a.id
        JOIN "Currencies" cur ON a.currency_id = cur.id
        WHERE a.user_id = ${userId}
          AND t.transaction_type = 'expense'
          AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY c.category_name, cur.code
        ORDER BY total_amount DESC`;

      // Проверяем валидность запроса
      const queryChecker = this.tools.find(t => t.name === "query-checker");
      if (!queryChecker) {
        throw new Error("Query checker not found");
      }

      const isValid = await queryChecker.call(sqlQuery);
      return { sqlQuery, isValid };
    } catch (error) {
      console.error("Ошибка при генерации SQL:", error);
      return { sqlQuery: "", isValid: false };
    }
  }
}

/**
 * Класс для классификации запросов
 */
class QueryClassifier {
  classify(question) {
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('самая большая трата') || questionLower.includes('максимальная трата')) {
      return 'max_expense';
    } else if (questionLower.includes('потратил') || questionLower.includes('расход')) {
      return 'expenses';
    } else if (questionLower.includes('заработал') || questionLower.includes('доход')) {
      return 'income';
    } else if (questionLower.includes('баланс') || questionLower.includes('остаток')) {
      return 'balance';
    }
    
    return 'expenses';
  }
}

/**
 * SQL агент для работы с базой данных
 */
class SqlAgent {
  constructor(llm, db, tools) {
    this.llm = llm;
    this.db = db;
    this.tools = tools;
    this.sqlGenerator = new SqlGenerator(db, tools);
  }

  async invoke(state) {
    try {
      // Получаем последний вопрос пользователя
      const lastMessage = state.messages[state.messages.length - 1];
      const question = lastMessage.content;

      // Генерируем SQL запрос через AI
      const { sqlQuery, isValid } = await this.sqlGenerator.generateSql(question, state.userId);
      
      if (!isValid) {
        throw new Error('Не удалось сгенерировать корректный SQL запрос');
      }

      // Выполняем SQL запрос
      const result = await this.executeSqlQuery(sqlQuery);
      console.log('Результат SQL:', result);

      try {
        // Форматируем результат через AI
        const formattedResult = await this.formatResult(result, question);

        // Обновляем состояние с успешным результатом
        return {
          messages: [...state.messages, new AIMessage(formattedResult)],
          next: END,
          attempts: state.attempts + 1,
          hasData: true,
          sqlQuery,
          sqlResult: result
        };
      } catch (formatError) {
        console.error('Ошибка форматирования:', formatError);
        
        if (state.attempts < 2) {
          return {
            messages: [...state.messages],
            next: 'sql_agent',
            attempts: state.attempts + 1,
            hasData: false,
            sqlQuery: '',
            sqlResult: ''
          };
        }
        
        return {
          messages: [...state.messages, new AIMessage('Извините, произошла ошибка при обработке данных. Попробуйте еще раз.')],
          next: END,
          attempts: state.attempts + 1,
          hasData: false,
          sqlQuery: '',
          sqlResult: ''
        };
      }
    } catch (error) {
      console.error('Ошибка в SQL агенте:', error);
      
      if (state.attempts < 2) {
        return {
          messages: [...state.messages],
          next: 'sql_agent',
          attempts: state.attempts + 1,
          hasData: false,
          sqlQuery: '',
          sqlResult: ''
        };
      }
      
      return {
        messages: [...state.messages, new AIMessage('Извините, произошла ошибка при выполнении запроса. Попробуйте еще раз.')],
        next: END,
        attempts: state.attempts + 1,
        hasData: false,
        sqlQuery: '',
        sqlResult: ''
      };
    }
  }

  // Выполнение SQL запроса
  async executeSqlQuery(sqlQuery) {
    const queryTool = this.tools.find(t => t.name === "sql-db-query");
    if (!queryTool) {
      throw new Error("SQL query tool not found");
    }
    return await queryTool.call(sqlQuery);
  }

  // Форматирование результата через AI
  async formatResult(result, question) {
    try {
      // Проверяем, что результат уже является объектом
      const data = Array.isArray(result) ? result : JSON.parse(result);
      
      if (!Array.isArray(data)) {
        throw new Error('Результат SQL запроса должен быть массивом');
      }

      if (data.length === 0) {
        return 'В этом месяце расходов не было.';
      }

      let totalAmount = 0;
      let currency = '';

      data.forEach(row => {
        totalAmount += parseFloat(row.total_amount);
        if (!currency && row.currency_code) {
          currency = row.currency_code;
        }
      });

      let response = `В этом месяце вы потратили ${totalAmount.toLocaleString('ru-RU')} ${currency}.\n\nРасходы по категориям:\n`;
      data.forEach(row => {
        response += `- ${row.category_name}: ${parseFloat(row.total_amount).toLocaleString('ru-RU')} ${row.currency_code}\n`;
      });

      return response;
    } catch (error) {
      console.error('Ошибка при форматировании результата:', error);
      throw new Error('Ошибка при форматировании результата: ' + error.message);
    }
  }
}

/**
 * Создает граф с супервизором
 */
function createSupervisorGraph(db, llm, tools) {
  // Создаем граф состояний
  const workflow = new StateGraph({
    channels: {
      messages: z.array(z.any()),
      next: z.enum(["sql_agent", END]),
      attempts: z.number(),
      hasData: z.boolean(),
      sqlQuery: z.string(),
      sqlResult: z.string(),
      userId: z.number()
    }
  });

  // Создаем SQL агента
  const sqlAgent = new SqlAgent(llm, db, tools);

  // Добавляем узел SQL агента
  workflow.addNode("sql_agent", async (state) => {
    return await sqlAgent.invoke(state);
  });

  // Устанавливаем начальный узел
  workflow.setEntryPoint("sql_agent");

  // Компилируем граф
  return workflow.compile();
}

module.exports = {
  createSupervisorGraph
}; 