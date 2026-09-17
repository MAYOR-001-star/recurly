import "@/global.css";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, type PropsWithChildren } from "react";
import { Stack, usePathname } from "expo-router";
import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { ActivityIndicator, View } from "react-native";
import { colors } from "@/constants/theme";
import { PostHogProvider, usePostHog } from "posthog-react-native";
import { posthog } from "@/lib/posthog";

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
        email: user.primaryEmailAddress?.emailAddress,
        first_name: user.firstName,
        last_name: user.lastName,
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
        previous_screen: previousPathname.current,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, posthog]);

  return null;
}

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();

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
      <Stack.Protected guard={Boolean(isSignedIn)}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="subscriptions/[id]" />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
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
