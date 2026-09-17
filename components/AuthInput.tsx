import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardTypeOptions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import clsx from "clsx";
import { colors } from "@/constants/theme";

interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string | null;
  isPassword?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  textContentType?: string;
  returnKeyType?: "done" | "go" | "next" | "search" | "send";
  onSubmitEditing?: () => void;
  editable?: boolean;
}

const AuthInput: React.FC<AuthInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  isPassword = false,
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
  returnKeyType,
  onSubmitEditing,
  editable = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="gap-1.5 mb-4">
      <Text className="text-sm font-sans-semibold text-primary">{label}</Text>

      <View
        className={clsx(
          "flex-row items-center rounded-2xl border bg-background px-4 py-1",
          error
            ? "border-destructive bg-destructive/5"
            : isFocused
            ? "border-accent"
            : "border-black/10"
        )}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(8, 17, 38, 0.4)"
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          editable={editable}
          className="flex-1 py-3.5 text-base font-sans-medium text-primary"
        />

        {isPassword && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowPassword((prev) => !prev)}
            className="p-1.5"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.foreground}
              style={{ opacity: 0.6 }}
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text className="text-xs font-sans-medium text-destructive mt-0.5 ml-1">
          {error}
        </Text>
      ) : null}
    </View>
  );
};

export default AuthInput;
