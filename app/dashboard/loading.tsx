import React from "react";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full size-32 border-t-2 border-b-2 border-foreground"></div>
    </div>
  );
};

export default LoadingScreen;
