import type { WalletDetails } from '../types/property';

/**
 * Generate UPI payment link for a wallet
 */
export const generateUPILink = (wallet: WalletDetails): string => {
  if (!wallet.upiId) return '';

  const params = new URLSearchParams({
    pa: wallet.upiId, // Payee UPI ID
    pn: wallet.upiName || '', // Payee Name
    cu: 'INR', // Currency
  });

  return `upi://pay?${params.toString()}`;
};

/**
 * Generate UPI QR code data URL (for display purposes)
 * In a real implementation, this would generate an actual QR code
 */
export const generateUPIQRData = (wallet: WalletDetails): string => {
  const upiLink = generateUPILink(wallet);
  // In a real app, you'd use a QR code library to generate the actual QR code
  // For now, we'll return a placeholder
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12" fill="black">
        UPI QR
      </text>
      <text x="100" y="120" text-anchor="middle" font-family="Arial" font-size="8" fill="gray">
        ${upiLink.substring(0, 20)}...
      </text>
    </svg>
  `)}`;
};

/**
 * Copy UPI link to clipboard
 */
export const copyUPILink = async (wallet: WalletDetails): Promise<boolean> => {
  const upiLink = generateUPILink(wallet);
  try {
    await navigator.clipboard.writeText(upiLink);
    return true;
  } catch (error) {
    console.error('Failed to copy UPI link:', error);
    return false;
  }
};

/**
 * Open UPI link in default UPI app
 */
export const openUPIApp = (wallet: WalletDetails): void => {
  const upiLink = generateUPILink(wallet);
  window.open(upiLink, '_blank');
};

/**
 * Validate UPI ID format
 */
export const isValidUPIId = (upiId: string): boolean => {
  // Basic UPI ID validation (should contain @ and be properly formatted)
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
  return upiRegex.test(upiId);
};

/**
 * Get wallet display name
 */
export const getWalletDisplayName = (type: WalletDetails['type']): string => {
  const walletNames: Record<WalletDetails['type'], string> = {
    PAYTM: 'Paytm',
    PHONEPE: 'PhonePe',
    GPAY: 'Google Pay',
    AMAZONPAY: 'Amazon Pay',
    OTHER: 'Other'
  };
  return walletNames[type] || type;
};

/**
 * Generate payment amount specific UPI link
 */
export const generateUPILinkWithAmount = (wallet: WalletDetails, amount: number): string => {
  if (!wallet.upiId) return '';

  const params = new URLSearchParams({
    pa: wallet.upiId,
    pn: wallet.upiName || '',
    cu: 'INR',
    am: amount.toString(),
  });

  return `upi://pay?${params.toString()}`;
};