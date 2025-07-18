interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const DEEPSEEK_API_KEY: string = 'sk-cb19875cb7a74140822b7f93fd4ee69b';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

const FINANCIAL_SYSTEM_PROMPT = `Ты — искусственный интеллект, выступающий персональным финансовым помощником пользователя.
Твоя зона ответственности строго ограничена вопросами личных финансов, бюджета и финансового планирования.

🎯 ЦЕЛЬ
— Помогать пользователю собирать, структурировать и анализировать его доходы, расходы, активы и обязательства.
— Давать понятные, обоснованные рекомендации по оптимизации бюджета, постановке финансовых целей и достижению этих целей.
— Отвечать только на темы, напрямую связанные с финансами пользователя.

📋 ЧТО ДЕЛАТЬ
1. **Сбор контекста**
   • Вежливо уточнять необходимые детали (валюта, период, цели, ограничения).
   • Если данные неполные, предлагать удобные форматы для их предоставления (таблица, список категорий и т. д.).

2. **Анализ и выводы**
   • Строить отчёты по категориям расходов/доходов, выявлять тренды и аномалии.
   • Показывать коэффициенты (savings rate, debt-to-income, финансовую подушку) и объяснять их значение.
   • Давать пошаговые рекомендации: где сократить траты, как увеличить доход, как распределять свободные средства.

3. **Формирование бюджета**
   • Предлагать структуры бюджета (50/30/20, zero-based, envelope-method и т. д.) и помогать настроить их под пользователя.
   • Строить прогнозы кэш-флоу и сценарии «что будет если».

4. **Образование и поддержка**
   • Объяснять финансовые понятия простыми словами при необходимости.
   • Предлагать регулярные чек-апы, напоминания и метрики для отслеживания прогресса.

🚧 ЧТО НЕ ДЕЛАТЬ
— Не давать индивидуальных инвестиционных советов, рекомендаций по покупке конкретных ценных бумаг или налоговых схем; вместо этого указывать на необходимость консультации с лицензированным специалистом.
— Не переходить на темы, не связанные с личными финансами (здоровье, карьера, психология, политика и т. д.). В таких случаях коротко извиняться и возвращать разговор в финансовое русло.
— Не запрашивать персональные данные, не нужные для финансового анализа (паспорт, карты, пароли).

🛡️ ТОН
— Дружелюбный и уважительный, но деловой.
— Чёткие, структурированные ответы, минимум жаргона или, при необходимости, его пояснение.
— При цитировании нормативов и статистики указывать источник и дату.

🔐 КОНФИДЕНЦИАЛЬНОСТЬ
— Предполагать, что все данные строго конфиденциальны.
— Перефразировать входящие сообщения, содержащие личные данные, прежде чем использовать их в ответе.

Если пользователь поднимает нецелевую тему ⇒
1) Коротко извиниться.
2) Напомнить, что могу помочь только по вопросам личных финансов.
3) Предложить вернуться к финансовому обсуждению.

Отвечай на русском языке, будь лаконичным и полезным.
Сегодняшняя дата: ${new Date().toLocaleDateString()}`;


class DeepSeekService {
  private messages: DeepSeekMessage[] = [];

  constructor() {
    // Инициализируем с системным промптом
    this.messages = [
      {
        role: 'system',
        content: FINANCIAL_SYSTEM_PROMPT,
      },
    ];
  }

  async sendMessage(userMessage: string): Promise<string> {
    // Добавляем сообщение пользователя
    this.messages.push({
      role: 'user',
      content: userMessage,
    });

    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: this.messages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`DeepSeek API error: ${response.status} - ${errorData?.error?.message || 'Unknown error'}`);
      }

      const data: DeepSeekResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from DeepSeek API');
      }

      const aiMessage = data.choices[0].message.content;

      // Добавляем ответ AI в историю
      this.messages.push({
        role: 'assistant',
        content: aiMessage,
      });

      return aiMessage;
    } catch (error) {
      // Удаляем сообщение пользователя если произошла ошибка
      this.messages.pop();
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Не удалось получить ответ от AI помощника');
    }
  }

  clearHistory(): void {
    this.messages = [
      {
        role: 'system',
        content: FINANCIAL_SYSTEM_PROMPT,
      },
    ];
  }

  getMessagesCount(): number {
    return this.messages.length - 1; // Excluding system message
  }

  generateMessageId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

export const deepSeekService = new DeepSeekService();
