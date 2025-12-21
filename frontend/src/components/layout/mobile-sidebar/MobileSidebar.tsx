import React from 'react';
import { Sidebar } from '../sidebar';
import type { MobileSidebarProps } from './MobileSidebar.types';

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 lg:hidden">
        <Sidebar />
      </aside>
    </>
  );
};