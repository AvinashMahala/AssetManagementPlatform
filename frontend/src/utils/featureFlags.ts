/**
 * 🎛️ Feature Flags Configuration
 * 
 * Controls which features are enabled in different environments
 */

export interface FeatureFlags {
  enableConsoleLogging: boolean;
  enableLocalStorageLogging: boolean;
  enableBackendReporting: boolean;
  requireUserConsent: boolean;
  showErrorBoundaryUI: boolean;
}

class FeatureFlagManager {
  private static instance: FeatureFlagManager;
  private flags: FeatureFlags;

  private constructor() {
    this.flags = this.loadFlags();
  }

  public static getInstance(): FeatureFlagManager {
    if (!FeatureFlagManager.instance) {
      FeatureFlagManager.instance = new FeatureFlagManager();
    }
    return FeatureFlagManager.instance;
  }

  private loadFlags(): FeatureFlags {
    const env = import.meta.env.MODE || 'development';
    const isDevelopment = env === 'development';

    // Default flags based on environment
    const defaultFlags: FeatureFlags = {
      // Console logging: Development only by default
      enableConsoleLogging: isDevelopment,
      
      // LocalStorage: Development only by default
      enableLocalStorageLogging: isDevelopment,
      
      // Backend reporting: Only with user consent in production
      enableBackendReporting: false,
      
      // Require consent: Always in production, optional in dev
      requireUserConsent: !isDevelopment,
      
      // Error boundary UI: Always show (graceful degradation)
      showErrorBoundaryUI: true,
    };

    // Override with localStorage settings if available
    try {
      const savedFlags = localStorage.getItem('feature_flags');
      if (savedFlags) {
        return { ...defaultFlags, ...JSON.parse(savedFlags) };
      }
    } catch (error) {
      console.warn('Failed to load feature flags from storage:', error);
    }

    return defaultFlags;
  }

  public getFlags(): FeatureFlags {
    return { ...this.flags };
  }

  public updateFlags(updates: Partial<FeatureFlags>): void {
    this.flags = { ...this.flags, ...updates };
    
    try {
      localStorage.setItem('feature_flags', JSON.stringify(this.flags));
    } catch (error) {
      console.warn('Failed to save feature flags to storage:', error);
    }
  }

  public isConsoleLoggingEnabled(): boolean {
    return this.flags.enableConsoleLogging;
  }

  public isLocalStorageLoggingEnabled(): boolean {
    return this.flags.enableLocalStorageLogging;
  }

  public isBackendReportingEnabled(): boolean {
    return this.flags.enableBackendReporting;
  }

  public requiresUserConsent(): boolean {
    return this.flags.requireUserConsent;
  }

  public showErrorBoundaryUI(): boolean {
    return this.flags.showErrorBoundaryUI;
  }

  public enableDevelopmentMode(): void {
    this.updateFlags({
      enableConsoleLogging: true,
      enableLocalStorageLogging: true,
      requireUserConsent: false,
    });
  }

  public enableProductionMode(): void {
    this.updateFlags({
      enableConsoleLogging: false,
      enableLocalStorageLogging: false,
      requireUserConsent: true,
    });
  }

  public reset(): void {
    try {
      localStorage.removeItem('feature_flags');
      this.flags = this.loadFlags();
    } catch (error) {
      console.warn('Failed to reset feature flags:', error);
    }
  }
}

// Export singleton instance
export const featureFlags = FeatureFlagManager.getInstance();

// Expose to window for debugging
if (import.meta.env.DEV) {
  (window as any).__featureFlags = featureFlags;
  console.log('[Feature Flags] Available at window.__featureFlags');
  console.log('[Feature Flags] Current settings:', featureFlags.getFlags());
}
