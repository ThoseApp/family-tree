"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingIcon } from "@/components/loading-icon";
import ImageUploadModal from "@/components/modals/image-upload-modal";
import LandingPagePreviewModal from "@/components/modals/landing-page-preview-modal";
import { useLandingPageStore } from "@/stores/landing-page-store";
import { LandingPageSection } from "@/lib/types";
import { toast } from "sonner";
import { Eye, Save, Globe, Upload, Edit3 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const ManageLandingPagePage = () => {
  const {
    sections,
    loading,
    hasChanges,
    fetchSections,
    updateSection,
    saveDraft,
    publishChanges,
    setHasChanges,
  } = useLandingPageStore();

  // Local state for form data
  const [localSections, setLocalSections] = useState<
    Record<string, Partial<LandingPageSection>>
  >({});
  const [activeImageUpload, setActiveImageUpload] = useState<{
    sectionType: string;
    title: string;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch sections on component mount
  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Initialize local state when sections are loaded
  useEffect(() => {
    if (sections.length > 0) {
      const sectionsMap: Record<string, Partial<LandingPageSection>> = {};
      sections.forEach((section) => {
        sectionsMap[section.section_type] = section;
      });
      setLocalSections(sectionsMap);
    }
  }, [sections]);

  // Get section data with fallback
  const getSection = (sectionType: string): Partial<LandingPageSection> => {
    return localSections[sectionType] || {};
  };

  // Update local section data
  const updateLocalSection = (
    sectionType: string,
    updates: Partial<LandingPageSection>
  ) => {
    setLocalSections((prev) => ({
      ...prev,
      [sectionType]: {
        ...prev[sectionType],
        ...updates,
      },
    }));
    setHasChanges(true);
  };

  // Save changes to database
  const handleSaveSection = async (sectionType: string) => {
    const sectionData = localSections[sectionType];
    if (!sectionData) return;

    try {
      await updateSection(sectionType, sectionData);
    } catch (error) {
      console.error("Error saving section:", error);
    }
  };

  // Handle image upload
  const handleImageUploaded = (sectionType: string, imageUrl: string) => {
    updateLocalSection(sectionType, { image_url: imageUrl });
    setActiveImageUpload(null);
  };

  // Handle preview - show preview modal
  const handlePreview = () => {
    // Convert local sections to array format for preview
    const previewSections: LandingPageSection[] = Object.values(
      localSections
    ).filter(Boolean) as LandingPageSection[];
    if (previewSections.length > 0) {
      setShowPreview(true);
    } else {
      window.open("/", "_blank");
    }
  };

  // Handle save draft
  const handleSaveDraft = async () => {
    try {
      // Save all local changes first
      for (const sectionType in localSections) {
        await updateSection(sectionType, localSections[sectionType]);
      }
      await saveDraft();
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  // Handle publish
  const handlePublish = async () => {
    try {
      // Save all local changes first
      for (const sectionType in localSections) {
        await updateSection(sectionType, localSections[sectionType]);
      }
      await publishChanges();
    } catch (error) {
      console.error("Error publishing changes:", error);
    }
  };

  const isValidImageUrl = (url?: string) => {
    if (!url) return false;
    return url.startsWith("http") || url.startsWith("/");
  };

  if (loading && sections.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingIcon className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Manage Landing Page</h1>
          <p className="text-muted-foreground">
            Customize your family website&apos;s content and appearance
          </p>
        </div>

        {hasChanges && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
            <p className="text-sm text-orange-800">You have unsaved changes</p>
          </div>
        )}
      </div>

      {/* Hero Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Hero Section</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSaveSection("hero")}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="relative w-full h-64 rounded mb-4 overflow-hidden border">
                {isValidImageUrl(getSection("hero").image_url) ? (
                  <Image
                    src={getSection("hero").image_url!}
                    alt="Hero section"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 h-full w-full flex items-center justify-center text-gray-500">
                    [Hero Image Placeholder]
                  </div>
                )}
              </div>
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-full"
                onClick={() =>
                  setActiveImageUpload({
                    sectionType: "hero",
                    title: "Upload Hero Image",
                  })
                }
                disabled={loading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Edit Image
              </Button>
            </div>
            <div className="space-y-4 bg-border/30 p-6 rounded-xl">
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input
                  type="text"
                  placeholder="Enter hero heading"
                  className="bg-background"
                  value={getSection("hero").title || ""}
                  onChange={(e) =>
                    updateLocalSection("hero", { title: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  type="text"
                  placeholder="Enter hero subtitle"
                  className="bg-background"
                  value={getSection("hero").subtitle || ""}
                  onChange={(e) =>
                    updateLocalSection("hero", { subtitle: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Enter hero description"
                  className="bg-background"
                  value={getSection("hero").description || ""}
                  onChange={(e) =>
                    updateLocalSection("hero", { description: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Gallery Preview Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Gallery Preview</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSaveSection("gallery_preview")}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input
                  type="text"
                  placeholder="Enter gallery heading"
                  value={getSection("gallery_preview").title || ""}
                  onChange={(e) =>
                    updateLocalSection("gallery_preview", {
                      title: e.target.value,
                    })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  type="text"
                  placeholder="Enter gallery subtitle"
                  value={getSection("gallery_preview").subtitle || ""}
                  onChange={(e) =>
                    updateLocalSection("gallery_preview", {
                      subtitle: e.target.value,
                    })
                  }
                  disabled={loading}
                />
              </div>
              <div className="flex space-x-2">
                <div className="bg-gray-200 h-20 w-1/3 rounded flex items-center justify-center text-gray-500 text-xs">
                  [Image]
                </div>
                <div className="bg-gray-200 h-20 w-1/3 rounded flex items-center justify-center text-gray-500 text-xs">
                  [Image]
                </div>
                <div className="bg-gray-200 h-20 w-1/3 rounded flex items-center justify-center text-gray-500 text-xs">
                  [Image]
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Gallery images are managed from the Gallery section
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Events</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSaveSection("upcoming_events")}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input
                  type="text"
                  placeholder="Enter events heading"
                  value={getSection("upcoming_events").title || ""}
                  onChange={(e) =>
                    updateLocalSection("upcoming_events", {
                      title: e.target.value,
                    })
                  }
                  disabled={loading}
                />
              </div>
              <div className="relative w-full h-40 rounded overflow-hidden border">
                {isValidImageUrl(getSection("upcoming_events").image_url) ? (
                  <Image
                    src={getSection("upcoming_events").image_url!}
                    alt="Upcoming events"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 h-full w-full flex items-center justify-center text-gray-500">
                    [Events Image Placeholder]
                  </div>
                )}
              </div>
              <Button
                className="w-full rounded-full bg-foreground text-background hover:bg-foreground/80"
                size="lg"
                onClick={() =>
                  setActiveImageUpload({
                    sectionType: "upcoming_events",
                    title: "Upload Events Background Image",
                  })
                }
                disabled={loading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Edit Background
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>History Section</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSaveSection("history")}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="relative w-full h-64 rounded mb-4 overflow-hidden border">
                {isValidImageUrl(getSection("history").image_url) ? (
                  <Image
                    src={getSection("history").image_url!}
                    alt="History section"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 h-full w-full flex items-center justify-center text-gray-500">
                    [History Image Placeholder]
                  </div>
                )}
              </div>
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-full"
                onClick={() =>
                  setActiveImageUpload({
                    sectionType: "history",
                    title: "Upload History Image",
                  })
                }
                disabled={loading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Edit Image
              </Button>
            </div>
            <div className="space-y-4 bg-border/30 p-6 rounded-xl">
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input
                  type="text"
                  placeholder="Enter history heading"
                  className="bg-background"
                  value={getSection("history").title || ""}
                  onChange={(e) =>
                    updateLocalSection("history", { title: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  type="text"
                  placeholder="Enter history subtitle"
                  className="bg-background"
                  value={getSection("history").subtitle || ""}
                  onChange={(e) =>
                    updateLocalSection("history", { subtitle: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Enter history description"
                  className="bg-background"
                  value={getSection("history").description || ""}
                  onChange={(e) =>
                    updateLocalSection("history", {
                      description: e.target.value,
                    })
                  }
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family Members Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Family Members</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSaveSection("family_members")}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Heading</Label>
              <Input
                type="text"
                placeholder="Enter family members heading"
                value={getSection("family_members").title || ""}
                onChange={(e) =>
                  updateLocalSection("family_members", {
                    title: e.target.value,
                  })
                }
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                type="text"
                placeholder="Enter family members description"
                value={getSection("family_members").description || ""}
                onChange={(e) =>
                  updateLocalSection("family_members", {
                    description: e.target.value,
                  })
                }
                disabled={loading}
              />
            </div>
            <div className="flex space-x-2">
              <div className="bg-gray-200 h-20 w-1/3 rounded flex items-center justify-center text-gray-500 text-xs">
                [Image]
              </div>
              <div className="bg-gray-200 h-20 w-1/3 rounded flex items-center justify-center text-gray-500 text-xs">
                [Image]
              </div>
              <div className="bg-gray-200 h-20 w-1/3 rounded flex items-center justify-center text-gray-500 text-xs">
                [Image]
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Family member profiles are managed from the Family Members section
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Family Tree Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Family Tree Section</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSaveSection("family_tree")}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="relative w-full h-64 rounded mb-4 overflow-hidden border">
                {isValidImageUrl(getSection("family_tree").image_url) ? (
                  <Image
                    src={getSection("family_tree").image_url!}
                    alt="Family tree section"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 h-full w-full flex items-center justify-center text-gray-500">
                    [Family Tree Image Placeholder]
                  </div>
                )}
              </div>
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-full"
                onClick={() =>
                  setActiveImageUpload({
                    sectionType: "family_tree",
                    title: "Upload Family Tree Image",
                  })
                }
                disabled={loading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Edit Image
              </Button>
            </div>
            <div className="space-y-4 bg-border/30 p-6 rounded-xl">
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input
                  type="text"
                  placeholder="Enter family tree heading"
                  className="bg-background"
                  value={getSection("family_tree").title || ""}
                  onChange={(e) =>
                    updateLocalSection("family_tree", { title: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  type="text"
                  placeholder="Enter family tree subtitle"
                  className="bg-background"
                  value={getSection("family_tree").subtitle || ""}
                  onChange={(e) =>
                    updateLocalSection("family_tree", {
                      subtitle: e.target.value,
                    })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Enter family tree description"
                  className="bg-background"
                  value={getSection("family_tree").description || ""}
                  onChange={(e) =>
                    updateLocalSection("family_tree", {
                      description: e.target.value,
                    })
                  }
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex justify-between items-center mt-12 p-6 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Edit3 className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="space-x-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={handlePreview}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={handleSaveDraft}
              disabled={loading}
            >
              {loading ? (
                <LoadingIcon className="h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Draft
            </Button>
          </div>
          <Button
            className="rounded-full bg-foreground text-background hover:bg-foreground/80"
            onClick={handlePublish}
            disabled={loading}
          >
            {loading ? (
              <LoadingIcon className="h-4 w-4 mr-2" />
            ) : (
              <Globe className="h-4 w-4 mr-2" />
            )}
            Publish
          </Button>
        </div>
      </div>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={!!activeImageUpload}
        onClose={() => setActiveImageUpload(null)}
        title={activeImageUpload?.title || "Upload Image"}
        currentImageUrl={
          activeImageUpload
            ? getSection(activeImageUpload.sectionType).image_url
            : undefined
        }
        onImageUploaded={(imageUrl) =>
          activeImageUpload &&
          handleImageUploaded(activeImageUpload.sectionType, imageUrl)
        }
      />

      {/* Landing Page Preview Modal */}
      <LandingPagePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        sections={
          Object.values(localSections).filter(Boolean) as LandingPageSection[]
        }
      />
    </div>
  );
};

export default ManageLandingPagePage;
