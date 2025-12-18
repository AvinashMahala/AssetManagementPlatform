import React from 'react';

export interface AlertCardProps {
  title: string;
  messages: string[];
  icon?: React.ReactNode;
  variant?: 'warning' | 'error' | 'info';
  actions?: React.ReactNode;
  className?: string;
}