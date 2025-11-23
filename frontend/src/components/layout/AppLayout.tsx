import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from '../ui';

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
      {mobileSidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <aside className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar />
          </aside>
        </>
      )}

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
