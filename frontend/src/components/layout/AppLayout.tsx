import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { MobileSidebar } from './mobile-sidebar';
import { Breadcrumbs } from '@/componentDesignLibrary';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBreadcrumbs?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title, showBreadcrumbs = true }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block relative">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </aside>

      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={mobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={title} 
          onMenuClick={() => setMobileSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
          <div className="px-4 lg:px-6 py-3">
            {showBreadcrumbs && <Breadcrumbs className="mb-2" items={[]} />}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
