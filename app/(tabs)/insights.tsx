import "@/global.css";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "react-native-css";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { usePostHog } from "posthog-react-native";

import {
  INSIGHTS_CHART_DATA,
  INSIGHTS_EXPENSES,
  INSIGHTS_HISTORY,
  ChartBarData,
} from "@/constants/data.";
import { colors } from "@/constants/theme";

const SafeAreaView = styled(RNSafeAreaView);

const Y_AXIS_LEVELS = [45, 35, 25, 5, 0];
const CHART_HEIGHT = 150;
const MAX_Y = 45;

export default function MonthlyInsightsScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const [activeBarDay, setActiveBarDay] = useState<string>("Thr");

  const handleBarPress = (item: ChartBarData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActiveBarDay(item.day);
    posthog.capture("insights_bar_selected", {
      day: item.day,
      amount: item.value,
    });
  };

  const handleViewAllUpcoming = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.push("/(tabs)/subscriptions");
  };

  const handleViewAllHistory = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.push("/(tabs)/subscriptions");
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Top Navigation Bar */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="size-11 items-center justify-center rounded-full border border-black/10 bg-background"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </TouchableOpacity>

        <Text className="text-2xl font-sans-bold text-primary">
          Monthly Insights
        </Text>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }}
          activeOpacity={0.7}
          className="size-11 items-center justify-center rounded-full border border-black/10 bg-background"
          accessibilityLabel="More options"
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130, paddingTop: 10 }}
      >
        {/* Section 1: Upcoming */}
        <View className="flex-row items-center justify-between mb-3.5">
          <Text className="text-2xl font-sans-bold text-primary">Upcoming</Text>
          <TouchableOpacity
            onPress={handleViewAllUpcoming}
            activeOpacity={0.7}
            className="rounded-full border border-black/20 px-4 py-1.5 bg-transparent"
          >
            <Text className="text-sm font-sans-semibold text-primary">View all</Text>
          </TouchableOpacity>
        </View>

        {/* Chart Card */}
        <View className="rounded-3xl border border-black/10 bg-card p-5 mb-5 shadow-xs">
          <View className="flex-row" style={{ height: CHART_HEIGHT + 35 }}>
            {/* Y-Axis Labels */}
            <View
              className="justify-between pr-3 py-1"
              style={{ height: CHART_HEIGHT }}
            >
              {Y_AXIS_LEVELS.map((level) => (
                <Text
                  key={level}
                  className="text-xs font-sans-medium text-muted-foreground text-right"
                  style={{ width: 18 }}
                >
                  {level}
                </Text>
              ))}
            </View>

            {/* Chart Area with Gridlines & Bars */}
            <View className="flex-1 relative">
              {/* Horizontal Dashed Gridlines */}
              <View
                className="absolute inset-x-0 top-0 justify-between pointer-events-none"
                style={{ height: CHART_HEIGHT }}
              >
                {Y_AXIS_LEVELS.map((level) => (
                  <View
                    key={`line-${level}`}
                    className="w-full border-b border-dashed border-black/10"
                    style={{ height: 1 }}
                  />
                ))}
              </View>

              {/* Bars Row */}
              <View
                className="flex-row items-end justify-between px-2"
                style={{ height: CHART_HEIGHT }}
              >
                {INSIGHTS_CHART_DATA.map((item) => {
                  const isSelected = activeBarDay === item.day;
                  const barHeight = Math.max(
                    14,
                    Math.round((item.value / MAX_Y) * (CHART_HEIGHT - 20))
                  );

                  return (
                    <Pressable
                      key={item.day}
                      onPress={() => handleBarPress(item)}
                      className="items-center justify-end relative"
                      style={{ width: 34, height: CHART_HEIGHT }}
                    >
                      {/* Floating Badge for Selected/Highlighted Bar */}
                      {isSelected && (
                        <View
                          className="absolute items-center z-10"
                          style={{
                            bottom: barHeight + 8,
                            left: -15,
                            right: -15,
                            alignItems: "center",
                          }}
                        >
                          <View className="rounded-full bg-white px-2.5 py-1 shadow-sm border border-black/10 min-w-[42px] items-center justify-center">
                            <Text
                              numberOfLines={1}
                              className="text-[11px] font-sans-bold text-accent text-center"
                              style={{ includeFontPadding: false }}
                            >
                              ${item.value}
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Bar Column */}
                      <View
                        className="rounded-full"
                        style={{
                          width: 11,
                          height: barHeight,
                          backgroundColor: isSelected ? "#ea7a53" : colors.primary,
                        }}
                      />
                    </Pressable>
                  );
                })}
              </View>

              {/* X-Axis Day Labels */}
              <View className="flex-row items-center justify-between px-2 mt-2">
                {INSIGHTS_CHART_DATA.map((item) => {
                  const isSelected = activeBarDay === item.day;
                  return (
                    <Text
                      key={`day-${item.day}`}
                      className={`text-xs text-center font-sans-medium ${
                        isSelected ? "font-sans-bold text-primary" : "text-muted-foreground"
                      }`}
                      style={{ width: 34 }}
                    >
                      {item.day}
                    </Text>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Section 2: Expenses Summary Card */}
        <View className="rounded-2xl border border-black/10 bg-card p-5 mb-6 flex-row items-center justify-between shadow-xs">
          <View>
            <Text className="text-lg font-sans-bold text-primary">
              {INSIGHTS_EXPENSES.label}
            </Text>
            <Text className="text-sm font-sans-medium text-muted-foreground mt-0.5">
              {INSIGHTS_EXPENSES.month}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-xl font-sans-bold text-primary">
              -${Math.abs(INSIGHTS_EXPENSES.amount).toFixed(2)}
            </Text>
            <Text className="text-xs font-sans-semibold text-muted-foreground mt-0.5">
              {INSIGHTS_EXPENSES.changePercentage}
            </Text>
          </View>
        </View>

        {/* Section 3: History */}
        <View className="flex-row items-center justify-between mb-3.5">
          <Text className="text-2xl font-sans-bold text-primary">History</Text>
          <TouchableOpacity
            onPress={handleViewAllHistory}
            activeOpacity={0.7}
            className="rounded-full border border-black/20 px-4 py-1.5 bg-transparent"
          >
            <Text className="text-sm font-sans-semibold text-primary">View all</Text>
          </TouchableOpacity>
        </View>

        {/* History Cards List */}
        <View className="gap-3.5">
          {INSIGHTS_HISTORY.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              }}
              style={{ backgroundColor: item.color }}
              className="rounded-2xl p-4 flex-row items-center justify-between shadow-xs"
            >
              {/* Left Column: Icon & Copy */}
              <View className="flex-row items-center flex-1 pr-3">
                <View className="size-12 rounded-xl bg-white/70 items-center justify-center mr-3.5">
                  <Image
                    source={item.icon}
                    className="size-7"
                    resizeMode="contain"
                  />
                </View>
                <View className="flex-1">
                  <Text
                    numberOfLines={1}
                    className="text-lg font-sans-bold text-primary"
                  >
                    {item.name}
                  </Text>
                  <Text className="text-xs font-sans-medium text-primary/70 mt-0.5">
                    {item.date}
                  </Text>
                </View>
              </View>

              {/* Right Column: Amount & Frequency */}
              <View className="items-end shrink-0">
                <Text className="text-lg font-sans-bold text-primary">
                  ${item.price.toFixed(2)}
                </Text>
                <Text className="text-xs font-sans-medium text-primary/70 mt-0.5">
                  {item.frequency}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
