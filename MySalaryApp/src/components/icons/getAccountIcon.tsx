import React from 'react';
import { BankIcon } from './BankIcon';
import { CashIcon } from './CashIcon';
import { CreditCardIcon } from './CreditCardIcon';
import { DebitCardIcon } from './DebitCardIcon';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

interface GetAccountIconProps {
  accountType: string;
  size?: number;
  color?: string;
}

export const getAccountIcon = ({ accountType, size = 20, color = '#000' }: GetAccountIconProps) => {
  // Calculate proportional sizes for SVG icons to match FontAwesome5 icon sizes
  const svgWidth = size * 1.4; // SVG icons are wider
  const svgHeight = size * 1.2; // Adjust height proportionally

  switch (accountType) {
    case 'cash':
      return <CashIcon width={svgWidth} height={svgHeight} fill={color} />;
    case 'credit_card':
      return <CreditCardIcon width={svgWidth} height={svgHeight} fill={color} />;
    case 'debit_card':
      return <DebitCardIcon width={svgWidth} height={svgHeight} fill={color} />;
    case 'bank_account':
      return <BankIcon width={svgWidth} height={svgHeight * 1.15} fill={color} />;
    case 'digital_wallet':
      return (
        <FontAwesome5
          name="mobile-alt"
          size={size * 1.2}
          color={color}
          solid
        />
      );
    default:
      return (
        <FontAwesome5
          name="piggy-bank"
          size={size}
          color={color}
          solid
        />
      );
  }
};