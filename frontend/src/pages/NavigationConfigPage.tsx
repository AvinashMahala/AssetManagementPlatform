import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { AppLayout } from '../components/layout';
import { NavigationItem } from '../components/navigation';
import { NavigationPreview } from '../components/navigation';
import { InstructionsCard } from '../components/navigation';
import { useNavigationConfig, useDragAndDrop, type NavItem } from '../hooks';

const NavigationConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { config, loading, updateOrder, toggleItem, resetToDefaults, getEnabledItems } = useNavigationConfig();
  const { draggedItem, dragOverIndex, handleDragStart, handleDragOver, handleDragEnd, handleDrop } = useDragAndDrop(config.items, updateOrder);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading navigation settings...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleToggleItem = (itemId: string) => {
    toggleItem(itemId);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset navigation to defaults? This will restore the original order and enable all items.')) {
      resetToDefaults();
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Navigation Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Customize the order and visibility of navigation items
            </p>
          </div>
        </div>

        {/* Instructions */}
        <InstructionsCard />

        {/* Navigation Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Navigation Items</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset to Defaults
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {config.items.map((item: NavItem, index: number) => (
              <NavigationItem
                key={item.id}
                item={item}
                index={index}
                isDraggedOver={dragOverIndex === index}
                isDragged={draggedItem?.id === item.id}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                onToggle={handleToggleItem}
              />
            ))}
          </CardContent>
        </Card>

        {/* Preview */}
        <NavigationPreview enabledItems={getEnabledItems()} />
      </div>
    </AppLayout>
  );
};

export default NavigationConfigPage;