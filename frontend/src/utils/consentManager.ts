/**
 * 🔐 User Consent Manager
 * 
 * Handles user permissions for error reporting and logging
 */

export interface ConsentStatus {
  backendReporting: boolean | null; // null = not asked yet
  localStorage: boolean | null;
  timestamp: string;
}

class ConsentManager {
  private static instance: ConsentManager;
  private readonly STORAGE_KEY = 'logging_consent';

  private constructor() {}

  public static getInstance(): ConsentManager {
    if (!ConsentManager.instance) {
      ConsentManager.instance = new ConsentManager();
    }
    return ConsentManager.instance;
  }

  /**
   * Get current consent status
   */
  public getConsent(): ConsentStatus {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load consent status:', error);
    }

    return {
      backendReporting: null,
      localStorage: null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Save consent preferences
   */
  public saveConsent(consent: Partial<ConsentStatus>): void {
    const current = this.getConsent();
    const updated: ConsentStatus = {
      ...current,
      ...consent,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save consent status:', error);
    }
  }

  /**
   * Check if user has given consent for backend reporting
   */
  public hasBackendReportingConsent(): boolean {
    const consent = this.getConsent();
    return consent.backendReporting === true;
  }

  /**
   * Check if user has given consent for localStorage logging
   */
  public hasLocalStorageConsent(): boolean {
    const consent = this.getConsent();
    return consent.localStorage === true;
  }

  /**
   * Check if user has been asked for consent
   */
  public hasBeenAsked(): boolean {
    const consent = this.getConsent();
    return consent.backendReporting !== null || consent.localStorage !== null;
  }

  /**
   * Clear all consent preferences
   */
  public clearConsent(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear consent status:', error);
    }
  }

  /**
   * Request consent from user
   */
  public async requestConsent(): Promise<ConsentStatus> {
    // This returns a promise that should be resolved by the UI
    // The UI component will call saveConsent() with the user's choice
    return new Promise((resolve) => {
      // Dispatch custom event that UI can listen to
      const event = new CustomEvent('logging:requestConsent', {
        detail: { resolve },
      });
      window.dispatchEvent(event);

      // Timeout after 30 seconds
      setTimeout(() => {
        resolve(this.getConsent());
      }, 30000);
    });
  }
}

// Export singleton instance
export const consentManager = ConsentManager.getInstance();

// Expose to window for debugging
if (import.meta.env.DEV) {
  (window as any).__consentManager = consentManager;
}
