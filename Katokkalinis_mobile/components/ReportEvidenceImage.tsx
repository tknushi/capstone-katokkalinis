import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { resolveMediaUrl } from "../services/api";

interface ReportEvidenceImageProps {
  uri?: string | null;
  style?: StyleProp<ViewStyle>;
  imageHeight?: number;
  onPressFullScreen?: (url: string) => void;
  showExpandHint?: boolean;
}

export default function ReportEvidenceImage({
  uri,
  style,
  imageHeight = 180,
  onPressFullScreen,
  showExpandHint = true,
}: ReportEvidenceImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const resolved = resolveMediaUrl(uri);

  if (!resolved || error) {
    return (
      <View style={[styles.fallbackContainer, { height: imageHeight }, style]}>
        <MaterialCommunityIcons name="image-broken-variant" size={32} color="#8DA78B" />
        <Text style={styles.fallbackText}>Photo evidence unavailable</Text>
      </View>
    );
  }

  const handlePress = () => {
    if (onPressFullScreen && resolved) {
      onPressFullScreen(resolved);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={onPressFullScreen ? 0.9 : 1}
      onPress={handlePress}
      style={[styles.container, { height: imageHeight }, style]}
    >
      <Image
        source={{ uri: resolved }}
        style={styles.image}
        resizeMode="cover"
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#2E7D32" />
        </View>
      )}

      {showExpandHint && !loading && !error && (
        <View style={styles.expandBadge}>
          <MaterialCommunityIcons name="fullscreen" size={15} color="#FFFFFF" />
          <Text style={styles.expandText}>Tap to expand</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F0F5EF",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(240, 245, 239, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackContainer: {
    width: "100%",
    borderRadius: 14,
    backgroundColor: "#F4F7F3",
    borderWidth: 1,
    borderColor: "#E2ECE0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  fallbackText: {
    fontSize: 12,
    color: "#7A8D78",
    fontWeight: "600",
  },
  expandBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(30, 51, 27, 0.75)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  expandText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
});
