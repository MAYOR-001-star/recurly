import "@/global.css";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "react-native-css";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { usePostHog } from "posthog-react-native";
import { clsx } from "clsx";

import { ALL_SUBSCRIPTIONS } from "@/constants/data.";
import { colors } from "@/constants/theme";
import { formatCurrency } from "@/lib/utils";
import SubscriptionCard from "@/components/SubscriptionCard";

const SafeAreaView = styled(RNSafeAreaView);

const FILTER_TAGS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "paused", label: "Paused" },
  { id: "cancelled", label: "Cancelled" },
  { id: "design", label: "Design" },
  { id: "developer tools", label: "Dev Tools" },
  { id: "ai tools", label: "AI Tools" },
  { id: "productivity", label: "Productivity" },
  { id: "entertainment", label: "Entertainment" },
  { id: "cloud storage", label: "Storage" },
  { id: "music", label: "Music" },
  { id: "reading", label: "Reading" },
  { id: "other", label: "Other" },
];

export default function Subscriptions() {
  const router = useRouter();
  const posthog = usePostHog();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>("github-copilot");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleToggleExpand = (id: string) => {
    const isExpanded = expandedSubscriptionId !== id;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    posthog.capture("subscription_details_toggled", {
      subscription_id: id,
      is_expanded: isExpanded,
      screen: "subscriptions",
    });
    setExpandedSubscriptionId(isExpanded ? id : null);
  };

  const handleCancelSubscription = (sub: typeof ALL_SUBSCRIPTIONS[0]) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    Alert.alert(
      "Cancel Subscription",
      `Are you sure you want to cancel your subscription to ${sub.name}?`,
      [
        { text: "Keep Subscription", style: "cancel" },
        {
          text: "Cancel Subscription",
          style: "destructive",
          onPress: () => {
            setCancellingId(sub.id);
            setTimeout(() => {
              setCancellingId(null);
              posthog.capture("subscription_cancelled", {
                subscription_id: sub.id,
                subscription_name: sub.name,
              });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              Alert.alert("Subscription Cancelled", `Your ${sub.name} subscription has been cancelled.`);
            }, 800);
          },
        },
      ]
    );
  };

  const handleSelectFilter = (filterId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    posthog.capture("subscription_filter_changed", {
      filter: filterId,
    });
    setSelectedFilter(filterId);
  };

  const handleClearSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSearchQuery("");
  };

  const handleResetAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSearchQuery("");
    setSelectedFilter("all");
  };

  // Filter subscriptions based on search query and category/status filter
  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return ALL_SUBSCRIPTIONS.filter((sub) => {
      // 1. Tag / Category / Status filter
      if (selectedFilter !== "all") {
        const matchesStatus = sub.status?.toLowerCase() === selectedFilter;
        const matchesCategory = sub.category?.toLowerCase() === selectedFilter;
        if (!matchesStatus && !matchesCategory) {
          return false;
        }
      }

      // 2. Search query filter
      if (!query) return true;

      const nameMatch = sub.name.toLowerCase().includes(query);
      const planMatch = sub.plan?.toLowerCase().includes(query) ?? false;
      const categoryMatch = sub.category?.toLowerCase().includes(query) ?? false;
      const statusMatch = sub.status?.toLowerCase().includes(query) ?? false;
      const billingMatch = sub.billing?.toLowerCase().includes(query) ?? false;
      const paymentMatch = sub.paymentMethod?.toLowerCase().includes(query) ?? false;

      return (
        nameMatch ||
        planMatch ||
        categoryMatch ||
        statusMatch ||
        billingMatch ||
        paymentMatch
      );
    });
  }, [searchQuery, selectedFilter]);

  // Calculate monthly total for the displayed items
  const totalMonthlySpend = useMemo(() => {
    return filteredSubscriptions.reduce((acc, sub) => {
      if (sub.status === "cancelled") return acc;
      const monthlyAmount =
        sub.billing.toLowerCase() === "yearly" ? sub.price / 12 : sub.price;
      return acc + monthlyAmount;
    }, 0);
  }, [filteredSubscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5 pb-0">
      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={handleToggleExpand}
            onCancelPress={() => handleCancelSubscription(item)}
            isCancelling={cancellingId === item.id}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={() => (
          <View className="mb-4 gap-4">
            {/* Top Navigation Bar Matching Image 1 */}
            <View className="flex-row items-center justify-between pt-1">
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
                className="size-11 items-center justify-center rounded-full border border-black/10 bg-background"
                accessibilityLabel="Go back"
              >
                <Ionicons name="chevron-back" size={20} color={colors.primary} />
              </TouchableOpacity>

              <Text className="text-2xl font-sans-bold text-primary">
                My Subscriptions
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

            {/* Search Input Bar */}
            <View className="flex-row items-center rounded-2xl border border-black/10 bg-card px-4 py-1">
              <Ionicons
                name="search-outline"
                size={20}
                color={colors.primary}
                style={{ opacity: 0.5, marginRight: 8 }}
              />
              <TextInput
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (text.length > 0 && text.length % 3 === 0) {
                    posthog.capture("subscription_searched", { query: text });
                  }
                }}
                placeholder="Search subscriptions, plans, categories..."
                placeholderTextColor="rgba(8, 17, 38, 0.4)"
                className="flex-1 py-3 text-base font-sans-medium text-primary"
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
                clearButtonMode="never"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={handleClearSearch}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  className="p-1"
                  accessibilityLabel="Clear search"
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.primary}
                    style={{ opacity: 0.6 }}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Pills / Categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingLeft: 20,
                paddingRight: 24,
                gap: 8,
              }}
              style={{
                marginHorizontal: -20,
              }}
            >
              {FILTER_TAGS.map((tag) => {
                const isActive = selectedFilter === tag.id;
                return (
                  <Pressable
                    key={tag.id}
                    onPress={() => handleSelectFilter(tag.id)}
                    className={clsx(
                      "shrink-0 rounded-full px-4 py-2 border",
                      isActive
                        ? "bg-primary border-primary"
                        : "bg-card border-black/10"
                    )}
                  >
                    <Text
                      className={clsx(
                        "text-sm font-sans-semibold",
                        isActive ? "text-background" : "text-primary/70"
                      )}
                    >
                      {tag.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Results Summary Row */}
            <View className="flex-row items-center justify-between pt-1">
              <Text className="text-sm font-sans-semibold text-muted-foreground">
                Showing {filteredSubscriptions.length}{" "}
                {filteredSubscriptions.length === 1
                  ? "subscription"
                  : "subscriptions"}
              </Text>
              {filteredSubscriptions.length > 0 && totalMonthlySpend > 0 && (
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-xs font-sans-medium text-muted-foreground">
                    Monthly est:
                  </Text>
                  <Text className="text-sm font-sans-bold text-primary">
                    {formatCurrency(totalMonthlySpend)}/mo
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-16 px-4">
            <View className="size-16 rounded-full bg-muted items-center justify-center mb-4">
              <Ionicons
                name="search-outline"
                size={30}
                color={colors.primary}
                style={{ opacity: 0.6 }}
              />
            </View>
            <Text className="text-lg font-sans-bold text-primary text-center mb-1">
              No subscriptions found
            </Text>
            <Text className="text-sm font-sans-medium text-muted-foreground text-center mb-6 max-w-xs">
              {searchQuery.trim()
                ? `We couldn't find any subscriptions matching "${searchQuery.trim()}".`
                : "No subscriptions match the selected filter."}
            </Text>
            {(searchQuery.length > 0 || selectedFilter !== "all") && (
              <TouchableOpacity
                onPress={handleResetAll}
                activeOpacity={0.8}
                className="rounded-full bg-primary px-5 py-2.5"
              >
                <Text className="text-sm font-sans-bold text-background">
                  Reset filters
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
