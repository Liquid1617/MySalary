import React from 'react';
import { DefaultCategoryIcon } from './DefaultCategoryIcon';
import { FoodGroceriesIcon } from './FoodGroceriesIcon';
import { BeautyCareIcon } from './BeautyCareIcon';
import { HomeGardenIcon } from './HomeGardenIcon';
import { TransportationIcon } from './TransportationIcon';
import { PublicTransportTaxiIcon } from './PublicTransportTaxiIcon';
import { RestaurantCafeBarIcon } from './RestaurantCafeBarIcon';
import { PharmacyIcon } from './PharmacyIcon';
import { AnimalIcon } from './AnimalIcon';
import { ClothesIcon } from './ClothesIcon';
import { SubscriptionIcon } from './SubscriptionIcon';
import { CelebrationIcon } from './CelebrationIcon';
import { EntertainmentIcon } from './EntertainmentIcon';

interface GetCategoryIconProps {
  categoryName: string;
  accountType: string;
  width?: number;
  height?: number;
}

// Функция получения цвета аккаунта
const getAccountColor = (accountType: string): string => {
  const accountColorMap: { [key: string]: string } = {
    cash: '#F0BF54',           // Золотой цвет для наличных
    bank_account: '#10BC74',   // Зеленый цвет для банковского счета  
    debit_card: '#3B82F6',     // Синий цвет для дебетовой карты
    credit_card: '#8B5CF6',    // Фиолетовый цвет для кредитной карты
    digital_wallet: '#EF4444', // Красный цвет для цифрового кошелька
  };
  
  return accountColorMap[accountType] || '#EEF1F2';
};

// Функция сопоставления категорий с иконками
export const getCategoryIcon = ({ categoryName, accountType, width = 28, height = 28 }: GetCategoryIconProps) => {
  const backgroundColor = getAccountColor(accountType);
  const fill = '#FFFFFF'; // Белый цвет для самой иконки
  
  // Нормализация названия категории для поиска
  const normalizedCategory = categoryName.toLowerCase();
  
  // Маппинг категорий на иконки
  if (normalizedCategory.includes('продукты') || 
      normalizedCategory.includes('питание') || 
      normalizedCategory.includes('food') ||
      normalizedCategory.includes('groceries')) {
    return <FoodGroceriesIcon width={width} height={height} backgroundColor={backgroundColor} fill={fill} />;
  }
  
  if (normalizedCategory.includes('красота') || 
      normalizedCategory.includes('уход') || 
      normalizedCategory.includes('beauty') ||
      normalizedCategory.includes('care')) {
    return <BeautyCareIcon width={width} height={height} backgroundColor={backgroundColor} fill={fill} />;
  }
  
  if (normalizedCategory.includes('дом') || 
      normalizedCategory.includes('быт') || 
      normalizedCategory.includes('home') ||
      normalizedCategory.includes('garden')) {
    return <HomeGardenIcon width={width} height={height} backgroundColor={backgroundColor} fill={fill} />;
  }
  
  if (normalizedCategory.includes('транспорт') && 
      (normalizedCategory.includes('общественный') || 
       normalizedCategory.includes('такси') ||
       normalizedCategory.includes('public') ||
       normalizedCategory.includes('taxi'))) {
    return <PublicTransportTaxiIcon width={width} height={height} backgroundColor={backgroundColor} fill={fill} />;
  }
  
  if (normalizedCategory.includes('транспорт') || 
      normalizedCategory.includes('transportation') ||
      normalizedCategory.includes('бензин') ||
      normalizedCategory.includes('парковка')) {
    return <TransportationIcon width={width} height={height} backgroundColor={backgroundColor} fill={fill} />;
  }
  
  if (normalizedCategory.includes('ресторан') || 
      normalizedCategory.includes('кафе') || 
      normalizedCategory.includes('бар') ||
      normalizedCategory.includes('restaurant') ||
      normalizedCategory.includes('cafe')) {
    return <RestaurantCafeBarIcon width={width} height={height} backgroundColor={backgroundColor} fill={fill} />;
  }
  
  if (normalizedCategory.includes('аптека') || 
      normalizedCategory.includes('медицина') || 
      normalizedCategory.includes('здоровье') ||
      normalizedCategory.includes('pharmacy') ||
      normalizedCategory.includes('health')) {
    return <PharmacyIcon width={width} height={height} backgroundColor={backgroundColor} fill={fill} />;
  }
  
  if (normalizedCategory.includes('животн') || 
      normalizedCategory.includes('питомц') || 
      normalizedCategory.includes('animal') ||
      normalizedCategory.includes('pet')) {
    return <AnimalIcon width={width} height={height} backgroundColor={backgroundColor} fill={fill} />;
  }
  
  if (normalizedCategory.includes('одежда') || 
      normalizedCategory.includes('обувь') || 
      normalizedCategory.includes('clothes') ||
      normalizedCategory.includes('clothing')) {
    return <ClothesIcon width={width} height={height} backgroundColor={backgroundColor} fill={fill} />;
  }
  
  if (normalizedCategory.includes('подписк') || 
      normalizedCategory.includes('subscription') ||
      normalizedCategory.includes('абонемент')) {
    return <SubscriptionIcon width={width} height={height} backgroundColor={backgroundColor} fill={fill} />;
  }
  
  if (normalizedCategory.includes('подарк') || 
      normalizedCategory.includes('празд') || 
      normalizedCategory.includes('celebration') ||
      normalizedCategory.includes('gift')) {
    return <CelebrationIcon width={width} height={height} backgroundColor={backgroundColor} fill={fill} />;
  }
  
  if (normalizedCategory.includes('развлечен') || 
      normalizedCategory.includes('entertainment') ||
      normalizedCategory.includes('игры') ||
      normalizedCategory.includes('кино')) {
    return <EntertainmentIcon width={width} height={height} backgroundColor={backgroundColor} fill={fill} />;
  }
  
  // Дефолтная иконка для всех остальных случаев
  return <DefaultCategoryIcon width={width} height={height} backgroundColor={backgroundColor} fill={fill} />;
};