/**
 * Cleanly format Clerk API authentication errors into friendly, brand-native messages.
 */
export const getFriendlyErrorMessage = (error: unknown): string => {
  if (!error) return "An unexpected error occurred. Please try again.";

  // Check if it's a Clerk API error structure: error.errors[0]
  const maybeClerkError = error as {
    errors?: Array<{ code?: string; message?: string; longMessage?: string }>;
    message?: string;
  };

  if (maybeClerkError.errors && maybeClerkError.errors.length > 0) {
    const firstErr = maybeClerkError.errors[0];
    const code = firstErr.code || "";

    switch (code) {
      case "form_identifier_not_found":
        return "No account found with this email address. Please check your spelling or sign up.";
      case "form_password_incorrect":
        return "Incorrect password. Please try again or reset your password.";
      case "form_identifier_exists":
        return "An account with this email address already exists. Please sign in instead.";
      case "form_password_length_too_short":
        return "Password must be at least 8 characters long.";
      case "form_password_pwned":
        return "This password is too common or compromised. Please choose a stronger password.";
      case "form_code_incorrect":
        return "The 6-digit verification code is incorrect. Please check your email and try again.";
      case "verification_expired":
        return "The verification code has expired. Please request a new code.";
      case "too_many_attempts":
        return "Too many attempts. For your security, please wait a few minutes before trying again.";
      case "session_exists":
        return "You are already signed in.";
      default:
        // Strip generic "Clerk" brand mentions if any exist in the server message
        const rawMessage = firstErr.longMessage || firstErr.message || "";
        return rawMessage.replace(/clerk/gi, "account").trim() || "Authentication request failed. Please try again.";
    }
  }

  if (typeof maybeClerkError.message === "string") {
    return maybeClerkError.message.replace(/clerk/gi, "account").trim();
  }

  return "An unexpected error occurred. Please try again.";
};
