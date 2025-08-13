export const formatTransactionDate = (dateString: string) => {
  const transactionDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time to compare dates only
  const transactionDateOnly = new Date(
    transactionDate.getFullYear(),
    transactionDate.getMonth(),
    transactionDate.getDate(),
  );
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const yesterdayOnly = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate(),
  );

  // Проверяем, является ли дата будущей
  const isFuture = transactionDateOnly.getTime() > todayOnly.getTime();

  if (transactionDateOnly.getTime() === todayOnly.getTime()) {
    return 'Today';
  } else if (transactionDateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday';
  } else if (isFuture) {
    const formatted = transactionDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return formatted; // Убрали иконку календаря для будущих дат
  } else {
    return transactionDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
};