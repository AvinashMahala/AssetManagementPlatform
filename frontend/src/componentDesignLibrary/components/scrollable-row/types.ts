import React from 'react';

export interface ScrollableRowProps {
  title?: string;
  children: React.ReactNode;
  onScrollLeft?: () => void;
  onScrollRight?: () => void;
  className?: string;
}