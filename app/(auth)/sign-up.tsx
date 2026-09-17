import React, { useState, useEffect } from "react";
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
import { useSignUp } from "@clerk/expo";
import { usePostHog } from "posthog-react-native";
import * as Haptics from "expo-haptics";
import AuthHeader from "@/components/AuthHeader";
import AuthInput from "@/components/AuthInput";
import { getFriendlyErrorMessage } from "@/lib/authErrors";
import { colors } from "@/constants/theme";

const SafeAreaView = styled(RNSafeAreaView);

type SignUpStep = "FORM" | "VERIFY_CODE";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, errors: clerkErrors, fetchStatus } = useSignUp();
  const posthog = usePostHog();

  const [step, setStep] = useState<SignUpStep>("FORM");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Resend cooldown timer
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCooldown]);

  const validateForm = (): boolean => {
    let isValid = true;

    if (!fullName.trim()) {
      setNameError("Please enter your name.");
      isValid = false;
    } else {
      setNameError(null);
    }

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      setEmailError("Email address is required.");
      isValid = false;
    } else if (!emailRegex.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      isValid = false;
    } else {
      setPasswordError(null);
    }

    return isValid;
  };

  const handleSignUp = async () => {
    setGeneralError(null);
    setInfoMessage(null);

    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => {}
      );
      return;
    }

    try {
      setIsLoading(true);

      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || undefined;

      const { error: signUpError } = await signUp.password({
        emailAddress: email.trim(),
        password,
        firstName,
        lastName,
      });

      if (signUpError) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
          () => {}
        );
        setGeneralError(getFriendlyErrorMessage(signUpError));
        return;
      }

      // Send verification email code
      const { error: sendCodeError } =
        await signUp.verifications.sendEmailCode();

      if (sendCodeError) {
        setGeneralError(getFriendlyErrorMessage(sendCodeError));
        return;
      }

      posthog.capture("account_registration_started");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
      setStep("VERIFY_CODE");
      setResendCooldown(30);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      );
      setGeneralError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    setGeneralError(null);
    setInfoMessage(null);

    const cleanCode = code.trim();
    if (!cleanCode || cleanCode.length < 4) {
      setCodeError("Please enter the verification code.");
      return;
    }
    setCodeError(null);

    try {
      setIsLoading(true);

      const { error: verifyError } =
        await signUp.verifications.verifyEmailCode({
          code: cleanCode,
        });

      if (verifyError) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
          () => {}
        );
        setGeneralError(getFriendlyErrorMessage(verifyError));
        return;
      }

      if (signUp.status === "complete") {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
        posthog.capture("account_registered");
        await signUp.finalize({
          navigate: () => {
            router.replace("/");
          },
        });
      } else {
        setGeneralError(
          "Verification was processed, but additional steps are needed. Please sign in."
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

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isLoading) return;

    setGeneralError(null);
    setInfoMessage(null);

    try {
      setIsLoading(true);
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) {
        setGeneralError(getFriendlyErrorMessage(error));
        return;
      }
      posthog.capture("verification_code_resent");
      setResendCooldown(30);
      setInfoMessage("A new verification code has been sent to your email.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
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
            title={step === "FORM" ? "Create account" : "Verify your email"}
            subtitle={
              step === "FORM"
                ? "Start tracking and optimizing all your subscriptions"
                : `We've sent a verification code to ${email.trim()}`
            }
          />

          {/* Form Card */}
          <View className="rounded-3xl border border-black/10 bg-card p-6 shadow-sm">
            {/* General Error Alert */}
            {generalError ? (
              <View className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5">
                <Text className="text-xs font-sans-semibold text-destructive leading-4">
                  {generalError}
                </Text>
              </View>
            ) : null}

            {/* Success / Info Message */}
            {infoMessage ? (
              <View className="mb-4 rounded-2xl border border-success/20 bg-success/10 p-3.5">
                <Text className="text-xs font-sans-semibold text-success leading-4">
                  {infoMessage}
                </Text>
              </View>
            ) : null}

            {step === "FORM" && (
              <>
                <AuthInput
                  label="Full Name"
                  value={fullName}
                  onChangeText={(val) => {
                    setFullName(val);
                    if (nameError) setNameError(null);
                    if (generalError) setGeneralError(null);
                  }}
                  placeholder="e.g. Sarah Jenkins"
                  autoCapitalize="words"
                  autoCorrect={false}
                  error={nameError}
                  returnKeyType="next"
                  editable={!isFetching}
                />

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
                  placeholder="At least 8 characters"
                  isPassword
                  error={passwordError}
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
                  editable={!isFetching}
                />

                {/* Password requirement hint */}
                <Text className="text-[11px] font-sans-medium text-muted-foreground -mt-2 mb-4 ml-1">
                  Must be at least 8 characters.
                </Text>

                {/* Submit Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSignUp}
                  disabled={isFetching}
                  className={`mt-1 items-center justify-center rounded-2xl bg-accent py-4 shadow-sm ${
                    isFetching ? "opacity-60" : "opacity-100"
                  }`}
                >
                  {isFetching ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-base font-sans-bold text-white">
                      Create account
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Navigation to Sign In */}
                <View className="mt-6 flex-row items-center justify-center gap-1">
                  <Text className="text-sm font-sans-medium text-muted-foreground">
                    Already have an account?
                  </Text>
                  <Link href="/(auth)/sign-in" asChild>
                    <TouchableOpacity activeOpacity={0.7} disabled={isFetching}>
                      <Text className="text-sm font-sans-bold text-accent">
                        Sign in
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </>
            )}

            {step === "VERIFY_CODE" && (
              <>
                <AuthInput
                  label="Verification Code"
                  value={code}
                  onChangeText={(val) => {
                    setCode(val);
                    if (codeError) setCodeError(null);
                    if (generalError) setGeneralError(null);
                  }}
                  placeholder="Enter 6-digit code"
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  error={codeError}
                  returnKeyType="done"
                  onSubmitEditing={handleVerify}
                  editable={!isFetching}
                />

                {/* Verify Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleVerify}
                  disabled={isFetching}
                  className={`mt-1 items-center justify-center rounded-2xl bg-accent py-4 shadow-sm ${
                    isFetching ? "opacity-60" : "opacity-100"
                  }`}
                >
                  {isFetching ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-base font-sans-bold text-white">
                      Verify & Continue
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Resend Code Button */}
                <View className="mt-4 items-center">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleResendCode}
                    disabled={resendCooldown > 0 || isFetching}
                  >
                    <Text
                      className={`text-sm font-sans-semibold ${
                        resendCooldown > 0 || isFetching
                          ? "text-muted-foreground"
                          : "text-accent"
                      }`}
                    >
                      {resendCooldown > 0
                        ? `Resend code in ${resendCooldown}s`
                        : "I need a new code"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Edit Email option */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setStep("FORM");
                    setCode("");
                    setGeneralError(null);
                    setInfoMessage(null);
                  }}
                  className="mt-4 items-center"
                  disabled={isFetching}
                >
                  <Text className="text-xs font-sans-semibold text-primary/60">
                    Use a different email
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
