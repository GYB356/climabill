/**
 * Keyboard navigation utilities for enhancing accessibility
 * 
 * These utilities help manage focus trapping, sequential keyboard navigation,
 * and other keyboard accessibility features within the application.
 */

import { useCallback, useEffect, useRef } from 'react';

export interface KeyboardNavigationOptions {
  /** CSS selector for focusable elements */
  focusableSelector?: string;
  /** Whether to trap focus within the container */
  trapFocus?: boolean;
  /** Whether navigation should cycle back to first/last element */
  cycleNavigation?: boolean;
  /** Callback when Escape key is pressed */
  onEscape?: () => void;
  /** Callback when Tab key is pressed */
  onTab?: (event: KeyboardEvent) => void;
  /** Callback when Enter key is pressed on an element */
  onEnter?: (event: KeyboardEvent) => void;
  /** Whether to automatically focus the first element when mounted */
  autoFocus?: boolean;
}

/**
 * Default selector for focusable elements, covering standard interactive elements
 */
const DEFAULT_FOCUSABLE_SELECTOR = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Hook for managing keyboard navigation within a container
 * 
 * @param containerRef Reference to the container element
 * @param options Keyboard navigation options
 */
export function useKeyboardNavigation(
  containerRef: React.RefObject<HTMLElement>,
  options: KeyboardNavigationOptions = {}
) {
  const {
    focusableSelector = DEFAULT_FOCUSABLE_SELECTOR,
    trapFocus = false,
    cycleNavigation = true,
    onEscape,
    onTab,
    onEnter,
    autoFocus = false,
  } = options;

  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  /**
   * Get all focusable elements within the container
   */
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelector)
    ).filter(element => {
      // Filter out hidden elements and those with tabindex=-1
      return (
        element.offsetParent !== null &&
        !element.hasAttribute('disabled') &&
        element.getAttribute('tabindex') !== '-1'
      );
    });
  }, [containerRef, focusableSelector]);

  /**
   * Handle keyboard events within the container
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!containerRef.current) return;

    // Call the onTab callback if provided
    if (event.key === 'Tab' && onTab) {
      onTab(event);
    }

    // Call the onEnter callback if provided
    if (event.key === 'Enter' && onEnter) {
      onEnter(event);
    }

    // Handle Escape key
    if (event.key === 'Escape' && onEscape) {
      onEscape();
      return;
    }

    // Handle Tab key for focus trapping
    if (trapFocus && event.key === 'Tab') {
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const { activeElement } = document;

      // Shift+Tab from first element should focus the last element
      if (event.shiftKey && activeElement === firstElement) {
        if (cycleNavigation) {
          lastElement.focus();
          event.preventDefault();
        }
      } 
      // Tab from last element should focus the first element
      else if (!event.shiftKey && activeElement === lastElement) {
        if (cycleNavigation) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    }
  }, [containerRef, getFocusableElements, onEscape, onTab, onEnter, trapFocus, cycleNavigation]);

  /**
   * Initialize keyboard navigation when the component mounts
   */
  useEffect(() => {
    // Save the currently focused element to restore focus later
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Auto-focus the first focusable element if required
    if (autoFocus && containerRef.current) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    // Add event listener for keyboard navigation
    const currentContainer = containerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener('keydown', handleKeyDown);
    }

    // Clean up event listeners when unmounting
    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener('keydown', handleKeyDown);
      }
      
      // Restore focus to the previously focused element
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [containerRef, getFocusableElements, handleKeyDown, autoFocus]);

  /**
   * Focus the first element in the container
   */
  const focusFirstElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [getFocusableElements]);

  /**
   * Focus the last element in the container
   */
  const focusLastElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }, [getFocusableElements]);

  return {
    focusFirstElement,
    focusLastElement,
    getFocusableElements
  };
}

/**
 * Hook for managing focus trapping within modal dialogs
 * 
 * @param containerRef Reference to the modal container element
 * @param isOpen Whether the modal is open
 * @param onClose Callback when the modal should close
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  isOpen: boolean,
  onClose?: () => void
) {
  return useKeyboardNavigation(containerRef, {
    trapFocus: true,
    cycleNavigation: true,
    autoFocus: isOpen,
    onEscape: onClose
  });
}

/**
 * Hook for returning focus to a trigger element after closing a modal or dropdown
 * 
 * @param triggerRef Reference to the element that triggered the modal/dropdown
 * @param isOpen Whether the modal/dropdown is open
 */
export function useReturnFocus(
  triggerRef: React.RefObject<HTMLElement>,
  isOpen: boolean
) {
  useEffect(() => {
    // Save the currently focused element
    const activeElement = document.activeElement as HTMLElement;
    
    // When closed, return focus to the trigger element
    return () => {
      if (!isOpen && triggerRef.current) {
        triggerRef.current.focus();
      } else if (!isOpen && activeElement) {
        activeElement.focus();
      }
    };
  }, [triggerRef, isOpen]);
}
