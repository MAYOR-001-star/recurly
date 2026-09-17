import React from "react";
import { View, Text } from "react-native";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <View className="items-center mt-2 mb-6">
      {/* Brand Wordmark & Logo */}
      <View className="flex-row items-center gap-3 mb-8">
        <View className="w-13 h-13 rounded-2xl bg-accent items-center justify-center shadow-sm">
          <Text className="text-white font-sans-extrabold text-2xl tracking-wider">
            R
          </Text>
        </View>
        <View className="justify-center">
          <Text className="text-2xl font-sans-extrabold text-primary tracking-tight">
            Recurly
          </Text>
          <Text className="text-[10px] font-sans-bold uppercase tracking-[1.5px] text-primary/60 -mt-0.5">
            SMART BILLING
          </Text>
        </View>
      </View>

      {/* Screen Title & Subtitle */}
      <Text className="text-3xl font-sans-bold text-primary text-center">
        {title}
      </Text>
      <Text className="text-sm font-sans-medium text-muted-foreground text-center mt-2 px-4 leading-5">
        {subtitle}
      </Text>
    </View>
  );
};

export default AuthHeader;
