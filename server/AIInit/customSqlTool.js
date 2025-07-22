const { Tool } = require("@langchain/core/tools");
const { SqlDatabase } = require("langchain/sql_db");
const SqlValidator = require('./sqlValidator');

/**
 * Кастомный SQL инструмент с валидацией и исправлением запросов
 */
class ValidatedQuerySqlTool extends Tool {
  static lc_name() {
    return "ValidatedQuerySqlTool";
  }

  constructor(db) {
    super();
    this.db = db;
    this.validator = new SqlValidator();
    this.name = "sql-db-query";
    this.description = `Input to this tool is a detailed and correct SQL query, output is a result from the database.
    If the query is not correct, an error message will be returned.
    If an error is returned, rewrite the query, check the query, and try again.`;
  }

  async _call(input) {
    try {
      console.log('Исходный SQL запрос:', input);
      
      // Валидируем и исправляем SQL запрос
      const validation = this.validator.validateAndFixSQL(input);
      
      if (validation.hasCorrections) {
        console.log('SQL запрос был исправлен:', validation.corrections);
      }
      
      // Выполняем исправленный запрос
      const result = await this.db.run(validation.fixedSql);
      console.log('Результат выполнения SQL:', result);
      
      // Валидируем результат
      const resultValidation = this.validator.validateResult(result, validation.fixedSql);
      console.log('Результат валидации:', resultValidation);
      
      if (!resultValidation.isValid) {
        return `Ошибка валидации результата: ${resultValidation.error}`;
      }
      
      // Возвращаем результат с предупреждением если есть
      if (resultValidation.warning) {
        console.log('Предупреждение валидации:', resultValidation.warning);
      }
      
      // Возвращаем результат как есть, без дополнительной сериализации
      return result;
    } catch (error) {
      console.error('Ошибка выполнения SQL:', error);
      
      // Пытаемся дать более информативное сообщение об ошибке
      if (error.message.includes('does not exist')) {
        const tables = this.validator.getValidTableNames();
        return `Ошибка: ${error.message}\n\nДоступные таблицы: ${tables.join(', ')}\n\nУбедитесь, что используете правильные имена таблиц с учетом регистра.`;
      }
      
      return `Ошибка выполнения запроса: ${error.message}`;
    }
  }
}

/**
 * Кастомный инструмент для получения информации о схеме базы данных
 */
class ValidatedInfoSqlTool extends Tool {
  static lc_name() {
    return "ValidatedInfoSqlTool";
  }

  constructor(db) {
    super();
    this.db = db;
    this.validator = new SqlValidator();
    this.name = "sql-db-schema";
    this.description = `Input to this tool is a comma-separated list of tables, output is the schema and sample rows for those tables.
    Be sure that the tables actually exist by calling sql-db-list-tables first!
    
    Example Input: "table1, table2, table3"`;
  }

  async _call(input) {
    try {
      // Разбираем список таблиц
      const tables = input.split(',').map(t => t.trim());
      const correctedTables = [];
      
      // Исправляем имена таблиц
      for (const table of tables) {
        const lowerTable = table.toLowerCase();
        const tableMapping = {
          'users': 'Users',
          'accounts': 'Accounts', 
          'transactions': 'Transactions',
          'categories': 'Categories',
          'currencies': 'Currencies',
          'countries': 'Countries',
          'budgets': 'Budgets',
          'tags': 'Tags',
          'transactiontags': 'TransactionTags',
          'auditlog': 'AuditLog'
        };
        
        const correctName = tableMapping[lowerTable] || table;
        correctedTables.push(correctName);
        
        if (correctName !== table) {
          console.log(`Исправлено имя таблицы: ${table} -> ${correctName}`);
        }
      }
      
      // Получаем информацию о схеме с исправленными именами
      const correctedInput = correctedTables.join(', ');
      const result = await this.db.getTableInfo(correctedInput);
      
      return result;
    } catch (error) {
      console.error('Ошибка получения схемы:', error);
      return `Ошибка получения информации о схеме: ${error.message}`;
    }
  }
}

/**
 * Кастомный инструмент для списка таблиц
 */
class ValidatedListTablesSqlTool extends Tool {
  static lc_name() {
    return "ValidatedListTablesSqlTool";
  }

  constructor(db) {
    super();
    this.db = db;
    this.name = "sql-db-list-tables";
    this.description = "Input is an empty string, output is a comma-separated list of tables in the database.";
  }

  async _call(_) {
    try {
      const tables = await this.db.allTables;
      // Фильтруем только основные таблицы (исключаем системные)
      const userTables = tables.filter(table => 
        !table.startsWith('pg_') && 
        !table.startsWith('information_schema') &&
        table !== 'SequelizeMeta'
      );
      return userTables.join(', ');
    } catch (error) {
      return `Ошибка получения списка таблиц: ${error.message}`;
    }
  }
}

/**
 * Кастомный инструмент для проверки синтаксиса запроса
 */
class QueryCheckerTool extends Tool {
  static lc_name() {
    return "QueryCheckerTool";
  }

  constructor(db) {
    super();
    this.db = db;
    this.validator = new SqlValidator();
    this.name = "query-checker";
    this.description = `Use this tool to check if your query is correct before executing it.
    Input is the SQL query to check.
    Output is the validation result with suggestions if needed.`;
  }

  async _call(input) {
    try {
      const validation = this.validator.validateAndFixSQL(input);
      
      if (validation.hasCorrections) {
        return `Запрос содержит ошибки в именах таблиц. Исправленный запрос:\n\n${validation.fixedSql}\n\nИсправления: ${JSON.stringify(validation.corrections)}`;
      }
      
      return "Запрос выглядит корректным. Можете его выполнить.";
    } catch (error) {
      return `Ошибка проверки запроса: ${error.message}`;
    }
  }
}

/**
 * Создание кастомного SQL toolkit с валидацией
 */
class ValidatedSqlToolkit {
  constructor(db, llm) {
    this.db = db;
    this.llm = llm;
    this.tools = this.createTools();
  }

  createTools() {
    return [
      new ValidatedQuerySqlTool(this.db),
      new ValidatedInfoSqlTool(this.db),
      new ValidatedListTablesSqlTool(this.db),
      new QueryCheckerTool(this.db)
    ];
  }

  getTools() {
    return this.tools;
  }
}

module.exports = {
  ValidatedSqlToolkit,
  ValidatedQuerySqlTool,
  ValidatedInfoSqlTool,
  ValidatedListTablesSqlTool,
  QueryCheckerTool
}; 