import "@/global.css";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, type PropsWithChildren } from "react";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { ActivityIndicator, LogBox, View } from "react-native";
import { colors } from "@/constants/theme";
import { PostHogProvider, usePostHog } from "posthog-react-native";
import { posthog } from "@/lib/posthog";

LogBox.ignoreLogs([
  "Clerk: Clerk has been loaded with development keys",
  "PostHogFetchNetworkError",
  "Error while flushing PostHog",
  "The action 'REPLACE'",
]);

SplashScreen.preventAutoHideAsync().catch(() => {});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in environment variables."
  );
}

function PostHogIdentity({ children }: PropsWithChildren) {
  const { isLoaded, user } = useUser();
  const posthog = usePostHog();
  const identifiedUserId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!user) {
      identifiedUserId.current = undefined;
      return;
    }

    if (identifiedUserId.current === user.id) {
      return;
    }

    posthog.identify(user.id, {
      $set: {
        email: user.primaryEmailAddress?.emailAddress ?? null,
        first_name: user.firstName ?? null,
        last_name: user.lastName ?? null,
      },
    });
    identifiedUserId.current = user.id;
  }, [isLoaded, posthog, user]);

  return children;
}

function PostHogScreenTracking() {
  const pathname = usePathname();
  const posthog = usePostHog();
  const previousPathname = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, posthog]);

  return null;
}

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";

    if (!isSignedIn && !inAuthGroup && !inOnboarding) {
      router.replace("/(auth)/sign-in");
    } else if (isSignedIn && (inAuthGroup || inOnboarding)) {
      router.replace("/(tabs)");
    }
  }, [isSignedIn, isLoaded, segments, router]);

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="subscriptions/[id]" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  const content = (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      {posthog ? (
        <PostHogIdentity>
          <PostHogScreenTracking />
          <InitialLayout />
        </PostHogIdentity>
      ) : (
        <InitialLayout />
      )}
    </ClerkProvider>
  );

  return posthog ? (
    <PostHogProvider
      client={posthog}
      autocapture={{ captureScreens: false, captureTouches: true, propsToCapture: ["testID"] }}
    >
      {content}
    </PostHogProvider>
  ) : (
    content
  );
}
