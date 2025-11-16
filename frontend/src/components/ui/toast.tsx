import React from 'react';
import { Check, X, AlertCircle, Info, X as CloseIcon } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { cn } from '../../lib/utils';

const Toast: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "flex items-start space-x-3 p-4 rounded-lg shadow-lg border transition-all duration-300 animate-in slide-in-from-right-2",
            {
              "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300":
                notification.type === "success",
              "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300":
                notification.type === "error",
              "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300":
                notification.type === "warning",
              "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300":
                notification.type === "info",
            }
          )}
        >
          <div className="flex-shrink-0">
            {notification.type === "success" && <Check className="h-5 w-5" />}
            {notification.type === "error" && <X className="h-5 w-5" />}
            {notification.type === "warning" && <AlertCircle className="h-5 w-5" />}
            {notification.type === "info" && <Info className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{notification.title}</p>
            {notification.message && (
              <p className="text-sm opacity-90 mt-1">{notification.message}</p>
            )}
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 ml-2 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export { Toast };