"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import GalleryRequestsTable from "@/components/tables/gallery-requests";
import { useGalleryStore } from "@/stores/gallery-store";
import { useUserStore } from "@/stores/user-store";
import { LoadingIcon } from "@/components/loading-icon";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { GalleryType } from "@/lib/types";
import { GalleryStatusEnum, NotificationTypeEnum } from "@/lib/constants/enums";
import { ImagePreviewModal } from "@/components/modals/image-preview-modal";

const GalleryRequestsPage = () => {
  const { user } = useUserStore();
  const { isLoading } = useGalleryStore();
  const [pendingGalleries, setPendingGalleries] = useState<GalleryType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryType | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Fetch pending galleries
  const fetchPendingGalleries = async () => {
    try {
      const { data, error } = await supabase
        .from("galleries")
        .select("*")
        .eq("status", GalleryStatusEnum.pending)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingGalleries(data || []);
    } catch (err: any) {
      console.error("Error fetching pending galleries:", err);
      toast.error("Failed to fetch gallery requests");
    }
  };

  useEffect(() => {
    fetchPendingGalleries();

    // Set up real-time subscription for pending galleries
    const channel = supabase
      .channel("gallery-requests-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "galleries",
          filter: `status=eq.${GalleryStatusEnum.pending}`,
        },
        (payload) => {
          console.log("New gallery request received:", payload);
          const newGallery = payload.new as GalleryType;
          setPendingGalleries((prev) => [newGallery, ...prev]);
          toast.info(
            `New gallery request from ${newGallery.file_name || "Unknown"}`
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "galleries",
        },
        (payload) => {
          console.log("Gallery updated:", payload);
          const updatedGallery = payload.new as GalleryType;

          // Remove from pending if status changed from pending
          if (updatedGallery.status !== GalleryStatusEnum.pending) {
            setPendingGalleries((prev) =>
              prev.filter((g) => g.id !== updatedGallery.id)
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "galleries",
        },
        (payload) => {
          console.log("Gallery deleted:", payload);
          const deletedGallery = payload.old as GalleryType;
          setPendingGalleries((prev) =>
            prev.filter((g) => g.id !== deletedGallery.id)
          );
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle approve gallery request
  const handleApprove = async (galleryId: string) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("galleries")
        .update({
          status: GalleryStatusEnum.approved,
          updated_at: new Date().toISOString(),
        })
        .eq("id", galleryId);

      if (error) throw error;

      // Find the gallery to get user info for notification
      const approvedGallery = pendingGalleries.find((g) => g.id === galleryId);

      if (approvedGallery) {
        // Create notification for the user
        const notificationData = {
          title: "Gallery Request Approved",
          body: `Your gallery item "${
            approvedGallery.caption || approvedGallery.file_name
          }" has been approved and is now visible to everyone.`,
          type: NotificationTypeEnum.gallery_approved,
          resource_id: galleryId,
          user_id: approvedGallery.user_id,
          read: false,
          image: approvedGallery.url,
        };

        await supabase.from("notifications").insert(notificationData);
      }

      // Remove from pending list
      setPendingGalleries((prev) => prev.filter((g) => g.id !== galleryId));
      toast.success("Gallery request approved successfully");
    } catch (err: any) {
      console.error("Error approving gallery:", err);
      toast.error("Failed to approve gallery request");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle decline gallery request
  const handleDecline = async (galleryId: string) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    setIsProcessing(true);
    try {
      // Find the gallery to get user info for notification
      const declinedGallery = pendingGalleries.find((g) => g.id === galleryId);

      if (declinedGallery) {
        // Create notification for the user
        const notificationData = {
          title: "Gallery Request Declined",
          body: `Your gallery item "${
            declinedGallery.caption || declinedGallery.file_name
          }" has been declined. Please check if it meets our community guidelines.`,
          type: NotificationTypeEnum.gallery_declined,
          resource_id: galleryId,
          user_id: declinedGallery.user_id,
          read: false,
          image: declinedGallery.url,
        };

        await supabase.from("notifications").insert(notificationData);

        // Delete the gallery from storage
        if (declinedGallery.file_name) {
          const { error: storageError } = await supabase.storage
            .from("family-tree-bucket")
            .remove([declinedGallery.file_name]);

          if (storageError) {
            console.warn("Failed to delete file from storage:", storageError);
          }
        }
      }

      // Delete the gallery record
      const { error } = await supabase
        .from("galleries")
        .delete()
        .eq("id", galleryId);

      if (error) throw error;

      // Remove from pending list
      setPendingGalleries((prev) => prev.filter((g) => g.id !== galleryId));
      toast.success("Gallery request declined and removed");
    } catch (err: any) {
      console.error("Error declining gallery:", err);
      toast.error("Failed to decline gallery request");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle preview image
  const handlePreviewImage = (gallery: GalleryType) => {
    setSelectedImage(gallery);
    setIsPreviewOpen(true);
  };

  // Get featured galleries for the grid (show first 7)
  const featuredGalleries = pendingGalleries.slice(0, 7);

  if (isLoading && pendingGalleries.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <LoadingIcon className="size-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Gallery Requests</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage pending gallery submissions from family members
          </p>
        </div>

        {pendingGalleries.length > 0 && (
          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            {pendingGalleries.length} pending request
            {pendingGalleries.length === 1 ? "" : "s"}
          </div>
        )}
      </div>

      {pendingGalleries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No pending requests
              </h3>
              <p className="text-sm text-muted-foreground">
                All gallery submissions have been reviewed. New requests will
                appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* PENDING PHOTOS GRID */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {featuredGalleries.map((gallery, index) => (
                  <div
                    key={gallery.id}
                    className={cn(
                      "relative h-[30vh] bg-border w-full rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity",
                      index === 5 &&
                        featuredGalleries.length > 6 &&
                        "col-span-2"
                    )}
                    onClick={() => handlePreviewImage(gallery)}
                  >
                    <Image
                      src={gallery.url}
                      alt={
                        gallery.caption || gallery.file_name || "Gallery image"
                      }
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-all" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white text-sm font-medium truncate bg-black/50 px-2 py-1 rounded">
                        {gallery.caption || gallery.file_name || "Untitled"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* GALLERY REQUESTS TABLE */}
              <GalleryRequestsTable
                data={pendingGalleries}
                onUserClick={handlePreviewImage}
                onApprove={handleApprove}
                onDecline={handleDecline}
                isProcessing={isProcessing}
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* IMAGE PREVIEW MODAL */}
      <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedImage(null);
        }}
        imageUrl={selectedImage?.url || ""}
        imageName={selectedImage?.caption || selectedImage?.file_name || ""}
        onConfirm={() => setIsPreviewOpen(false)}
        showCaptionInput={false}
        isLoading={false}
      />
    </div>
  );
};

export default GalleryRequestsPage;
