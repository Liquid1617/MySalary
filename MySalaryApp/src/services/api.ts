import AsyncStorage from '@react-native-async-storage/async-storage';

// const API_BASE_URL = 'http://localhost:3001/api'; // Для iOS simulator (не работает)
const API_BASE_URL = 'http://127.0.0.1:3001/api'; // Для iOS simulator

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  login: string;
  email: string;
  password: string;
  phone?: string;
  country_id?: number;
}

interface AuthResponse {
  message: string;
  user: {
    id: number;
    login: string;
    email: string;
    phone?: string;
    country_id?: number;
  };
  token: string;
}

interface ApiError {
  error: string;
}

interface Country {
  id: number;
  name: string;
  code: string;
}

interface CountriesResponse {
  countries: Country[];
}

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

export interface CurrenciesResponse {
  currencies: Currency[];
}

interface CheckResponse {
  message: string;
  available: boolean;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await AsyncStorage.getItem('token');

    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка сервера');
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Ошибка сети');
    }
  }

  async checkLoginAvailability(login: string): Promise<CheckResponse> {
    return this.request<CheckResponse>('/auth/check-login', {
      method: 'POST',
      body: JSON.stringify({ login }),
    });
  }

  async checkEmailAvailability(email: string): Promise<CheckResponse> {
    return this.request<CheckResponse>('/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async checkPhoneAvailability(phone: string): Promise<CheckResponse> {
    return this.request<CheckResponse>('/auth/check-phone', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Сохраняем токен в локальное хранилище
    await AsyncStorage.setItem('token', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));

    return response;
  }

  async login(loginData: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });

    // Сохраняем токен в локальное хранилище
    await AsyncStorage.setItem('token', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));

    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async getCountries(): Promise<CountriesResponse> {
    return this.request<CountriesResponse>('/countries');
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  }

  async getStoredToken(): Promise<string | null> {
    return AsyncStorage.getItem('token');
  }

  async getStoredUser(): Promise<any> {
    const userString = await AsyncStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  }

  async updateStoredUser(user: any): Promise<void> {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  }

  async checkAuthStatus(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      if (!token) {
        return false;
      }

      // Проверяем валидность токена через API
      await this.getCurrentUser();
      return true;
    } catch (error) {
      // Если токен невалидный, очищаем хранилище
      await this.logout();
      return false;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async getCurrencies(): Promise<CurrenciesResponse> {
    return this.request<CurrenciesResponse>('/currencies');
  }

  async updateUserProfile(data: {
    primary_currency_id?: number;
    name?: string;
    login?: string;
    email?: string;
    current_password?: string;
    new_password?: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getAccountBalance(accountId: number): Promise<{
    balance: number;
    currency: { id: number; code: string; name: string; symbol: string };
  }> {
    return this.request<{
      balance: number;
      currency: { id: number; code: string; name: string; symbol: string };
    }>(`/accounts/${accountId}/balance`);
  }
}

export const apiService = new ApiService();
export type {
  AuthResponse,
  ApiError,
  LoginRequest,
  RegisterRequest,
  Country,
  CountriesResponse,
  CheckResponse,
};
