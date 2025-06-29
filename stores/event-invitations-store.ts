import { create } from "zustand";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { EventInvitation, UserProfile } from "@/lib/types";
import { NotificationTypeEnum } from "@/lib/constants/enums";

interface EventInvitationsState {
  invitations: EventInvitation[];
  sentInvitations: EventInvitation[];
  loading: boolean;
  error: string | null;

  // Fetch invitations received by a user
  fetchReceivedInvitations: (userId: string) => Promise<EventInvitation[]>;

  // Fetch invitations sent by a user
  fetchSentInvitations: (userId: string) => Promise<EventInvitation[]>;

  // Send invitation to multiple users
  sendInvitations: (
    eventId: string,
    inviterUserId: string,
    inviteeUserIds: string[],
    message?: string
  ) => Promise<boolean>;

  // Respond to an invitation (accept/decline)
  respondToInvitation: (
    invitationId: string,
    status: "accepted" | "declined"
  ) => Promise<boolean>;

  // Cancel an invitation (for sender)
  cancelInvitation: (invitationId: string) => Promise<boolean>;

  // Get family members (approved users) for invitation selection
  getFamilyMembers: () => Promise<UserProfile[]>;

  // Get event attendees (accepted invitations)
  getEventAttendees: (eventId: string) => Promise<EventInvitation[]>;

  // Test function to verify notification creation
  testNotificationCreation: (userId: string) => Promise<boolean>;
}

