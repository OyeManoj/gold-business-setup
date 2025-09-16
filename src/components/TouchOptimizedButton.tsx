import { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TouchOptimizedButtonProps extends ButtonProps {
  touchTarget?: 'small' | 'medium' | 'large';
  hapticFeedback?: boolean;
}

export const TouchOptimizedButton = forwardRef<HTMLButtonElement, TouchOptimizedButtonProps>(
  ({ className, touchTarget = 'medium', hapticFeedback = false, onClick, ...props }, ref) => {
    const sizeClasses = {
      small: 'min-h-[44px] min-w-[44px] px-4 py-2',
      medium: 'min-h-[48px] min-w-[48px] px-6 py-3',
      large: 'min-h-[56px] min-w-[56px] px-8 py-4'
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Add haptic feedback for supported devices
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      onClick?.(e);
    };

    return (
      <Button
        ref={ref}
        className={cn(
          sizeClasses[touchTarget],
          'touch-manipulation select-none',
          'active:scale-[0.98] transition-transform duration-100',
          'focus:ring-2 focus:ring-offset-2 focus:ring-primary',
          className
        )}
        onClick={handleClick}
        {...props}
      />
    );
  }
);

TouchOptimizedButton.displayName = 'TouchOptimizedButton';