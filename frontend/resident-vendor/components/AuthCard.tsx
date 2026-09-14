import React from "react";
import { StyleSheet, View } from "react-native";

type AuthCardProps = {
  children: React.ReactNode;
};

export default function AuthCard({
  children,
}: AuthCardProps) {
  return (
    <View style={styles.card}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    minHeight: "72%",

    backgroundColor: "#FFFFFF",

    borderTopLeftRadius: 52,
    borderTopRightRadius: 52,

    paddingHorizontal: 34,
    paddingTop: 30,
    paddingBottom: 30,
  },
});