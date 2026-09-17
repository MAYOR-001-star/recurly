import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "react-native-css";
import { useRouter, Link } from "expo-router";
import { useSignIn } from "@clerk/expo";
import * as Haptics from "expo-haptics";
import AuthHeader from "@/components/AuthHeader";
import AuthInput from "@/components/AuthInput";
import { getFriendlyErrorMessage } from "@/lib/authErrors";
import { colors } from "@/constants/theme";

const SafeAreaView = styled(RNSafeAreaView);

type AuthMode = "SIGN_IN" | "FORGOT_PASSWORD" | "ENTER_NEW_PASSWORD";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, errors: clerkErrors, fetchStatus } = useSignIn();

  const [mode, setMode] = useState<AuthMode>("SIGN_IN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setEmailError("Email address is required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (val: string): boolean => {
    if (!val) {
      setPasswordError("Password is required.");
      return false;
    }
    if (val.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleSignIn = async () => {
    setGeneralError(null);
    setInfoMessage(null);

    const isEmailValid = validateEmail(email);
    const isPassValid = validatePassword(password);

    if (!isEmailValid || !isPassValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => {}
      );
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await signIn.password({
        emailAddress: email.trim(),
        password,
      });

      if (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
          () => {}
        );
        setGeneralError(getFriendlyErrorMessage(error));
        return;
      }

      if (signIn.status === "complete") {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
        await signIn.finalize({
          navigate: () => {
            router.replace("/");
          },
        });
      } else if (signIn.status === "needs_first_factor") {
        setGeneralError(
          "Additional verification required. Please check your email."
        );
      } else {
        setGeneralError(
          "Sign-in could not be completed. Please verify your credentials."
        );
      }
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      );
      setGeneralError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetCode = async () => {
    setGeneralError(null);
    setInfoMessage(null);

    if (!validateEmail(email)) {
      return;
    }

    try {
      setIsLoading(true);
      await signIn.reset();
      const { error: createError } = await signIn.create({
        identifier: email.trim(),
      });

      if (createError) {
        setGeneralError(getFriendlyErrorMessage(createError));
        return;
      }

      const { error: sendError } =
        await signIn.resetPasswordEmailCode.sendCode();

      if (sendError) {
        setGeneralError(getFriendlyErrorMessage(sendError));
        return;
      }

      setInfoMessage(`We've sent a password reset code to ${email.trim()}.`);
      setMode("ENTER_NEW_PASSWORD");
    } catch (err) {
      setGeneralError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setGeneralError(null);
    setInfoMessage(null);

    if (!resetCode.trim()) {
      setCodeError("Please enter the 6-digit code.");
      return;
    }
    setCodeError(null);

    if (!newPassword || newPassword.length < 8) {
      setNewPasswordError("New password must be at least 8 characters.");
      return;
    }
    setNewPasswordError(null);

    try {
      setIsLoading(true);
      const { error: verifyError } =
        await signIn.resetPasswordEmailCode.verifyCode({
          code: resetCode.trim(),
        });

      if (verifyError) {
        setGeneralError(getFriendlyErrorMessage(verifyError));
        return;
      }

      const { error: submitError } =
        await signIn.resetPasswordEmailCode.submitPassword({
          password: newPassword,
        });

      if (submitError) {
        setGeneralError(getFriendlyErrorMessage(submitError));
        return;
      }

      if (signIn.status === "complete") {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
        await signIn.finalize({
          navigate: () => {
            router.replace("/");
          },
        });
      } else {
        setInfoMessage(
          "Password reset successfully! Please sign in with your new password."
        );
        setMode("SIGN_IN");
        setPassword("");
      }
    } catch (err) {
      setGeneralError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const isFetching = fetchStatus === "fetching" || isLoading;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      className="flex-1 bg-background"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <AuthHeader
            title={
              mode === "SIGN_IN"
                ? "Welcome back"
                : mode === "FORGOT_PASSWORD"
                ? "Reset password"
                : "Enter new password"
            }
            subtitle={
              mode === "SIGN_IN"
                ? "Sign in to continue managing your subscriptions"
                : mode === "FORGOT_PASSWORD"
                ? "Enter your email address to receive a recovery code"
                : "Enter the code sent to your email and your new password"
            }
          />

          {/* Form Card */}
          <View className="rounded-3xl border border-black/10 bg-card p-6 shadow-sm">
            {/* General Error Banner */}
            {generalError ? (
              <View className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5">
                <Text className="text-xs font-sans-semibold text-destructive leading-4">
                  {generalError}
                </Text>
              </View>
            ) : null}

            {/* Info Message Banner */}
            {infoMessage ? (
              <View className="mb-4 rounded-2xl border border-success/20 bg-success/10 p-3.5">
                <Text className="text-xs font-sans-semibold text-success leading-4">
                  {infoMessage}
                </Text>
              </View>
            ) : null}

            {mode === "SIGN_IN" && (
              <>
                <AuthInput
                  label="Email"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (emailError) setEmailError(null);
                    if (generalError) setGeneralError(null);
                  }}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={emailError}
                  returnKeyType="next"
                  editable={!isFetching}
                />

                <AuthInput
                  label="Password"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (passwordError) setPasswordError(null);
                    if (generalError) setGeneralError(null);
                  }}
                  placeholder="Enter your password"
                  isPassword
                  error={passwordError}
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
                  editable={!isFetching}
                />

                {/* Forgot Password Link */}
                <View className="items-end -mt-1 mb-5">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setGeneralError(null);
                      setInfoMessage(null);
                      setMode("FORGOT_PASSWORD");
                    }}
                    disabled={isFetching}
                  >
                    <Text className="text-xs font-sans-semibold text-accent">
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSignIn}
                  disabled={isFetching}
                  className={`items-center justify-center rounded-2xl bg-accent py-4 shadow-sm ${
                    isFetching ? "opacity-60" : "opacity-100"
                  }`}
                >
                  {isFetching ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-base font-sans-bold text-white">
                      Sign in
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Navigation to Sign Up */}
                <View className="mt-6 flex-row items-center justify-center gap-1">
                  <Text className="text-sm font-sans-medium text-muted-foreground">
                    New to Recurly?
                  </Text>
                  <Link href="/(auth)/sign-up" asChild>
                    <TouchableOpacity activeOpacity={0.7} disabled={isFetching}>
                      <Text className="text-sm font-sans-bold text-accent">
                        Create an account
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </>
            )}

            {mode === "FORGOT_PASSWORD" && (
              <>
                <AuthInput
                  label="Account Email"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="Enter your registered email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={emailError}
                  editable={!isFetching}
                />

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSendResetCode}
                  disabled={isFetching}
                  className={`mt-2 items-center justify-center rounded-2xl bg-accent py-4 shadow-sm ${
                    isFetching ? "opacity-60" : "opacity-100"
                  }`}
                >
                  {isFetching ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-base font-sans-bold text-white">
                      Send reset code
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setGeneralError(null);
                    setInfoMessage(null);
                    setMode("SIGN_IN");
                  }}
                  className="mt-5 items-center"
                  disabled={isFetching}
                >
                  <Text className="text-sm font-sans-bold text-primary/70">
                    Back to sign in
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {mode === "ENTER_NEW_PASSWORD" && (
              <>
                <AuthInput
                  label="6-Digit Code"
                  value={resetCode}
                  onChangeText={(val) => {
                    setResetCode(val);
                    if (codeError) setCodeError(null);
                  }}
                  placeholder="e.g. 123456"
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  error={codeError}
                  editable={!isFetching}
                />

                <AuthInput
                  label="New Password"
                  value={newPassword}
                  onChangeText={(val) => {
                    setNewPassword(val);
                    if (newPasswordError) setNewPasswordError(null);
                  }}
                  placeholder="At least 8 characters"
                  isPassword
                  error={newPasswordError}
                  editable={!isFetching}
                />

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleResetPassword}
                  disabled={isFetching}
                  className={`mt-2 items-center justify-center rounded-2xl bg-accent py-4 shadow-sm ${
                    isFetching ? "opacity-60" : "opacity-100"
                  }`}
                >
                  {isFetching ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-base font-sans-bold text-white">
                      Reset & Sign in
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setGeneralError(null);
                    setInfoMessage(null);
                    setMode("SIGN_IN");
                  }}
                  className="mt-5 items-center"
                  disabled={isFetching}
                >
                  <Text className="text-sm font-sans-bold text-primary/70">
                    Cancel and return to sign in
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
