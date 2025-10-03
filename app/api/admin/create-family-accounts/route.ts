import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
  FamilyMemberAccountCreation,
  AccountCreationResult,
  BulkAccountCreationRequest,
  BulkAccountCreationResult,
} from "@/lib/types";
import { generateSecurePassword } from "@/lib/utils/password-helpers";
import { LifeStatusEnum } from "@/lib/constants/enums";

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

// Verify if the current user is an admin
async function verifyAdminUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = createAdminClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }

    // Check if user is admin
    if (user.user_metadata?.is_admin !== true) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error verifying admin user:", error);
    return null;
  }
}

// Create a single family member account
async function createFamilyMemberAccount(
  accountData: FamilyMemberAccountCreation,
  adminClient: any
): Promise<AccountCreationResult> {
  try {
    // Check if family member exists in family-tree table and is Account Eligible
    const { data: familyMember, error: familyError } = await adminClient
      .from("family-tree")
      .select("unique_id, first_name, last_name, date_of_birth, life_status")
      .eq("unique_id", accountData.familyMemberId)
      .single();

    if (familyError || !familyMember) {
      throw new Error(
        `Family member with ID ${accountData.familyMemberId} not found`
      );
    }

    // Check if family member is eligible for account creation
    if (familyMember.life_status !== LifeStatusEnum.accountEligible) {
      throw new Error(
        `Cannot create account for family member with life status: ${familyMember.life_status}. Only "Account Eligible" members can have accounts created.`
      );
    }

    // Check if user already has an account
    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("user_id")
      .eq("family_tree_uid", accountData.familyMemberId)
      .single();

    if (existingProfile) {
      throw new Error(
        `Account already exists for family member ${accountData.familyMemberId}`
      );
    }

    // Generate secure password
    const password = generateSecurePassword(12);

    // Create auth user with admin client
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email: accountData.email,
        password: password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          first_name: accountData.firstName,
          last_name: accountData.lastName,
          full_name: `${accountData.firstName} ${accountData.lastName}`,
          date_of_birth: accountData.dateOfBirth || familyMember.date_of_birth,
          is_admin: false,
          is_publisher: false,
          created_by_admin: true,
          family_tree_uid: accountData.familyMemberId,
          requires_password_change: true, // Flag for forced password change
        },
      });

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error("Failed to create user - no user data returned");
    }

    // Create profile record
    const { error: profileError } = await adminClient.from("profiles").insert({
      user_id: authData.user.id,
      first_name: accountData.firstName,
      last_name: accountData.lastName,
      email: accountData.email,
      phone_number: accountData.phoneNumber || null,
      date_of_birth: accountData.dateOfBirth || familyMember.date_of_birth,
      status: "approved", // Auto-approve accounts created by admin
      family_tree_uid: accountData.familyMemberId, // Link to family tree
      has_completed_onboarding_tour: false, // Ensure new users see the tour
      onboarding_tour_version: null, // Start with no version completed
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      // If profile creation fails, we should delete the auth user
      await adminClient.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    // Send invitation email with login details
    try {
      await sendInvitationEmail(adminClient, {
        email: accountData.email,
        password: password,
        firstName: accountData.firstName,
        lastName: accountData.lastName,
        familyMemberId: accountData.familyMemberId,
      });
    } catch (emailError) {
      console.warn("Failed to send invitation email:", emailError);
      // Don't fail the entire operation if email fails
    }

    return {
      success: true,
      userId: authData.user.id,
      email: accountData.email,
      password: password,
    };
  } catch (error: any) {
    console.error("Error creating family member account:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
}

// Send invitation email with login credentials
async function sendInvitationEmail(
  adminClient: any,
  credentials: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    familyMemberId: string;
  }
) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Mosuro Family Tree</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Dear ${credentials.firstName},</p>
        
        <p>We trust this meets you well.</p>
        
        <p>The Kith & Kin Family History book, published in 1987, has been converted to digital format with a robust family tree & other engaging features as a way for us to preserve our family history & keep the family closely connected together.</p>
        
        <p>We have granted you access to the platform & you may claim your profile using the log-in details below:</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${credentials.email}</p>
          <p style="margin: 0 0 10px 0;"><strong>Password:</strong> ${credentials.password}</p>
          <p style="margin: 0;"><strong>Unique ID:</strong> ${credentials.familyMemberId}</p>
        </div>
        
        <p><strong>To access your account, please log in here:</strong> <a href="https://mosuro.com.ng/sign-in" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">https://mosuro.com.ng/sign-in</a></p>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e;"><strong>⚠️ Important Security Notice:</strong></p>
          <p style="margin: 10px 0 0 0; color: #92400e;">For your account security, please change your password immediately after logging in for the first time. You will be prompted to create a new, secure password upon your first login.</p>
        </div>
        
        <p style="margin-top: 30px;">Yours,</p>
        <p><strong>Mosuro Family Tree</strong></p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">This email was sent automatically. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  // Check if Resend is configured
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.log(
      "⚠️  RESEND_API_KEY not configured. Email details logged below:"
    );
    console.log("Email would be sent to:", credentials.email);
    console.log(
      "Email subject: Welcome to Mosuro Family Tree - Your Account Details"
    );
    console.log("Login credentials:", {
      email: credentials.email,
      password: credentials.password,
      familyMemberId: credentials.familyMemberId,
    });
    return; // Skip email sending
  }

  try {
    // Helper to send email via Resend to a specific recipient
    const sendToRecipient = async (recipient: string) => {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Mosuro Family Tree <onboarding@mosuro.com.ng>",
          to: recipient,
          subject: "Welcome to Mosuro Family Tree - Your Account Details",
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to send email to ${recipient}: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();
      return result;
    };

    // Try primary recipient first
    try {
      const result = await sendToRecipient(credentials.email);
      console.log("✅ Email sent successfully to primary:", result.id);
    } catch (primaryError: any) {
      console.warn(
        `Primary email send failed for ${credentials.email}: ${
          primaryError?.message || primaryError
        }. Attempting fallback recipient...`
      );

      // Fallback to developer email
      const fallbackRecipient = "those.dev@gmail.com";
      try {
        const result = await sendToRecipient(fallbackRecipient);
        console.log(
          `✅ Fallback email sent successfully to ${fallbackRecipient}:`,
          result.id
        );
      } catch (fallbackError: any) {
        console.error(
          `❌ Fallback email send failed to ${fallbackRecipient}:`,
          fallbackError?.message || fallbackError
        );
        throw fallbackError;
      }
    }
  } catch (emailError: any) {
    console.error("Failed to send email via Resend:", emailError.message);
    console.log("📧 Login credentials for manual delivery:");
    console.log(`Email: ${credentials.email}`);
    console.log(`Password: ${credentials.password}`);
    console.log(`Family ID: ${credentials.familyMemberId}`);

    // Re-throw the error so the calling function can handle it
    throw emailError;
  }
}

