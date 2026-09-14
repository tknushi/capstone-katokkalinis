import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TopNotificationBannerProps {
  visible: boolean;
  title: string;
  message: string;
  type?: "alert" | "info" | "success" | "schedule" | "truck" | "warning";
  onPress?: () => void;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export default function TopNotificationBanner({
  visible,
  title,
  message,
  type = "alert",
  onPress,
  onDismiss,
  autoDismissMs = 6000,
}: TopNotificationBannerProps) {
  const router = useRouter();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const handleDismiss = React.useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismissRef.current?.();
    });
  }, [opacity, translateY]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismissMs);

      return () => clearTimeout(timer);
    } else {
      translateY.setValue(-120);
      opacity.setValue(0);
    }
  }, [visible, autoDismissMs, handleDismiss, opacity, translateY]);

  const handlePress = () => {
    handleDismiss();
    if (onPress) {
      onPress();
    } else {
      router.push("/notifications" as any);
    }
  };

  if (!visible) return null;

  const iconName =
    type === "truck"
      ? "truck-fast"
      : type === "schedule"
      ? "calendar-clock"
      : type === "success"
      ? "check-circle"
      : type === "alert" || type === "warning"
      ? "alert-circle"
      : "information";

  const iconBgColor =
    type === "truck" || type === "success"
      ? "#E8F8EE"
      : type === "schedule"
      ? "#E3F2FD"
      : type === "warning"
      ? "#FFF3E0"
      : type === "alert"
      ? "#FFEBEE"
      : "#F2F5F2";

  const iconColor =
    type === "truck" || type === "success"
      ? "#2E7D32"
      : type === "schedule"
      ? "#1976D2"
      : type === "warning"
      ? "#E65100"
      : type === "alert"
      ? "#C62828"
      : "#4F634D";

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.92}
        onPress={handlePress}
      >
        <View style={[styles.iconBox, { backgroundColor: iconBgColor }]}>
          <MaterialCommunityIcons name={iconName} size={22} color={iconColor} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.nowBadge}>Now</Text>
          </View>
          <Text style={styles.messageText} numberOfLines={2}>
            {message}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="close" size={18} color="#8A9D87" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 25,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 500,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5EFE2",
    shadowColor: "#1A3816",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  titleText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E331B",
    flex: 1,
  },
  nowBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2E7D32",
    backgroundColor: "#E8F8EE",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  messageText: {
    fontSize: 12,
    color: "#5C7558",
    lineHeight: 16,
  },
  closeBtn: {
    padding: 4,
  },
});
