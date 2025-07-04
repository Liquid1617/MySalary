# 🎨 Модульная система стилей MySalary

## 📂 Структура стилей

```
src/styles/
├── index.ts                     # Главный файл экспорта всех стилей
├── colors.ts                    # Цветовая палитра
├── globalStyles.ts             # Глобальные стили (legacy)
├── common/
│   ├── layout.styles.ts        # Общие стили для layout
│   └── typography.styles.ts    # Стили для типографики
├── components/
│   ├── CustomButton.styles.ts  # Стили для кнопок
│   └── CustomInput.styles.ts   # Стили для инпутов
└── screens/
    ├── LoginScreen.styles.ts   # Стили для экрана входа
    └── RegisterScreen.styles.ts # Стили для экрана регистрации
```

## 🚀 Использование

### Импорт стилей

```typescript
// Импорт всех стилей через index
import { 
  colors, 
  layoutStyles, 
  typographyStyles,
  customButtonStyles,
  loginScreenStyles 
} from '../styles';

// Или импорт отдельных модулей
import { colors } from '../styles/colors';
import { layoutStyles } from '../styles/common/layout.styles';
```

### Примеры использования

#### 1. Цвета
```typescript
<Text style={{ color: colors.primary }}>Текст</Text>
<View style={{ backgroundColor: colors.background }}>
```

#### 2. Типографика
```typescript
<Text style={[typographyStyles.h1, typographyStyles.textCenter]}>
  Заголовок
</Text>
```

#### 3. Layout стили
```typescript
<View style={[layoutStyles.container, layoutStyles.paddingHorizontal]}>
  <View style={layoutStyles.rowSpaceBetween}>
    ...
  </View>
</View>
```

#### 4. Комбинирование стилей
```typescript
<TouchableOpacity 
  style={[
    customButtonStyles.container,
    customButtonStyles.primary,
    layoutStyles.marginBottom
  ]}
>
```

## 🎨 Доступные модули

### Colors (colors.ts)
- **Primary:** `primary`, `primaryDark`, `primaryLight`
- **Basic:** `white`, `black`, `gray`, `lightGray`, `darkGray`
- **System:** `success`, `warning`, `error`, `red`
- **Background:** `background`, `backgroundSecondary`

### Typography (typography.styles.ts)
- **Заголовки:** `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- **Основной текст:** `body1`, `body2`, `body3`
- **Цвета текста:** `textPrimary`, `textSecondary`, `textError`
- **Выравнивание:** `textCenter`, `textLeft`, `textRight`
- **Стили шрифта:** `fontBold`, `fontMedium`, `italic`

### Layout (layout.styles.ts)
- **Контейнеры:** `container`, `safeArea`, `centeredContainer`
- **Отступы:** `padding`, `paddingSmall`, `paddingLarge`
- **Маргины:** `marginBottom`, `marginTop`, `marginBottomLarge`
- **Flexbox:** `row`, `rowCenter`, `rowSpaceBetween`, `center`
- **Тени:** `shadow`, `shadowSmall`, `shadowLarge`

### Components
- **CustomButton:** `container`, `primary`, `secondary`, `disabled`
- **CustomInput:** `container`, `label`, `inputContainer`, `error`

## 📱 Преимущества модульной системы

### ✅ Плюсы:
- **Организация**: Четкое разделение стилей по назначению
- **Переиспользование**: Общие стили доступны везде
- **Согласованность**: Единая типографика и цвета
- **Масштабируемость**: Легко добавлять новые компоненты
- **Поддержка**: Легко находить и изменять стили

### 🔧 Как добавить новый компонент:

1. Создайте файл стилей:
```typescript
// src/styles/components/NewComponent.styles.ts
import { StyleSheet } from 'react-native';
import { colors } from '../colors';

export const newComponentStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: 16,
  },
  // ...другие стили
});
```

2. Добавьте экспорт в index.ts:
```typescript
export { newComponentStyles } from './components/NewComponent.styles';
```

3. Используйте в компоненте:
```typescript
import { newComponentStyles } from '../styles';

// В компоненте
<View style={newComponentStyles.container}>
```

## 🎯 Лучшие практики

1. **Используйте семантические названия**: `primary` вместо `blue`
2. **Комбинируйте стили**: `[layoutStyles.row, typographyStyles.h2]`
3. **Переиспользуйте общие стили**: Не дублируйте код
4. **Следуйте конвенциям**: BEM-подобные названия для стилей
5. **Документируйте изменения**: Обновляйте этот README

## 🔄 Миграция со старых стилей

Старые стили из `globalStyles.ts` все еще работают для обратной совместимости, но рекомендуется переходить на новую систему:

```typescript
// Старый способ ❌
import { GlobalStyles } from '../styles/globalStyles';
<Text style={GlobalStyles.title}>

// Новый способ ✅
import { typographyStyles } from '../styles';
<Text style={typographyStyles.h1}>
``` 