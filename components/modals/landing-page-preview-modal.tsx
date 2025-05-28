import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LandingPageSection } from "@/lib/types";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

interface LandingPagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: LandingPageSection[];
}

const LandingPagePreviewModal = ({
  isOpen,
  onClose,
  sections,
}: LandingPagePreviewModalProps) => {
  const isValidImageUrl = (url?: string) => {
    if (!url) return false;
    return url.startsWith("http") || url.startsWith("/");
  };

  const getSectionByType = (type: string) => {
    return sections.find((s) => s.section_type === type);
  };

  const openFullPreview = () => {
    window.open("/", "_blank");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Landing Page Preview</DialogTitle>
        </DialogHeader>

        <div className="h-[60vh] overflow-y-auto pr-4">
          <div className="space-y-6">
            {/* Hero Section Preview */}
            {getSectionByType("hero") && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-sm text-muted-foreground mb-3">
                  Hero Section
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative h-32 rounded overflow-hidden bg-muted">
                    {isValidImageUrl(getSectionByType("hero")?.image_url) ? (
                      <Image
                        src={getSectionByType("hero")!.image_url!}
                        alt="Hero preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg">
                      {getSectionByType("hero")?.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {getSectionByType("hero")?.subtitle}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {getSectionByType("hero")?.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Gallery Preview Section */}
            {getSectionByType("gallery_preview") && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-sm text-muted-foreground mb-3">
                  Gallery Preview Section
                </h3>
                <div className="text-center space-y-2">
                  <h4 className="font-semibold">
                    {getSectionByType("gallery_preview")?.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {getSectionByType("gallery_preview")?.subtitle}
                  </p>
                  <div className="flex space-x-2 justify-center">
                    <div className="bg-muted h-12 w-12 rounded"></div>
                    <div className="bg-muted h-12 w-12 rounded"></div>
                    <div className="bg-muted h-12 w-12 rounded"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Events Preview */}
            {getSectionByType("upcoming_events") && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-sm text-muted-foreground mb-3">
                  Upcoming Events Section
                </h3>
                <div className="relative h-24 rounded overflow-hidden bg-muted mb-2">
                  {isValidImageUrl(
                    getSectionByType("upcoming_events")?.image_url
                  ) ? (
                    <Image
                      src={getSectionByType("upcoming_events")!.image_url!}
                      alt="Events preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                      No background image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <h4 className="font-semibold text-white text-center">
                      {getSectionByType("upcoming_events")?.title}
                    </h4>
                  </div>
                </div>
              </div>
            )}

            {/* History Section Preview */}
            {getSectionByType("history") && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-sm text-muted-foreground mb-3">
                  History Section
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative h-32 rounded overflow-hidden bg-muted">
                    {isValidImageUrl(getSectionByType("history")?.image_url) ? (
                      <Image
                        src={getSectionByType("history")!.image_url!}
                        alt="History preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg">
                      {getSectionByType("history")?.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {getSectionByType("history")?.subtitle}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {getSectionByType("history")?.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Family Members Preview */}
            {getSectionByType("family_members") && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-sm text-muted-foreground mb-3">
                  Family Members Section
                </h3>
                <div className="text-center space-y-2">
                  <h4 className="font-semibold">
                    {getSectionByType("family_members")?.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {getSectionByType("family_members")?.description}
                  </p>
                  <div className="flex space-x-2 justify-center">
                    <div className="bg-muted h-12 w-12 rounded-full"></div>
                    <div className="bg-muted h-12 w-12 rounded-full"></div>
                    <div className="bg-muted h-12 w-12 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Family Tree Preview */}
            {getSectionByType("family_tree") && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-sm text-muted-foreground mb-3">
                  Family Tree Section
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative h-32 rounded overflow-hidden bg-muted">
                    {isValidImageUrl(
                      getSectionByType("family_tree")?.image_url
                    ) ? (
                      <Image
                        src={getSectionByType("family_tree")!.image_url!}
                        alt="Family tree preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg">
                      {getSectionByType("family_tree")?.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {getSectionByType("family_tree")?.subtitle}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {getSectionByType("family_tree")?.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={openFullPreview}
            className="bg-foreground text-background hover:bg-foreground/80"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Full Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LandingPagePreviewModal;
