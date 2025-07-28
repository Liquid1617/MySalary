import AsyncStorage from '@react-native-async-storage/async-storage';

// For iOS Simulator, use your machine's IP address  
const API_BASE_URL = 'http://192.168.31.188:3001/api';
// const API_BASE_URL = 'http://localhost:3002/api'; // Only works for Android emulator on same machine

interface LoginRequest {
  username: string;
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
      console.log(`=== API REQUEST ${options.method || 'GET'} ===`);
      console.log('URL:', url);
      console.log('Has token:', !!token);
      console.log('Config:', JSON.stringify(config, null, 2));

      const response = await fetch(url, config);
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error('Request failed with:', data);
        throw new Error(data.error || 'Ошибка сервера');
      }

      return data as T;
    } catch (error) {
      console.error('=== API REQUEST ERROR ===');
      console.error('URL:', url);
      console.error('Error:', error);
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
      console.log('=== API checkAuthStatus ===');
      const token = await this.getStoredToken();
      console.log('Token check:', token ? 'exists' : 'not found');
      if (!token) {
        console.log('No token found, returning false');
        return false;
      }

      // Проверяем валидность токена через API
      console.log('Making getCurrentUser request...');
      await this.getCurrentUser();
      console.log('getCurrentUser successful, user is authenticated');
      return true;
    } catch (error) {
      console.error('checkAuthStatus error:', error);
      // Если токен невалидный, очищаем хранилище
      console.log('Clearing token due to error');
      await this.logout();
      return false;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    console.log(`=== API POST ${endpoint} ===`);
    console.log('Request data:', JSON.stringify(data, null, 2));
    
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    console.log(`=== API PUT ${endpoint} ===`);
    console.log('Request data:', JSON.stringify(data, null, 2));
    
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    console.log(`=== API DELETE ${endpoint} ===`);
    
    const token = await AsyncStorage.getItem('token');
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    try {
      console.log('DELETE request URL:', url);
      console.log('DELETE request config:', JSON.stringify(config, null, 2));
      
      const response = await fetch(url, config);
      
      console.log('DELETE response status:', response.status);
      console.log('DELETE response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status} ${response.statusText}` };
        }
        console.log('DELETE error data:', errorData);
        throw new Error(errorData.error || 'Ошибка сервера');
      }

      // For DELETE requests, if status is 204 (No Content), return empty object
      if (response.status === 204) {
        console.log('DELETE successful (204 No Content)');
        return {} as T;
      }

      // Try to parse JSON response
      try {
        const data = await response.json();
        console.log('DELETE response data:', data);
        return data as T;
      } catch {
        // If no JSON response, return empty object
        console.log('DELETE successful (no JSON response)');
        return {} as T;
      }
    } catch (error) {
      console.error('DELETE request failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Ошибка сети');
    }
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

  async confirmTransaction(transactionId: number, mode: 'today' | 'scheduledDate'): Promise<any> {
    return this.request(`/transactions/${transactionId}/confirm`, {
      method: 'PATCH',
      body: JSON.stringify({ mode }),
    });
  }

  async updateTransactionDate(transactionId: number, newDate: string): Promise<any> {
    return this.request(`/transactions/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify({ transaction_date: newDate }),
    });
  }

  async unconfirmTransaction(transactionId: number): Promise<any> {
    return this.request(`/transactions/${transactionId}/unconfirm`, {
      method: 'PATCH',
    });
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
