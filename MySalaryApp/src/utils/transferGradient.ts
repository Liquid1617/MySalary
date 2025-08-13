import { getAccountTypeIcon } from './accountTypeIcon';

interface TransferGradientOptions {
  fromAccountType: string;
  toAccountType: string;
  gradientType?: 'radial' | 'linear';
}

interface GradientResult {
  backgroundStyle: string;
  cssGradient: string;
  fromColor: string;
  toColor: string;
}

/**
 * Generates a gradient color for transfer transaction icons
 * Left/start of gradient corresponds to the source account color
 * Right/end of gradient corresponds to the target account color
 */
export const createTransferGradient = ({
  fromAccountType,
  toAccountType,
  gradientType = 'radial',
}: TransferGradientOptions): GradientResult => {
  const fromAccount = getAccountTypeIcon(fromAccountType);
  const toAccount = getAccountTypeIcon(toAccountType);

  const fromColor = fromAccount.color;
  const toColor = toAccount.color;

  let cssGradient: string;
  
  if (gradientType === 'radial') {
    // Uses the same radial gradient structure from your example
    // radial-gradient(111.76% 118.1% at -11.76% 48.53%, #10BC74 0%, #F0BF54 90.38%)
    cssGradient = `radial-gradient(111.76% 118.1% at -11.76% 48.53%, ${fromColor} 0%, ${toColor} 90.38%)`;
  } else {
    // Linear gradient from left to right
    cssGradient = `linear-gradient(90deg, ${fromColor} 0%, ${toColor} 100%)`;
  }

  return {
    backgroundStyle: cssGradient,
    cssGradient,
    fromColor,
    toColor,
  };
};

/**
 * Helper function to get transfer gradient for React Native StyleSheet
 * Returns colors for use with react-native-linear-gradient or similar
 */
export const getTransferGradientColors = (
  fromAccountType: string,
  toAccountType: string,
): { colors: string[]; start: { x: number; y: number }; end: { x: number; y: number } } => {
  const fromAccount = getAccountTypeIcon(fromAccountType);
  const toAccount = getAccountTypeIcon(toAccountType);

  return {
    colors: [fromAccount.color, toAccount.color],
    start: { x: 0, y: 0.5 }, // Left center
    end: { x: 1, y: 0.5 },   // Right center
  };
};

/**
 * Get all possible account type combinations for transfers
 */
export const getAllTransferGradients = () => {
  const accountTypes = ['debit_card', 'credit_card', 'bank_account', 'cash', 'digital_wallet'];
  const gradients: Array<{
    from: string;
    to: string;
    gradient: GradientResult;
  }> = [];

  accountTypes.forEach(fromType => {
    accountTypes.forEach(toType => {
      if (fromType !== toType) {
        gradients.push({
          from: fromType,
          to: toType,
          gradient: createTransferGradient({
            fromAccountType: fromType,
            toAccountType: toType,
          }),
        });
      }
    });
  });

  return gradients;
};

/**
 * Check if a transaction is a transfer type that should use gradient
 */
export const shouldUseTransferGradient = (
  transactionType: string,
  fromAccountType?: string,
  toAccountType?: string,
): boolean => {
  return (
    transactionType === 'transfer' &&
    fromAccountType !== undefined &&
    toAccountType !== undefined &&
    fromAccountType !== toAccountType
  );
};