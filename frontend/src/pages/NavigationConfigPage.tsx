import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GripVertical, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { Button } from '../components/ui';
import { AppLayout } from '../components/layout';
import { useNavigationConfig, type NavItem } from '../hooks';

const NavigationConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { config, loading, updateOrder, toggleItem, resetToDefaults, getEnabledItems } = useNavigationConfig();
  const [draggedItem, setDraggedItem] = useState<NavItem | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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

  const handleDragStart = (e: React.DragEvent, item: NavItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (!draggedItem) return;

    const currentIndex = config.items.findIndex((item: NavItem) => item.id === draggedItem.id);
    if (currentIndex === -1 || currentIndex === dropIndex) return;

    const newItems = [...config.items];
    const [removed] = newItems.splice(currentIndex, 1);
    newItems.splice(dropIndex, 0, removed);

    updateOrder(newItems);
  };

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
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p><strong>How to use:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Drag and drop items to reorder them</li>
                <li>Use the toggle switches to show/hide navigation items</li>
                <li>Changes are saved automatically to your browser</li>
                <li>Click "Reset to Defaults" to restore original settings</li>
              </ul>
            </div>
          </CardContent>
        </Card>

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
            {config.items.map((item: NavItem, index: number) => {
              const Icon = item.icon;
              const isDraggedOver = dragOverIndex === index;

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`
                    flex items-center gap-4 p-4 border rounded-lg cursor-move transition-all
                    ${isDraggedOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}
                    ${draggedItem?.id === item.id ? 'opacity-50' : ''}
                    hover:bg-gray-50 dark:hover:bg-gray-800
                  `}
                >
                  {/* Drag Handle */}
                  <div className="flex-shrink-0">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                  </div>

                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {item.path}
                      </span>
                    </div>
                  </div>

                  {/* Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleItem(item.id)}
                    className="flex items-center gap-2"
                  >
                    {item.enabled ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm">{item.enabled ? 'Visible' : 'Hidden'}</span>
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This is how your navigation will look:
            </div>
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="space-y-2">
                {getEnabledItems().map((item: NavItem) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded hover:bg-white dark:hover:bg-gray-700">
                      <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default NavigationConfigPage;