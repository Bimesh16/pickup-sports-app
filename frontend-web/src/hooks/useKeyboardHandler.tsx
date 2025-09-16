import { useEffect, useRef, useCallback } from 'react';

interface KeyboardHandlerConfig {
  enableScrollToInput: boolean;
  enableFormScrolling: boolean;
  keyboardOffset: number;
}

const defaultConfig: KeyboardHandlerConfig = {
  enableScrollToInput: true,
  enableFormScrolling: true,
  keyboardOffset: 20,
};

export const useKeyboardHandler = (config: Partial<KeyboardHandlerConfig> = {}) => {
  const handlerConfig = { ...defaultConfig, ...config };
  const activeInputRef = useRef<HTMLElement | null>(null);
  const originalScrollPositionRef = useRef<number>(0);
  const keyboardHeightRef = useRef<number>(0);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const scrollToInput = useCallback((input: HTMLElement) => {
    if (!handlerConfig.enableScrollToInput || !isMobile) return;

    const inputRect = input.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const keyboardHeight = keyboardHeightRef.current;
    const availableHeight = viewportHeight - keyboardHeight;
    
    // Check if input is visible above keyboard
    if (inputRect.bottom > availableHeight) {
      const scrollAmount = inputRect.bottom - availableHeight + handlerConfig.keyboardOffset;
      window.scrollBy({
        top: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, [handlerConfig.enableScrollToInput, handlerConfig.keyboardOffset, isMobile]);

  const handleInputFocus = useCallback((e: FocusEvent) => {
    if (!isMobile) return;

    const input = e.target as HTMLElement;
    if (input && (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA')) {
      activeInputRef.current = input;
      originalScrollPositionRef.current = window.scrollY;
      
      // Small delay to ensure keyboard is shown
      setTimeout(() => {
        scrollToInput(input);
      }, 300);
    }
  }, [scrollToInput, isMobile]);

  const handleInputBlur = useCallback(() => {
    if (!isMobile) return;

    activeInputRef.current = null;
    
    // Restore original scroll position after a delay
    setTimeout(() => {
      if (keyboardHeightRef.current === 0) {
        window.scrollTo({
          top: originalScrollPositionRef.current,
          behavior: 'smooth'
        });
      }
    }, 300);
  }, [isMobile]);

  const handleResize = useCallback(() => {
    if (!isMobile) return;

    const currentHeight = window.innerHeight;
    const initialHeight = window.screen.height;
    const keyboardHeight = initialHeight - currentHeight;
    
    keyboardHeightRef.current = keyboardHeight;

    // Adjust viewport height for mobile browsers
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      if (keyboardHeight > 0) {
        // Keyboard is open
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      } else {
        // Keyboard is closed
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    }

    // Scroll to active input if keyboard height changed
    if (activeInputRef.current && keyboardHeight > 0) {
      scrollToInput(activeInputRef.current);
    }
  }, [scrollToInput, isMobile]);

  const handleScroll = useCallback(() => {
    if (!isMobile || !handlerConfig.enableFormScrolling) return;

    // Prevent scrolling beyond the form when keyboard is open
    if (keyboardHeightRef.current > 0 && activeInputRef.current) {
      const form = activeInputRef.current.closest('form');
      if (form) {
        const formRect = form.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const keyboardHeight = keyboardHeightRef.current;
        const availableHeight = viewportHeight - keyboardHeight;
        
        if (formRect.bottom < availableHeight) {
          // Form is above keyboard, allow normal scrolling
          return;
        }
        
        // Prevent scrolling past the form
        const maxScroll = formRect.bottom - availableHeight;
        if (window.scrollY > maxScroll) {
          window.scrollTo({
            top: maxScroll,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [handlerConfig.enableFormScrolling, isMobile]);

  useEffect(() => {
    if (!isMobile) return;

    // Add event listeners
    document.addEventListener('focusin', handleInputFocus);
    document.addEventListener('focusout', handleInputBlur);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: false });

    // Initial height calculation
    handleResize();

    return () => {
      document.removeEventListener('focusin', handleInputFocus);
      document.removeEventListener('focusout', handleInputBlur);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleInputFocus, handleInputBlur, handleResize, handleScroll, isMobile]);

  // Utility function to scroll to a specific input
  const scrollToInputElement = useCallback((input: HTMLElement) => {
    scrollToInput(input);
  }, [scrollToInput]);

  // Utility function to get keyboard height
  const getKeyboardHeight = useCallback(() => {
    return keyboardHeightRef.current;
  }, []);

  // Utility function to check if keyboard is open
  const isKeyboardOpen = useCallback(() => {
    return keyboardHeightRef.current > 0;
  }, []);

  return {
    scrollToInputElement,
    getKeyboardHeight,
    isKeyboardOpen,
    isMobile
  };
};
