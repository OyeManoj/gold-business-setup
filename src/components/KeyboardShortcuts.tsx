import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcutsProps {
  onQuickTransaction?: (type: string) => void;
  onToggleHistory?: () => void;
}

export function KeyboardShortcuts({ onQuickTransaction, onToggleHistory }: KeyboardShortcutsProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd key combinations
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'e':
            e.preventDefault();
            if (onQuickTransaction) {
              onQuickTransaction('exchange');
            } else {
              navigate('/transaction/exchange');
            }
            break;
          case 'p':
            e.preventDefault();
            if (onQuickTransaction) {
              onQuickTransaction('purchase');
            } else {
              navigate('/transaction/purchase');
            }
            break;
          case 's':
            e.preventDefault();
            if (onQuickTransaction) {
              onQuickTransaction('sale');
            } else {
              navigate('/transaction/sale');
            }
            break;
          case 'h':
            e.preventDefault();
            if (onToggleHistory) {
              onToggleHistory();
            } else {
              navigate('/history');
            }
            break;
          case 'b':
            e.preventDefault();
            navigate('/business-profile');
            break;
        }
      }

      // Single key shortcuts (when not in input)
      switch (e.key.toLowerCase()) {
        case 'escape':
          navigate('/');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [navigate, onQuickTransaction, onToggleHistory]);

  return null;
}