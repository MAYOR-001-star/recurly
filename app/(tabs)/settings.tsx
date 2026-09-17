import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Linking,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "react-native-css";
import { useClerk, useUser } from "@clerk/expo";
import { usePostHog } from "posthog-react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { colors } from "@/constants/theme";
import images from "@/constants/images";
import { getFriendlyErrorMessage } from "@/lib/authErrors";

const SafeAreaView = styled(RNSafeAreaView);

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  isLast?: boolean;
}

export default function SettingsScreen() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const posthog = usePostHog();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Edit Profile States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [firstNameInput, setFirstNameInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const openEditModal = () => {
    setFirstNameInput(user?.firstName || "");
    setLastNameInput(user?.lastName || "");
    setEditError(null);
    setEditModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleSaveProfile = async () => {
    if (!firstNameInput.trim()) {
      setEditError("First name cannot be empty.");
      return;
    }

    try {
      setIsUpdatingProfile(true);
      setEditError(null);

      if (user) {
        await user.update({
          firstName: firstNameInput.trim(),
          lastName: lastNameInput.trim(),
        });

        posthog.capture("profile_updated", {
          updated_fields: lastNameInput.trim()
            ? ["first_name", "last_name"]
            : ["first_name"],
        });
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
        setEditModalVisible(false);
      }
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      );
      setEditError(getFriendlyErrorMessage(err));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSignOut = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
      () => {}
    );
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of your Recurrly account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              setIsSigningOut(true);
              await signOut();
              posthog.capture("user_signed_out");
              posthog.reset();
            } catch (err) {
              console.error("Sign out error:", err);
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    posthog.capture("support_contact_requested", { channel: "email" });
    Linking.openURL("mailto:support@recurrly.app?subject=Recurrly%20Support").catch(
      () => {
        Alert.alert(
          "Support",
          "You can reach our team directly at support@recurrly.app"
        );
      }
    );
  };

  const displayName = user?.fullName || user?.firstName || "Recurrly User";
  const displayEmail =
    user?.primaryEmailAddress?.emailAddress || "Not provided";
  const avatarSource = user?.imageUrl ? { uri: user.imageUrl } : images.avatar;
  const memberSince = user?.createdAt
    ? dayjs(user.createdAt).format("MMMM D, YYYY")
    : "Recently joined";

  const SettingRow = ({
    icon,
    iconBgColor = "#f6eecf",
    iconColor = colors.primary,
    title,
    value,
    onPress,
    showChevron = false,
    isLast = false,
  }: SettingRowProps) => {
    const Container = onPress ? TouchableOpacity : View;

    return (
      <Container
        activeOpacity={0.7}
        onPress={onPress}
        className={`flex-row items-center justify-between py-3.5 px-4 ${
          !isLast ? "border-b border-black/5" : ""
        }`}
      >
        <View className="flex-row items-center flex-1 pr-2">
          <View
            style={{ backgroundColor: iconBgColor }}
            className="size-9 rounded-xl items-center justify-center mr-3"
          >
            <Ionicons name={icon} size={18} color={iconColor} />
          </View>
          <Text className="text-sm font-sans-semibold text-primary">{title}</Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          {value && (
            <Text className="text-sm font-sans-medium text-muted-foreground">
              {value}
            </Text>
          )}
          {showChevron && (
            <Ionicons
              name="chevron-forward"
              size={16}
              color="rgba(0,0,0,0.3)"
            />
          )}
        </View>
      </Container>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-5 pt-3 pb-2">
        <Text className="text-3xl font-sans-extrabold text-primary">Settings</Text>
        <Text className="text-sm font-sans-medium text-muted-foreground mt-0.5">
          Manage your account and app details
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 }}
      >
        {/* Profile Card with Edit Action */}
        <View className="rounded-3xl border border-black/10 bg-card p-5 mb-5 shadow-sm">
          {!isLoaded ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4 flex-1 pr-2">
                <Image
                  source={avatarSource}
                  className="size-16 rounded-full border-2 border-accent"
                />
                <View className="flex-1">
                  <Text className="text-lg font-sans-bold text-primary">
                    {displayName}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-xs font-sans-medium text-muted-foreground mt-0.5"
                  >
                    {displayEmail}
                  </Text>
                  <View className="flex-row items-center gap-1.5 mt-2">
                    <View className="size-2 rounded-full bg-success" />
                    <Text className="text-xs font-sans-medium text-muted-foreground">
                      Clerk Authenticated
                    </Text>
                  </View>
                </View>
              </View>

              {/* Edit Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={openEditModal}
                className="size-10 rounded-2xl bg-muted/80 border border-black/5 items-center justify-center"
              >
                <Ionicons name="pencil" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Account Info */}
        <Text className="text-xs font-sans-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
          Account Details
        </Text>
        <View className="rounded-3xl border border-black/10 bg-card mb-5 overflow-hidden shadow-sm">
          <SettingRow
            icon="person-outline"
            iconBgColor="#ea7a5320"
            iconColor={colors.accent}
            title="Name"
            value={displayName}
            showChevron
            onPress={openEditModal}
          />
          <SettingRow
            icon="mail-outline"
            iconBgColor="#8fd1bd30"
            iconColor="#107e60"
            title="Email"
            value={displayEmail}
          />
          <SettingRow
            icon="calendar-outline"
            iconBgColor="#b8d4e340"
            iconColor="#2c6d96"
            title="Member Since"
            value={memberSince}
            isLast
          />
        </View>

        {/* Application Info */}
        <Text className="text-xs font-sans-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
          Application
        </Text>
        <View className="rounded-3xl border border-black/10 bg-card mb-5 overflow-hidden shadow-sm">
          <SettingRow
            icon="phone-portrait-outline"
            iconBgColor="#f6eecf"
            iconColor={colors.primary}
            title="App Name"
            value="Recurrly"
          />
          <SettingRow
            icon="information-circle-outline"
            iconBgColor="#f6eecf"
            iconColor={colors.primary}
            title="Version"
            value="1.0.0"
          />
          <SettingRow
            icon="mail-unread-outline"
            iconBgColor="#ea7a5320"
            iconColor={colors.accent}
            title="Contact Support"
            value="support@recurrly.app"
            showChevron
            onPress={handleContactSupport}
            isLast
          />
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSignOut}
          disabled={isSigningOut}
          className="flex-row items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 py-4 mt-2"
        >
          {isSigningOut ? (
            <ActivityIndicator size="small" color={colors.destructive} />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
              <Text className="text-base font-sans-bold text-destructive">
                Sign Out
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          if (!isUpdatingProfile) setEditModalVisible(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="bg-background rounded-t-3xl p-5 border-t border-black/10">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-4 border-b border-black/10">
              <View>
                <Text className="text-xl font-sans-bold text-primary">
                  Edit Profile
                </Text>
                <Text className="text-xs font-sans-medium text-muted-foreground mt-0.5">
                  Update your name in Recurrly & Clerk
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                disabled={isUpdatingProfile}
                className="size-8 rounded-full bg-muted items-center justify-center"
              >
                <Ionicons name="close" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <View className="py-4 gap-4">
              {editError && (
                <View className="rounded-2xl border border-destructive/20 bg-destructive/10 p-3">
                  <Text className="text-xs font-sans-semibold text-destructive">
                    {editError}
                  </Text>
                </View>
              )}

              <View className="gap-1.5">
                <Text className="text-xs font-sans-semibold text-primary">
                  First Name
                </Text>
                <TextInput
                  value={firstNameInput}
                  onChangeText={(val) => {
                    setFirstNameInput(val);
                    if (editError) setEditError(null);
                  }}
                  placeholder="First name"
                  placeholderTextColor="rgba(8, 17, 38, 0.4)"
                  className="rounded-2xl border border-black/10 bg-card px-4 py-3.5 text-base font-sans-medium text-primary"
                  editable={!isUpdatingProfile}
                />
              </View>

              <View className="gap-1.5">
                <Text className="text-xs font-sans-semibold text-primary">
                  Last Name
                </Text>
                <TextInput
                  value={lastNameInput}
                  onChangeText={(val) => {
                    setLastNameInput(val);
                    if (editError) setEditError(null);
                  }}
                  placeholder="Last name"
                  placeholderTextColor="rgba(8, 17, 38, 0.4)"
                  className="rounded-2xl border border-black/10 bg-card px-4 py-3.5 text-base font-sans-medium text-primary"
                  editable={!isUpdatingProfile}
                />
              </View>

              <View className="gap-1.5">
                <Text className="text-xs font-sans-semibold text-muted-foreground">
                  Email Address
                </Text>
                <View className="rounded-2xl border border-black/5 bg-muted/40 px-4 py-3.5">
                  <Text className="text-sm font-sans-medium text-muted-foreground">
                    {displayEmail} (Managed via Clerk)
                  </Text>
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSaveProfile}
                disabled={isUpdatingProfile}
                className="mt-2 items-center justify-center rounded-2xl bg-accent py-4 shadow-sm"
              >
                {isUpdatingProfile ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-base font-sans-bold text-white">
                    Save Changes
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

