import "@/global.css";
import React from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import images from "@/constants/images";

export default function OnboardingScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.replace("/(auth)/sign-in");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: "#de7154" }}>
      <StatusBar style="light" />

      <SafeAreaView className="flex-1 justify-between">
        {/* Top Geometric Pattern */}
        <View
          className="w-full items-center justify-center overflow-hidden"
          style={{ height: height * 0.58 }}
        >
          <Image
            source={images.splashPattern}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        </View>

        {/* Bottom Content & CTA */}
        <View className="px-6 pb-6 pt-2">
          <Text className="text-4xl font-sans-extrabold text-white text-center tracking-tight leading-tight">
            Gain Financial Clarity
          </Text>

          <Text className="text-base font-sans-medium text-white/90 text-center mt-3 mb-8">
            Track, analyze and cancel with ease
          </Text>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleGetStarted}
            className="w-full items-center justify-center rounded-full bg-white py-4 shadow-lg active:scale-98"
          >
            <Text className="text-lg font-sans-bold text-primary">
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
