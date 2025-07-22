const fs = require('fs');
const path = require('path');

/**
 * Класс для валидации и исправления SQL запросов
 */
class SqlValidator {
  constructor() {
    // Правильные имена таблиц в базе данных (с учетом регистра)
    this.tableNames = {
      // Основные таблицы
      'users': 'Users',
      'accounts': 'Accounts',
      'transactions': 'Transactions',
      'categories': 'Categories',
      'currencies': 'Currencies',
      'countries': 'Countries',
      'budgets': 'Budgets',
      'tags': 'Tags',
      'transactiontags': 'TransactionTags',
      'auditlog': 'AuditLog',
      
      // Представления (views)
      'transaction_details_view': 'transaction_details_view',
      'monthly_expense_summary_mv': 'monthly_expense_summary_mv',
      'account_balance_view': 'account_balance_view',
      'budget_vs_actual_view': 'budget_vs_actual_view',
      'transaction_search_view': 'transaction_search_view'
    };

    // Регулярные выражения для поиска имен таблиц в SQL
    this.tablePatterns = [
      /\bFROM\s+["']?(\w+)["']?/gi,
      /\bJOIN\s+["']?(\w+)["']?/gi,
      /\bINTO\s+["']?(\w+)["']?/gi,
      /\bUPDATE\s+["']?(\w+)["']?/gi,
      /\bDELETE\s+FROM\s+["']?(\w+)["']?/gi,
      /\bCREATE\s+TABLE\s+["']?(\w+)["']?/gi,
      /\bALTER\s+TABLE\s+["']?(\w+)["']?/gi,
      /\bDROP\s+TABLE\s+["']?(\w+)["']?/gi,
      /\bTRUNCATE\s+TABLE\s+["']?(\w+)["']?/gi
    ];

    // Логирование исправлений
    this.corrections = [];
  }

  /**
   * Валидация и исправление SQL запроса
   * @param {string} sql - исходный SQL запрос
   * @returns {object} - объект с исправленным SQL и информацией об исправлениях
   */
  validateAndFixSQL(sql) {
    let fixedSql = sql;
    const corrections = [];
    const foundTables = new Set();

    // Находим все упоминания таблиц в запросе
    this.tablePatterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern);
      while ((match = regex.exec(sql)) !== null) {
        foundTables.add(match[1].toLowerCase());
      }
    });

    // Проверяем и исправляем имена таблиц
    foundTables.forEach(tableName => {
      const lowerTableName = tableName.toLowerCase();
      if (this.tableNames[lowerTableName]) {
        const correctName = this.tableNames[lowerTableName];
        if (tableName !== correctName) {
          // Создаем регулярное выражение для замены с учетом границ слова
          const tableRegex = new RegExp(`\\b${tableName}\\b`, 'gi');
          fixedSql = fixedSql.replace(tableRegex, correctName);
          
          corrections.push({
            original: tableName,
            corrected: correctName,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    // Добавляем кавычки к именам таблиц с заглавными буквами для PostgreSQL
    Object.values(this.tableNames).forEach(tableName => {
      if (tableName[0] === tableName[0].toUpperCase()) {
        // Проверяем, если таблица не в кавычках
        const unquotedRegex = new RegExp(`\\b(?<!["'])${tableName}(?!["'])\\b`, 'g');
        fixedSql = fixedSql.replace(unquotedRegex, `"${tableName}"`);
      }
    });

    // Логируем исправления
    if (corrections.length > 0) {
      this.logCorrections(sql, fixedSql, corrections);
    }

    return {
      originalSql: sql,
      fixedSql: fixedSql,
      corrections: corrections,
      hasCorrections: corrections.length > 0
    };
  }

  /**
   * Проверка результата выполнения SQL запроса
   * @param {object} result - результат выполнения запроса
   * @param {string} sql - SQL запрос
   * @returns {object} - валидированный результат
   */
  validateResult(result, sql) {
    console.log("Validating result:", result);
    console.log("Result type:", typeof result);
    
    // Проверяем, что результат не пустой для SELECT запросов
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      // Если результат - это строка (JSON), пытаемся его парсить
      if (typeof result === 'string') {
        try {
          const parsedResult = JSON.parse(result);
          if (Array.isArray(parsedResult) && parsedResult.length === 0) {
            return {
              isValid: true,
              warning: 'Запрос не вернул результатов. Возможно, данные отсутствуют или условия фильтрации слишком строгие.',
              result: result
            };
          }
        } catch (e) {
          // Если не JSON, проверяем на ошибки
          if (result.includes('error') || result.includes('Error')) {
            return {
              isValid: false,
              error: 'Ошибка выполнения SQL запроса',
              result: result
            };
          }
        }
      }
      
      // Если результат - массив и пустой
      if (Array.isArray(result) && result.length === 0) {
        return {
          isValid: true,
          warning: 'Запрос не вернул результатов. Возможно, данные отсутствуют или условия фильтрации слишком строгие.',
          result: result
        };
      }
    }

    // Проверяем структуру результата - принимаем любой результат как валидный
    if (result !== null && result !== undefined) {
      return {
        isValid: true,
        result: result
      };
    }

    return {
      isValid: false,
      error: 'Результат запроса пустой или null',
      result: result
    };
  }

  /**
   * Логирование исправлений в файл
   */
  logCorrections(originalSql, fixedSql, corrections) {
    const logDir = path.join(__dirname, '..', 'logs');
    const logFile = path.join(logDir, 'sql-corrections.log');

    // Создаем директорию если не существует
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      originalSql: originalSql,
      fixedSql: fixedSql,
      corrections: corrections
    };

    // Добавляем в лог файл
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

    // Также выводим в консоль для отладки
    console.log('SQL исправлен:', {
      corrections: corrections,
      original: originalSql.substring(0, 100) + '...',
      fixed: fixedSql.substring(0, 100) + '...'
    });
  }

  /**
   * Получить список всех корректных имен таблиц
   */
  getValidTableNames() {
    return Object.values(this.tableNames);
  }

  /**
   * Добавить пользовательское правило для имени таблицы
   */
  addTableMapping(incorrectName, correctName) {
    this.tableNames[incorrectName.toLowerCase()] = correctName;
  }
}

module.exports = SqlValidator; 