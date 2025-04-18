import React from "react";

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  return <section className="h-screen">{children}</section>;
};

export default AuthWrapper;
