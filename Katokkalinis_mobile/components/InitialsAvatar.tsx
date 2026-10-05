import React, { useState } from "react";
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { resolveMediaUrl } from "../services/api";

interface InitialsAvatarProps {
  name?: string | null;
  avatarUri?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

// Generate a deterministic soft pastel background color from the name
const AVATAR_COLORS = [
  { bg: "#E8F5E9", text: "#2E7D32" }, // Green
  { bg: "#E3F2FD", text: "#1565C0" }, // Blue
  { bg: "#FFF3E0", text: "#E65100" }, // Orange
  { bg: "#F3E5F5", text: "#7B1FA2" }, // Purple
  { bg: "#E0F2F1", text: "#00695C" }, // Teal
  { bg: "#FBE9E7", text: "#D84315" }, // Deep Orange
];

export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function InitialsAvatar({
  name,
  avatarUri,
  size = 40,
  style,
  textStyle,
}: InitialsAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const resolvedUri = resolveMediaUrl(avatarUri);
  const initials = getInitials(name);

  // Compute color based on name hash
  let charCodeSum = 0;
  const safeName = name || "User";
  for (let i = 0; i < safeName.length; i++) {
    charCodeSum += safeName.charCodeAt(i);
  }
  const colorScheme = AVATAR_COLORS[charCodeSum % AVATAR_COLORS.length];

  const fontSize = Math.max(12, Math.floor(size * 0.4));

  if (resolvedUri && !imageError && !resolvedUri.includes("pravatar")) {
    return (
      <Image
        source={{ uri: resolvedUri }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
          style as any,
        ]}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallbackCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colorScheme.bg,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.initialsText,
          { fontSize, color: colorScheme.text },
          textStyle,
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: "#E8F5E9",
  },
  fallbackCircle: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  initialsText: {
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
