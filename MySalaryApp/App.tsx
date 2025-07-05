import React from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';

// API базовый URL
const API_BASE_URL = 'http://localhost:3001/api';

// API сервис для аутентификации
const authAPI = {
  login: async (email, password) => {
    try {
      console.log('Login attempt:', email, password);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Ошибка авторизации',
        };
      }

      return {
        success: true,
        message: data.message || 'Успешный вход',
        data: {
          user: data.user,
          token: data.token,
        },
      };
    } catch (error) {
      console.error('Error during login:', error);

      // Fallback для демо аккаунта если сервер недоступен
      if (email === 'test@test.com' && password === '123456') {
        console.log('Using fallback authentication for test user');
        return {
          success: true,
          message: 'Успешный вход (демо режим - сервер недоступен)',
          data: {
            user: {
              id: 9,
              email: 'test@test.com',
              login: 'testuser',
            },
          },
        };
      }

      return {
        success: false,
        message:
          'Ошибка соединения с сервером. Попробуйте демо аккаунт: test@test.com / 123456',
      };
    }
  },

  register: async userData => {
    try {
      console.log('Register attempt:', userData.email, userData.login);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Ошибка регистрации',
        };
      }

      return {
        success: true,
        message: data.message || 'Успешная регистрация',
        data: {
          user: data.user,
          token: data.token,
        },
      };
    } catch (error) {
      console.error('Error during registration:', error);
      return {
        success: false,
        message: 'Ошибка соединения с сервером',
      };
    }
  },
};

// Добавляем authAPI в глобальную область для доступа из других компонентов
(global as any).authAPI = authAPI;
(global as any).API_BASE_URL = API_BASE_URL;

const App: React.FC = () => {
  return <AppNavigator />;
};

export default App;
