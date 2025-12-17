import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  onSelectAll: () => void;
  onClearSelection: () => void;
  files: any[]; // Adjust type as needed
}

export const useKeyboardShortcuts = ({
  onSelectAll,
  onClearSelection,
  files
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'a') {
          event.preventDefault();
          onSelectAll();
        }
      }
      if (event.key === 'Escape') {
        onClearSelection();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [files, onSelectAll, onClearSelection]);
};