import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export interface BiometricCapability {
  available: boolean;
  biometryType: BiometryTypes | null;
  error?: string;
}

class BiometricService {
  private rnBiometrics: ReactNativeBiometrics;

  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: false, // Только биометрия, без PIN/пароля
    });
  }

  /**
   * Проверяет доступность биометрической аутентификации
   */
  async checkBiometricCapability(): Promise<BiometricCapability> {
    try {
      const { available, biometryType, error } =
        await this.rnBiometrics.isSensorAvailable();

      return {
        available,
        biometryType,
        error,
      };
    } catch (error) {
      return {
        available: false,
        biometryType: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Запрашивает биометрическую аутентификацию
   */
  async authenticateWithBiometrics(
    promptMessage?: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const capability = await this.checkBiometricCapability();

      if (!capability.available) {
        return {
          success: false,
          error: 'Биометрическая аутентификация недоступна',
        };
      }

      const defaultMessage = this.getDefaultPromptMessage(
        capability.biometryType,
      );

      const { success, error } = await this.rnBiometrics.simplePrompt({
        promptMessage: promptMessage || defaultMessage,
        cancelButtonText: 'Отмена',
      });

      return {
        success,
        error,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Ошибка биометрической аутентификации',
      };
    }
  }

  /**
   * Получает сообщение по умолчанию в зависимости от типа биометрии
   */
  private getDefaultPromptMessage(biometryType: BiometryTypes | null): string {
    switch (biometryType) {
      case BiometryTypes.FaceID:
        return 'Используйте Face ID для входа в MySalary';
      case BiometryTypes.TouchID:
        return 'Используйте Touch ID для входа в MySalary';
      case BiometryTypes.Biometrics:
        return 'Используйте биометрию для входа в MySalary';
      default:
        return 'Подтвердите вход в MySalary';
    }
  }

  /**
   * Получает название типа биометрии для отображения пользователю
   */
  getBiometryDisplayName(biometryType: BiometryTypes | null): string {
    switch (biometryType) {
      case BiometryTypes.FaceID:
        return 'Face ID';
      case BiometryTypes.TouchID:
        return 'Touch ID';
      case BiometryTypes.Biometrics:
        return 'Биометрия';
      default:
        return 'Биометрическая аутентификация';
    }
  }

  /**
   * Проверяет, включена ли биометрическая аутентификация
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Ошибка проверки настроек биометрии:', error);
      return false;
    }
  }

  /**
   * Включает/выключает биометрическую аутентификацию
   */
  async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled.toString());
    } catch (error) {
      console.error('Ошибка сохранения настроек биометрии:', error);
      throw new Error('Не удалось сохранить настройки биометрии');
    }
  }

  /**
   * Проверяет, можно ли использовать биометрию для входа
   */
  async canUseBiometricLogin(): Promise<boolean> {
    const capability = await this.checkBiometricCapability();
    const isEnabled = await this.isBiometricEnabled();

    return capability.available && isEnabled;
  }

  /**
   * Очищает настройки биометрии (при выходе из аккаунта)
   */
  async clearBiometricSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    } catch (error) {
      console.error('Ошибка очистки настроек биометрии:', error);
    }
  }
}

export const biometricService = new BiometricService();
export type { BiometryTypes };