// POST: Create single account
export async function POST(request: NextRequest) {
  try {
    // Verify admin user
    const adminUser = await verifyAdminUser(request);
    if (!adminUser) {
      return NextResponse.json(
        { code: "not_admin", message: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log("Creating family member account", body);
    const {
      familyMemberId,
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
    } = body;

    if (!familyMemberId || !firstName || !email) {
      return NextResponse.json(
        {
          error: "Missing required fields: familyMemberId, firstName, email",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    const accountData: FamilyMemberAccountCreation = {
      familyMemberId,
      firstName,
      lastName,
      email,
      password: "", // Will be generated
      phoneNumber,
      dateOfBirth,
    };

    const result = await createFamilyMemberAccount(accountData, adminClient);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Account created successfully",
        data: {
          userId: result.userId,
          email: result.email,
        },
      });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error in create family account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Create multiple accounts (batch)
export async function PUT(request: NextRequest) {
  try {
    // Verify admin user
    const adminUser = await verifyAdminUser(request);
    if (!adminUser) {
      return NextResponse.json(
        { code: "not_admin", message: "Admin access required" },
        { status: 403 }
      );
    }

    const body: BulkAccountCreationRequest = await request.json();
    const { accounts } = body;

    if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
      return NextResponse.json(
        { error: "No accounts provided" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    const results: AccountCreationResult[] = [];
    const errors: string[] = [];

    // Process accounts sequentially to avoid overwhelming the system
    for (const accountData of accounts) {
      const result = await createFamilyMemberAccount(accountData, adminClient);
      results.push(result);

      if (!result.success && result.error) {
        errors.push(`${accountData.familyMemberId}: ${result.error}`);
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    const response: BulkAccountCreationResult = {
      totalRequested: accounts.length,
      successCount,
      failureCount,
      results,
      errors,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error in bulk account creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
