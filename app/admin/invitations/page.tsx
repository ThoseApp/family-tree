"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const AdminInvitationsRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to events page with invitations tab
    router.replace("/admin/events?tab=invitations");
  }, [router]);

  // Show nothing while redirecting
  return null;
};

export default AdminInvitationsRedirect;
