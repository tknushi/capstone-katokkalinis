import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/role");
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>KatokKalinis</Text>

      <Text style={styles.tagline}>
        Kakatok, Lilinis, Gagaan ang Buhay.
      </Text>

      <ActivityIndicator
        size="small"
        color="#FFFFFF"
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7ED957",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
  },

  tagline: {
    color: "#FFFFFF",
    fontSize: 13,
    marginTop: 6,
  },

  loader: {
    marginTop: 30,
  },
});