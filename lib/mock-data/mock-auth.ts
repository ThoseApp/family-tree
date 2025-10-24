import {
  MockAuthClient,
  MockAuthResponse,
  MockAuthSession,
  MockUser,
  MockError,
} from "./types";
import { mockDataService } from "./mock-service";
import users from "./fixtures/users.json";

/**
 * MockAuthService - Mock authentication system
 * Simulates Supabase auth with session management
 */
class MockAuthService implements MockAuthClient {
  private currentSession: MockAuthSession | null = null;
  private authStateListeners: Array<
    (event: string, session: MockAuthSession | null) => void
  > = [];

  constructor() {
    // Try to restore session from sessionStorage
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("mock_auth_session");
      if (stored) {
        try {
          this.currentSession = JSON.parse(stored);
        } catch (e) {
          console.error("[Mock Auth] Failed to restore session");
        }
      }
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithPassword(credentials: {
    email: string;
    password: string;
  }): Promise<MockAuthResponse> {
    await this.simulateDelay();

    // Find user by email first
    const user = users.find((u) => u.email === credentials.email);

    if (!user) {
      return {
        data: { user: null, session: null },
        error: {
          message: "Invalid login credentials",
          code: "invalid_credentials",
        },
      };
    }

    // In mock mode, allow "Demo@123." as universal password for all test accounts
    const isUniversalPassword = credentials.password === "Demo@123.";
    const isOriginalPassword = credentials.password === user.password;
    const isValidPassword = isUniversalPassword || isOriginalPassword;

    if (!isValidPassword) {
      return {
        data: { user: null, session: null },
        error: {
          message: "Invalid login credentials",
          code: "invalid_credentials",
        },
      };
    }

    // Log which password method was used
    if (isUniversalPassword) {
      console.log(
        `[Mock Auth] User ${user.email} signed in with universal demo password`
      );
    } else {
      console.log(
        `[Mock Auth] User ${user.email} signed in with original password`
      );
    }

    // Create mock session
    const session = this.createSession(user);
    this.setSession(session);

    return {
      data: { user: session.user, session },
      error: null,
    };
  }

  /**
   * Sign in with OAuth (mock Google sign-in)
   */
  async signInWithOAuth(
    options: any
  ): Promise<{ data: any; error: MockError | null }> {
    await this.simulateDelay();

    // In mock mode, we'll just auto-sign in as the admin user
    // In a real scenario, this would redirect to OAuth provider
    const adminUser = users.find((u) => u.email === "admin@test.com");

    if (!adminUser) {
      return {
        data: null,
        error: {
          message: "OAuth mock user not found",
          code: "oauth_error",
        },
      };
    }

    const session = this.createSession(adminUser);
    this.setSession(session);

    return {
      data: {
        provider: options.provider,
        url: window.location.origin, // No redirect in mock mode
      },
      error: null,
    };
  }

  /**
   * Sign up a new user
   */
  async signUp(credentials: any): Promise<MockAuthResponse> {
    await this.simulateDelay();

    const { email, password, options } = credentials;

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return {
        data: { user: null, session: null },
        error: {
          message: "User already registered",
          code: "user_already_exists",
        },
      };
    }

    // Create new mock user
    const newUser: any = {
      id: `user-${Date.now()}`,
      email,
      password, // In production, this would be hashed
      created_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(), // Auto-confirm in mock mode
      user_metadata: options?.data || {},
    };

    // Add to mock data (this persists for the session)
    users.push(newUser);

    // Create session
    const session = this.createSession(newUser);
    this.setSession(session);

    return {
      data: { user: session.user, session },
      error: null,
    };
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ error: MockError | null }> {
    await this.simulateDelay();

    this.clearSession();
    this.notifyAuthStateChange("SIGNED_OUT", null);

    return { error: null };
  }

  /**
   * Get current session
   */
  async getSession(): Promise<{
    data: { session: MockAuthSession | null };
    error: MockError | null;
  }> {
    await this.simulateDelay();

    return {
      data: { session: this.currentSession },
      error: null,
    };
  }

  /**
   * Get current user
   */
  async getUser(): Promise<{
    data: { user: MockUser | null };
    error: MockError | null;
  }> {
    await this.simulateDelay();

    return {
      data: { user: this.currentSession?.user || null },
      error: null,
    };
  }

