import React from 'react';

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    variant: 'default' | 'destructive' | 'secondary' | 'outline';
  };
  onClick?: () => void;
}

export interface ListCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  items: ListItem[];
  emptyMessage?: string;
  className?: string;
}