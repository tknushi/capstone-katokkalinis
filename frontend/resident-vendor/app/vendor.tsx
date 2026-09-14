import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function Vendor() {
  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>
          Vendor Dashboard
        </Text>

        <Text style={styles.subtitle}>
          Welcome to Katok Kalinis
        </Text>
      </View>

      <View style={styles.content}>

        <View style={styles.card}>
          <Ionicons
            name="storefront-outline"
            size={35}
            color="#4CAF50"
          />

          <Text style={styles.cardTitle}>
            Vendor Account
          </Text>

          <Text style={styles.description}>
            Manage your vendor information and
            sanitation compliance.
          </Text>
        </View>

        <View style={styles.card}>
          <Ionicons
            name="qr-code-outline"
            size={35}
            color="#4CAF50"
          />

          <Text style={styles.cardTitle}>
            QR Verification
          </Text>

          <Text style={styles.description}>
            Access your registered vendor QR
            information.
          </Text>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7ED957",
  },

  header: {
    paddingTop: 70,
    paddingHorizontal: 25,
    paddingBottom: 30,
  },

  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    color: "white",
    fontSize: 13,
    marginTop: 5,
  },

  content: {
    flex: 1,

    backgroundColor: "#F8F8F8",

    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,

    padding: 20,
  },

  card: {
    backgroundColor: "white",

    borderRadius: 15,

    padding: 20,

    marginBottom: 15,

    elevation: 2,
  },

  cardTitle: {
    color: "#4CAF50",

    fontSize: 18,

    fontWeight: "700",

    marginTop: 10,
  },

  description: {
    color: "#777",

    fontSize: 12,

    marginTop: 5,
  },
});