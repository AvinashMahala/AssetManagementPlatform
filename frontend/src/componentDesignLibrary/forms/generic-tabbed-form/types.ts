import React from 'react';

export interface TabConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  hidden?: boolean;
}

export interface GenericTabbedFormProps {
  // Header
  title: string;
  subtitle?: string;

  // Tabs Configuration
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  completedTabs: Set<string>;
  
  // Validation & Status
  isEdit?: boolean;
  loading?: boolean;
  /**
   * Optional function to check if a specific tab has valid data.
   * Used to show green checkmarks in the progress indicator.
   */
  hasTabData?: (tabId: string) => boolean;

  // Actions
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  
  // Custom Labels (Optional)
  submitLabel?: string;
  cancelLabel?: string;
  nextLabel?: string;
  previousLabel?: string;

  // Optional footer center content (e.g., audit checkbox)
  footerCenter?: React.ReactNode;

  // Content
  children: React.ReactNode;
}