export const useEventInvitationsStore = create<EventInvitationsState>(
  (set, get) => ({
    invitations: [],
    sentInvitations: [],
    loading: false,
    error: null,

    fetchReceivedInvitations: async (userId: string) => {
      set({ loading: true, error: null });

      try {
        // Fetch invitations first
        const { data: invitationsData, error } = await supabase
          .from("event_invitations")
          .select(
            `
            *,
            event:events(*)
          `
          )
          .eq("invitee_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Then fetch inviter profiles separately
        const inviterIds = invitationsData?.map((inv) => inv.inviter_id) || [];
        let inviterProfiles: any[] = [];

        if (inviterIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("user_id, first_name, last_name, image")
            .in("user_id", inviterIds);

          inviterProfiles = profilesData || [];
        }

        // Combine the data
        const invitations =
          invitationsData?.map((invitation) => ({
            ...invitation,
            inviter: inviterProfiles.find(
              (profile) => profile.user_id === invitation.inviter_id
            ),
          })) || [];

        set({ invitations, loading: false });
        return invitations;
      } catch (error: any) {
        const errorMessage = error?.message || "Failed to fetch invitations";
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
        return [];
      }
    },

    fetchSentInvitations: async (userId: string) => {
      set({ loading: true, error: null });

      try {
        // Fetch sent invitations first
        const { data: invitationsData, error } = await supabase
          .from("event_invitations")
          .select(
            `
            *,
            event:events(*)
          `
          )
          .eq("inviter_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Then fetch invitee profiles separately
        const inviteeIds = invitationsData?.map((inv) => inv.invitee_id) || [];
        let inviteeProfiles: any[] = [];

        if (inviteeIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("user_id, first_name, last_name, image")
            .in("user_id", inviteeIds);

          inviteeProfiles = profilesData || [];
        }

        // Combine the data
        const sentInvitations =
          invitationsData?.map((invitation) => ({
            ...invitation,
            invitee: inviteeProfiles.find(
              (profile) => profile.user_id === invitation.invitee_id
            ),
          })) || [];

        set({ sentInvitations, loading: false });
        return sentInvitations;
      } catch (error: any) {
        const errorMessage =
          error?.message || "Failed to fetch sent invitations";
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
        return [];
      }
    },

    sendInvitations: async (
      eventId,
      inviterUserId,
      inviteeUserIds,
      message
    ) => {
      set({ loading: true, error: null });

      try {
        console.log("=== Starting sendInvitations ===");
        console.log("Event ID:", eventId);
        console.log("Inviter User ID:", inviterUserId);
        console.log("Invitee User IDs:", inviteeUserIds);
        console.log("Message:", message);

        // Check if all required parameters are present
        if (
          !eventId ||
          !inviterUserId ||
          !inviteeUserIds ||
          inviteeUserIds.length === 0
        ) {
          throw new Error(
            "Missing required parameters for sending invitations"
          );
        }

        // Check if invitations already exist for these users
        const { data: existingInvitations, error: checkError } = await supabase
          .from("event_invitations")
          .select("invitee_id")
          .eq("event_id", eventId)
          .in("invitee_id", inviteeUserIds);

        if (checkError) throw checkError;

        const existingInviteeIds =
          existingInvitations?.map((inv) => inv.invitee_id) || [];
        const newInviteeIds = inviteeUserIds.filter(
          (id) => !existingInviteeIds.includes(id)
        );

        if (newInviteeIds.length === 0) {
          toast.error(
            "All selected users have already been invited to this event"
          );
          set({ loading: false });
          return false;
        }

        // Create invitation records
        const invitationsToCreate = newInviteeIds.map((inviteeId) => ({
          event_id: eventId,
          inviter_id: inviterUserId,
          invitee_id: inviteeId,
          status: "pending" as const,
          message: message || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error: insertError } = await supabase
          .from("event_invitations")
          .insert(invitationsToCreate);

        if (insertError) throw insertError;

        // Get event details and inviter info for the notification
        const { data: eventData } = await supabase
          .from("events")
          .select("name, image")
          .eq("id", eventId)
          .single();

        const { data: inviterData } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("user_id", inviterUserId)
          .single();

        const eventName = eventData?.name || "an event";
        const inviterName = inviterData
          ? `${inviterData.first_name} ${inviterData.last_name}`
          : "someone";

        // Create notifications for invitees using secure database function
        const notificationsToCreate = newInviteeIds.map((inviteeId) => ({
          user_id: inviteeId,
          title: "Event Invitation",
          body: `${inviterName} has invited you to "${eventName}"${
            message ? `. Message: "${message}"` : ""
          }`,
          type: NotificationTypeEnum.event_invitation,
          resource_id: eventId,
          image: eventData?.image,
        }));

        console.log("Creating notifications:", notificationsToCreate);

        try {
          const { data: createdCount, error: notificationError } =
            await supabase.rpc("create_system_notifications", {
              notifications: notificationsToCreate,
            });

          if (notificationError) {
            console.error("Failed to create notifications:", notificationError);
            console.error("Notification error details:", {
              code: notificationError.code,
              message: notificationError.message,
              details: notificationError.details,
              hint: notificationError.hint,
            });
            toast.error("Invitations sent but notifications failed to send");
          } else {
            console.log("Notifications created successfully");
            console.log("Created notification count:", createdCount || 0);
          }
        } catch (notificationErr) {
          console.error("Error creating notifications:", notificationErr);
          toast.error("Invitations sent but notifications failed to send");
        }

        // Also check current user authentication
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();
        console.log("Current authenticated user:", currentUser?.id);
        if (userError) {
          console.error("User authentication error:", userError);
        }

        set({ loading: false });
        toast.success(
          `Invitations sent to ${newInviteeIds.length} family member${
            newInviteeIds.length === 1 ? "" : "s"
          }`
        );

        if (existingInviteeIds.length > 0) {
          toast.info(
            `${existingInviteeIds.length} user${
              existingInviteeIds.length === 1 ? " has" : "s have"
            } already been invited`
          );
        }

        return true;
      } catch (error: any) {
        const errorMessage = error?.message || "Failed to send invitations";
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
        return false;
      }
    },

    respondToInvitation: async (invitationId, status) => {
      set({ loading: true, error: null });

      try {
        // First get the invitation details to create a response notification
        const { data: invitationData, error: fetchError } = await supabase
          .from("event_invitations")
          .select(
            `
            *,
            event:events(name)
          `
          )
          .eq("id", invitationId)
          .single();

        // Get the invitee profile separately
        let inviteeProfile = null;
        if (invitationData) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("user_id", invitationData.invitee_id)
            .single();

          inviteeProfile = profileData;
        }

        if (fetchError) throw fetchError;

        const { error } = await supabase
          .from("event_invitations")
          .update({
            status,
            responded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", invitationId);

        if (error) throw error;

        // Create notification for the event creator about the response
        if (invitationData) {
          const eventName = invitationData.event?.name || "your event";
          const responderName = inviteeProfile
            ? `${inviteeProfile.first_name} ${inviteeProfile.last_name}`
            : "Someone";

          try {
            await supabase.rpc("create_system_notification", {
              p_user_id: invitationData.inviter_id,
              p_title: `Invitation ${status}`,
              p_body: `${responderName} has ${status} your invitation to "${eventName}"`,
              p_type: "event",
              p_resource_id: invitationData.event_id,
            });
          } catch (error) {
            console.error("Failed to create response notification:", error);
            // Don't throw here as the main invitation response was successful
          }
        }

        // Update local state
        set((state) => ({
          invitations: state.invitations.map((inv) =>
            inv.id === invitationId
              ? { ...inv, status, responded_at: new Date().toISOString() }
              : inv
          ),
          loading: false,
        }));

        toast.success(`Invitation ${status}`);
        return true;
      } catch (error: any) {
        const errorMessage =
          error?.message || "Failed to respond to invitation";
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
        return false;
      }
    },

    cancelInvitation: async (invitationId) => {
      set({ loading: true, error: null });

      try {
        const { error } = await supabase
          .from("event_invitations")
          .delete()
          .eq("id", invitationId);

        if (error) throw error;

        // Update local state
        set((state) => ({
          sentInvitations: state.sentInvitations.filter(
            (inv) => inv.id !== invitationId
          ),
          loading: false,
        }));

        toast.success("Invitation cancelled");
        return true;
      } catch (error: any) {
        const errorMessage = error?.message || "Failed to cancel invitation";
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
        return false;
      }
    },

    getFamilyMembers: async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name, image, email")
          .eq("status", "approved")
          .order("first_name");

        if (error) throw error;

        return (data || []).map((profile) => ({
          ...profile,
          id: profile.user_id,
        })) as UserProfile[];
      } catch (error: any) {
        toast.error("Failed to fetch family members");
        return [];
      }
    },

    getEventAttendees: async (eventId) => {
      try {
        // Fetch accepted invitations first
        const { data: invitationsData, error } = await supabase
          .from("event_invitations")
          .select("*")
          .eq("event_id", eventId)
          .eq("status", "accepted")
          .order("responded_at", { ascending: false });

        if (error) throw error;

        // Then fetch invitee profiles separately
        const inviteeIds = invitationsData?.map((inv) => inv.invitee_id) || [];
        let inviteeProfiles: any[] = [];

        if (inviteeIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("user_id, first_name, last_name, image")
            .in("user_id", inviteeIds);

          inviteeProfiles = profilesData || [];
        }

        // Combine the data
        const attendees =
          invitationsData?.map((invitation) => ({
            ...invitation,
            invitee: inviteeProfiles.find(
              (profile) => profile.user_id === invitation.invitee_id
            ),
          })) || [];

        return attendees as EventInvitation[];
      } catch (error: any) {
        toast.error("Failed to fetch event attendees");
        return [];
      }
    },

    // Test function to verify notification creation
    testNotificationCreation: async (userId: string) => {
      try {
        const testNotification = {
          user_id: userId,
          title: "Test Notification",
          body: "This is a test notification to verify the system is working",
          type: "event_invitation",
          read: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log("Creating test notification:", testNotification);

        const { data, error } = await supabase
          .from("notifications")
          .insert(testNotification)
          .select("*");

        if (error) {
          console.error("Failed to create test notification:", error);
          toast.error(`Test notification failed: ${error.message}`);
          return false;
        } else {
          console.log("Test notification created successfully:", data);
          toast.success("Test notification created successfully!");
          return true;
        }
      } catch (error: any) {
        console.error("Error in test notification:", error);
        toast.error(`Test error: ${error.message}`);
        return false;
      }
    },
  })
);
