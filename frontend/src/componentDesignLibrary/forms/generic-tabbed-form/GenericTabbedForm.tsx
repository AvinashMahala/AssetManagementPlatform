import React from 'react';
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/button/Button';
import type { GenericTabbedFormProps } from './types';

export const GenericTabbedForm: React.FC<GenericTabbedFormProps> = ({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  completedTabs,
  isEdit = false,
  loading = false,
  hasTabData,
  onNext,
  onPrevious,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel = "Cancel",
  nextLabel = "Next",
  previousLabel = "Previous",
  footerCenter,
  children
}) => {
  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === tabs.length - 1;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
          {tabs.map((tab, index) => {
            if (tab.hidden) return null;
            
            const Icon = tab.icon;
            const isCompleted = completedTabs.has(tab.id);
            const isActive = activeTab === tab.id;
            const hasData = hasTabData ? hasTabData(tab.id) : isCompleted;
            // In edit mode, all tabs are accessible. In create mode, only completed or current + 1
            const isAccessible = isEdit ? true : (index === 0 || completedTabs.has(tabs[index - 1].id));

            return (
              <React.Fragment key={tab.id}>
                <button
                  type="button"
                  onClick={() => isAccessible && onTabChange(tab.id)}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all relative min-w-[120px] ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                      : hasData
                      ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                      : isAccessible
                      ? 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!isAccessible}
                >
                  <div className={`p-2 rounded-full mb-2 relative ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : hasData
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}>
                    {hasData && !isActive ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                    {isEdit && hasData && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-blue-700 dark:text-blue-300' :
                    hasData ? 'text-green-700 dark:text-green-300' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {tab.title}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                    {tab.description}
                  </span>
                </button>
                {index < tabs.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 mt-8 min-w-[20px] ${
                    hasData ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-20">
        {children}
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 shadow-lg z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {!isFirstTab && (
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{previousLabel}</span>
              </Button>
            )}

            <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div>Step {currentTabIndex + 1} of {tabs.length}: {tabs[currentTabIndex].title}</div>
              {footerCenter && (
                <div className="ml-2">
                  {footerCenter}
                </div>
              )}
            </div>

            {/* Mobile: render footer center content inline near action buttons so it's visible on small screens */}
            {footerCenter && (
              <div className="sm:hidden ml-2">
                {footerCenter}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </Button>

            {/* Navigation buttons for edit mode */}
            {isEdit && !isFirstTab && (
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                className="flex items-center space-x-2 sm:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Prev</span>
              </Button>
            )}

            {isEdit && !isLastTab && (
              <Button
                type="button"
                onClick={onNext}
                className="flex items-center space-x-2"
              >
                <span>{nextLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}

            {/* Next button for create mode */}
            {!isLastTab && !isEdit ? (
              <Button
                type="button"
                onClick={onNext}
                className="flex items-center space-x-2"
              >
                <span>{nextLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={onSubmit}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{isEdit ? "Updating..." : "Creating..."}</span>
                  </>
                ) : (
                  <span>{submitLabel || (isEdit ? "Save Changes" : "Create")}</span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
