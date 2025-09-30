import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NotificationTypeEnum } from "@/lib/constants/enums";
import { getAdminUserIdsServerSide } from "@/lib/utils/multi-admin-helpers";

// Create admin client with service role key
const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

export async function POST(req: Request) {
  const supabase = createAdminClient();

  try {
    const {
      name,
      gender,
      birthDate,
      description,
      imageSrc,
      fatherName,
      motherName,
      spouseName,
      orderOfBirth,
      orderOfMarriage,
      requested_by_user_id,
    } = await req.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // if (!user) {
    //   return new NextResponse(
    //     JSON.stringify({ error: "You must be logged in to make a request." }),
    //     { status: 401 }
    //   );
    // }

    const nameParts = name.split(" ");
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(" ");
    const fatherNameParts = fatherName?.split(" ") || [];
    const fathers_first_name = fatherNameParts[0];
    const fathers_last_name = fatherNameParts.slice(1).join(" ");
    const motherNameParts = motherName?.split(" ") || [];
    const mothers_first_name = motherNameParts[0];
    const mothers_last_name = motherNameParts.slice(1).join(" ");
    const spouseNameParts = spouseName?.split(" ") || [];
    const spouses_first_name = spouseNameParts[0];
    const spouses_last_name = spouseNameParts.slice(1).join(" ");

    const { data, error } = await supabase
      .from("family_member_requests")
      .insert([
        {
          first_name,
          last_name,
          gender,
          date_of_birth: birthDate,
          picture_link: imageSrc,
          marital_status: description,
          fathers_first_name,
          fathers_last_name,
          mothers_first_name,
          mothers_last_name,
          spouses_first_name,
          spouses_last_name,
          order_of_birth: orderOfBirth,
          order_of_marriage: orderOfMarriage,
          requested_by_user_id: requested_by_user_id,
          status: "pending",
        },
      ])
      .select();

    if (error) {
      console.error("Error inserting family member request:", error);
      return new NextResponse(
        JSON.stringify({ error: "Failed to submit request." }),
        { status: 500 }
      );
    }

    // Create notifications for all admin users about the new family member request
    try {
      const adminIds = await getAdminUserIdsServerSide();

      if (adminIds.length > 0 && data && data[0]) {
        const notifications = adminIds.map((adminId) => ({
          user_id: adminId,
          title: "New Family Member Request",
          body: `A new family member request for "${first_name} ${last_name}" has been submitted and is pending approval.`,
          type: NotificationTypeEnum.member_request,
          resource_id: data[0].id,
          image: imageSrc || null,
        }));

        const { error: notificationError } = await supabase.rpc(
          "create_system_notifications",
          {
            notifications: notifications,
          }
        );

        if (notificationError) {
          console.error(
            "Failed to create admin notifications:",
            notificationError
          );
          // Don't fail the request if notifications fail
        } else {
          console.log(
            `✅ Created notifications for ${adminIds.length} admin users`
          );
        }
      } else {
        console.log("⚠️ No admin users found or no data to notify about");
      }
    } catch (notificationErr) {
      console.error("Error creating admin notifications:", notificationErr);
      // Don't fail the request if notifications fail
    }

    return new NextResponse(JSON.stringify(data), { status: 201 });
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return new NextResponse(
      JSON.stringify({ error: "An internal server error occurred." }),
      { status: 500 }
    );
  }
}