  /**
   * Update user attributes
   */
  async updateUser(attributes: any): Promise<{
    data: { user: MockUser | null };
    error: MockError | null;
  }> {
    await this.simulateDelay();

    if (!this.currentSession) {
      return {
        data: { user: null },
        error: {
          message: "Not authenticated",
          code: "not_authenticated",
        },
      };
    }

    // Update user metadata
    if (attributes.data) {
      this.currentSession.user.user_metadata = {
        ...this.currentSession.user.user_metadata,
        ...attributes.data,
      };
    }

    // Update password (in mock, we just acknowledge it)
    if (attributes.password) {
      console.log("[Mock Auth] Password updated");
    }

    // Persist updated session
    this.setSession(this.currentSession);

    return {
      data: { user: this.currentSession.user },
      error: null,
    };
  }

  /**
   * Send password reset email
   */
  async resetPasswordForEmail(
    email: string,
    options?: any
  ): Promise<{ data: any; error: MockError | null }> {
    await this.simulateDelay();

    const user = users.find((u) => u.email === email);

    if (!user) {
      // Don't reveal if user exists for security
      return { data: {}, error: null };
    }

    console.log(`[Mock Auth] Password reset email sent to ${email}`);
    return { data: {}, error: null };
  }

  /**
   * Resend verification email
   */
  async resend(params: any): Promise<{ data: any; error: MockError | null }> {
    await this.simulateDelay();

    console.log(`[Mock Auth] Resending ${params.type} to ${params.email}`);
    return { data: {}, error: null };
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(params: any): Promise<MockAuthResponse> {
    await this.simulateDelay();

    const { email, token, type } = params;

    // In mock mode, accept any 6-digit code
    if (!/^\d{6}$/.test(token)) {
      return {
        data: { user: null, session: null },
        error: {
          message: "Invalid OTP code",
          code: "invalid_otp",
        },
      };
    }

    const user = users.find((u) => u.email === email);
    if (!user) {
      return {
        data: { user: null, session: null },
        error: {
          message: "User not found",
          code: "user_not_found",
        },
      };
    }

    const session = this.createSession(user);
    this.setSession(session);

    return {
      data: { user: session.user, session },
      error: null,
    };
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(
    callback: (event: string, session: MockAuthSession | null) => void
  ): { data: { subscription: { unsubscribe: () => void } } } {
    this.authStateListeners.push(callback);

    // Immediately call with current state
    const event = this.currentSession ? "SIGNED_IN" : "SIGNED_OUT";
    callback(event, this.currentSession);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.authStateListeners.indexOf(callback);
            if (index > -1) {
              this.authStateListeners.splice(index, 1);
            }
          },
        },
      },
    };
  }

  /**
   * Create a mock session from user data
   */
  private createSession(user: any): MockAuthSession {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 3600; // 1 hour

    return {
      access_token: `mock_token_${user.id}_${now}`,
      refresh_token: `mock_refresh_${user.id}_${now}`,
      expires_in: expiresIn,
      expires_at: now + expiresIn,
      token_type: "bearer",
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata || {},
        app_metadata: {},
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at,
      },
    };
  }

  /**
   * Set and persist session
   */
  private setSession(session: MockAuthSession): void {
    this.currentSession = session;

    if (typeof window !== "undefined") {
      sessionStorage.setItem("mock_auth_session", JSON.stringify(session));
    }

    this.notifyAuthStateChange("SIGNED_IN", session);
  }

  /**
   * Clear session
   */
  private clearSession(): void {
    this.currentSession = null;

    if (typeof window !== "undefined") {
      sessionStorage.removeItem("mock_auth_session");
    }
  }

  /**
   * Notify all auth state listeners
   */
  private notifyAuthStateChange(
    event: string,
    session: MockAuthSession | null
  ): void {
    this.authStateListeners.forEach((listener) => {
      try {
        listener(event, session);
      } catch (error) {
        console.error("[Mock Auth] Error in auth state listener:", error);
      }
    });
  }

  /**
   * Simulate network delay
   */
  private async simulateDelay(): Promise<void> {
    const delay = Math.random() * 200 + 100; // 100-300ms
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Get current session synchronously (for middleware)
   */
  getCurrentSession(): MockAuthSession | null {
    return this.currentSession;
  }

  /**
   * Switch to different test user (for development tools)
   */
  async switchUser(email: string): Promise<boolean> {
    const user = users.find((u) => u.email === email);
    if (!user) return false;

    const session = this.createSession(user);
    this.setSession(session);

    // Also update the profile in user store
    window.location.reload();

    return true;
  }
}

// Singleton instance
export const mockAuthService = new MockAuthService();
