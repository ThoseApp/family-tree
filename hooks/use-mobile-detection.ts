"use client";

import { useState, useEffect } from "react";

interface MobileDetectionResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  isLandscape: boolean;
  shouldShowMobileRedirect: boolean;
}

/**
 * Custom hook for detecting mobile devices and screen sizes
 * Follows the application's responsive breakpoints:
 * - Mobile: < 768px (md breakpoint)
 * - Tablet: 768px - 1024px
 * - Desktop: >= 1024px (lg breakpoint)
 */
export const useMobileDetection = (): MobileDetectionResult => {
  const [screenSize, setScreenSize] = useState({
    width: 0,
    height: 0,
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const updateScreenSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    updateScreenSize();

    // Add event listener
    window.addEventListener("resize", updateScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  // Don't render mobile redirect during SSR
  if (!isClient) {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenWidth: 0,
      screenHeight: 0,
      isLandscape: false,
      shouldShowMobileRedirect: false,
    };
  }

  const { width, height } = screenSize;

  // Define breakpoints (matching Tailwind defaults)
  const isMobile = width < 768; // Below md breakpoint
  const isTablet = width >= 768 && width < 1024; // md to lg breakpoint
  const isDesktop = width >= 1024; // lg breakpoint and above
  const isLandscape = width > height;

  // Show mobile redirect for:
  // 1. Mobile devices (< 768px)
  // 2. Small tablets in portrait mode (768-1024px in portrait)
  const shouldShowMobileRedirect =
    isMobile || (isTablet && !isLandscape && height > 800); // Tablet in portrait with sufficient height

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth: width,
    screenHeight: height,
    isLandscape,
    shouldShowMobileRedirect,
  };
};

/**
 * Hook specifically for checking if mobile redirect should be shown
 * Simplified version for components that only need this information
 */
export const useShouldShowMobileRedirect = (): boolean => {
  const { shouldShowMobileRedirect } = useMobileDetection();
  return shouldShowMobileRedirect;
};
