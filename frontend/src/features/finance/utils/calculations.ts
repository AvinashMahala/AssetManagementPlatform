export const calculateTotalAmount = <T extends { amount: number }>(items: T[]): number => {
  return items.reduce((sum, item) => sum + item.amount, 0);
};

export const calculateTotalPaid = <T extends { amountPaid?: number }>(items: T[]): number => {
  return items.reduce((sum, item) => sum + (item.amountPaid || 0), 0);
};

export const calculateTotalExpected = <T extends { totalAmount: number }>(items: T[]): number => {
  return items.reduce((sum, item) => sum + item.totalAmount, 0);
};
