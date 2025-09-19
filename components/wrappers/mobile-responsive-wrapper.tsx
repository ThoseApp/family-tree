"use client";

import React from "react";
import { useShouldShowMobileRedirect } from "@/hooks/use-mobile-detection";
import MobileRedirectScreen from "@/components/mobile-redirect-screen";

interface MobileResponsiveWrapperProps {
  children: React.ReactNode;
  mobileTitle?: string;
  mobileSubtitle?: string;
  showRotateHint?: boolean;
  /**
   * If true, will always show the mobile redirect regardless of screen size
   * Useful for testing or specific pages that should never be mobile
   */
  forceRedirect?: boolean;
  /**
   * If true, will never show the mobile redirect regardless of screen size
   * Useful for pages that should be mobile-friendly (like auth pages)
   */
  allowMobile?: boolean;
}

/**
 * Wrapper component that conditionally shows mobile redirect screen
 * or renders children based on screen size detection
 */
const MobileResponsiveWrapper: React.FC<MobileResponsiveWrapperProps> = ({
  children,
  mobileTitle,
  mobileSubtitle,
  showRotateHint = true,
  forceRedirect = false,
  allowMobile = false,
}) => {
  const shouldShowMobileRedirect = useShouldShowMobileRedirect();

  // Determine if we should show the redirect
  const showRedirect =
    !allowMobile && (forceRedirect || shouldShowMobileRedirect);

  if (showRedirect) {
    return (
      <MobileRedirectScreen
        title={mobileTitle}
        subtitle={mobileSubtitle}
        showRotateHint={showRotateHint}
      />
    );
  }

  return <>{children}</>;
};

export default MobileResponsiveWrapper;
