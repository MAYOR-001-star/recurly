import "@/global.css";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { clsx } from "clsx";
import dayjs from "dayjs";
import * as Haptics from "expo-haptics";
import { icons } from "@/constants/icons";

export const SUBSCRIPTION_CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

export type SubscriptionCategory = (typeof SUBSCRIPTION_CATEGORIES)[number];

export const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#ffd7be",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#b8e8d0",
  Cloud: "#bae6fd",
  Music: "#d1fae5",
  Other: "#fff8e7",
};

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
}

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<"Monthly" | "Yearly">("Monthly");
  const [category, setCategory] = useState<SubscriptionCategory>("Entertainment");

  const parsedPrice = parseFloat(price);
  const isValid = name.trim().length > 0 && !isNaN(parsedPrice) && parsedPrice > 0;

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!isValid) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const now = dayjs();
    const renewalDate =
      frequency === "Monthly"
        ? now.add(1, "month").toISOString()
        : now.add(1, "year").toISOString();

    const newSubscription: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      price: parsedPrice,
      frequency,
      category,
      status: "active",
      startDate: now.toISOString(),
      renewalDate,
      icon: icons.wallet,
      billing: frequency,
      color: CATEGORY_COLORS[category] || "#fff8e7",
    };

    onSubmit(newSubscription);
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="modal-overlay">
        <Pressable className="flex-1" onPress={handleClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="modal-container"
        >
          {/* Header */}
          <View className="modal-header">
            <Text className="modal-title">New Subscription</Text>
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.7}
              className="modal-close"
              accessibilityLabel="Close modal"
            >
              <Text className="modal-close-text">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Form Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="modal-body pb-8"
          >
            {/* Name Field */}
            <View className="auth-field">
              <Text className="auth-label">Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Netflix, Spotify, GitHub"
                placeholderTextColor="rgba(8, 17, 38, 0.4)"
                className="auth-input"
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Price Field */}
            <View className="auth-field">
              <Text className="auth-label">Price</Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor="rgba(8, 17, 38, 0.4)"
                keyboardType="decimal-pad"
                className="auth-input"
                returnKeyType="done"
              />
            </View>

            {/* Frequency Field */}
            <View className="auth-field">
              <Text className="auth-label">Frequency</Text>
              <View className="picker-row">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setFrequency("Monthly");
                  }}
                  className={clsx(
                    "picker-option",
                    frequency === "Monthly" && "picker-option-active"
                  )}
                >
                  <Text
                    className={clsx(
                      "picker-option-text",
                      frequency === "Monthly" && "picker-option-text-active"
                    )}
                  >
                    Monthly
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setFrequency("Yearly");
                  }}
                  className={clsx(
                    "picker-option",
                    frequency === "Yearly" && "picker-option-active"
                  )}
                >
                  <Text
                    className={clsx(
                      "picker-option-text",
                      frequency === "Yearly" && "picker-option-text-active"
                    )}
                  >
                    Yearly
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Category Field */}
            <View className="auth-field">
              <Text className="auth-label">Category</Text>
              <View className="category-scroll">
                {SUBSCRIPTION_CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      activeOpacity={0.7}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        setCategory(cat);
                      }}
                      className={clsx(
                        "category-chip",
                        isSelected && "category-chip-active"
                      )}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          isSelected && "category-chip-text-active"
                        )}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!isValid}
              onPress={handleSubmit}
              className={clsx(
                "auth-button mt-2",
                !isValid && "auth-button-disabled"
              )}
            >
              <Text className="auth-button-text">Add Subscription</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
