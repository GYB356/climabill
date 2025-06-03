import { useRef, useEffect } from 'react';

/**
 * Hook to trap focus within a container for modals, dialogs, etc.
 * Ensures keyboard navigation stays within the element for accessibility
 * 
 * @param active Whether the focus trap is active
 * @param initialFocusRef Optional ref to element that should receive initial focus
 * @returns Ref to attach to the container element
 */
export function useFocusTrap(
  active: boolean = true,
  initialFocusRef?: React.RefObject<HTMLElement>
) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!active || !containerRef.current) return;
    
    // Store previous active element to restore focus when trap is disabled
    const previousActiveElement = document.activeElement as HTMLElement;
    
    // Get all focusable elements within the container
    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    
    // Set initial focus
    if (initialFocusRef && initialFocusRef.current) {
      initialFocusRef.current.focus();
    } else if (firstFocusableElement) {
      firstFocusableElement.focus();
    }
    
    // Handle tabbing navigation to keep focus within the container
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Tab key
      if (e.key === 'Tab') {
        // Shift + Tab navigating to before first element, loop to last element
        if (e.shiftKey && document.activeElement === firstFocusableElement) {
          e.preventDefault();
          lastFocusableElement.focus();
        } 
        // Tab navigating after last element, loop to first element
        else if (!e.shiftKey && document.activeElement === lastFocusableElement) {
          e.preventDefault();
          firstFocusableElement.focus();
        }
      }
      
      // Handle Escape key to potentially close dialogs/modals
      if (e.key === 'Escape') {
        // Component using this hook should handle escape through its own handlers
        // This is just a convenience event bubbling
        const closeEvent = new CustomEvent('focusTrapClose');
        containerRef.current?.dispatchEvent(closeEvent);
      }
    };
    
    // Add event listener for tab navigation
    document.addEventListener('keydown', handleKeyDown);
    
    // Clean up when component unmounts or trap becomes inactive
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Return focus to element that was focused before trap was activated
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [active, initialFocusRef]);
  
  return containerRef;
}
