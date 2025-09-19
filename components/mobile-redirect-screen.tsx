"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { Monitor, Smartphone, ArrowRight, RotateCcw } from "lucide-react";

interface MobileRedirectScreenProps {
  title?: string;
  subtitle?: string;
  showRotateHint?: boolean;
}

const MobileRedirectScreen: React.FC<MobileRedirectScreenProps> = ({
  title = "Desktop Experience Required",
  subtitle = "Kith & Kin Family Tree",
  showRotateHint = true,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-col items-center space-y-3">
            <Logo hideText />
            <h1 className="text-xl font-bold text-foreground">{subtitle}</h1>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-2 border-border/50 backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Monitor className="h-16 w-16 text-primary" />
                <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1">
                  <ArrowRight className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground mb-2">
              {title}
            </CardTitle>
            <p className="text-muted-foreground text-base leading-relaxed">
              Our family tree application is optimized for desktop viewing to
              provide the best experience with complex family relationships and
              interactive features.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Device Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <Smartphone className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-sm font-medium text-destructive">Mobile</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Limited View
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                <Monitor className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-primary">Desktop</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Full Experience
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center">
                  <Monitor className="h-4 w-4 mr-2 text-primary" />
                  For the best experience:
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Open this application on a desktop or laptop computer
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Use a screen size of at least 1024px wide
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Enjoy the full interactive family tree experience
                  </li>
                </ul>
              </div>

              {/* Rotate Hint for Tablets */}
              {showRotateHint && (
                <div className="bg-accent/50 rounded-lg p-4 border border-accent">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <RotateCcw className="h-4 w-4 text-accent-foreground" />
                    <span className="text-sm font-medium text-accent-foreground">
                      Using a tablet?
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Try rotating to landscape mode for a better experience
                  </p>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Button
                onClick={() => window.location.reload()}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
            </div>

            {/* Footer Text */}
            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                Thank you for understanding. We&apos;re working to improve mobile
                support.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Need help? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileRedirectScreen;
