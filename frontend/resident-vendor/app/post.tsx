import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Post() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      {/* Top */}

      <View style={styles.topRow}>

        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Ionicons
            name="close"
            size={24}
            color="#4CAF50"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reportButton}
        >
          <Text style={styles.reportText}>
            Report
          </Text>
        </TouchableOpacity>

      </View>

      {/* Barangay */}

      <TouchableOpacity
        style={styles.dropdown}
      >
        <Text style={styles.dropdownText}>
          Select Barangay
        </Text>

        <Ionicons
          name="chevron-down"
          size={16}
          color="#4CAF50"
        />
      </TouchableOpacity>

      {/* Title */}

      <Text style={styles.title}>
        Title
      </Text>

      <Text style={styles.subtitle}>
        Describe the issue or situation
      </Text>

      {/* Title Input */}

      <TextInput
        placeholder="Title"
        placeholderTextColor="#999"
        style={styles.input}
      />

      {/* Description */}

      <TextInput
        multiline
        placeholder="Describe the issue..."
        placeholderTextColor="#999"
        style={styles.textarea}
        textAlignVertical="top"
      />

      {/* Bottom Icons */}

      <View style={styles.bottomIcons}>

        <TouchableOpacity>
          <Ionicons
            name="link-outline"
            size={22}
            color="#4CAF50"
          />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons
            name="image-outline"
            size={22}
            color="#4CAF50"
          />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons
            name="videocam-outline"
            size={22}
            color="#4CAF50"
          />
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#FFFFFF",

    paddingHorizontal: 20,

    paddingTop: 70,
  },

  topRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  reportButton: {
    backgroundColor: "#B8D7A3",

    borderRadius: 20,

    paddingHorizontal: 16,

    paddingVertical: 7,
  },

  reportText: {
    color: "#FFFFFF",

    fontSize: 11,

    fontWeight: "600",
  },

  dropdown: {
    width: 135,

    height: 30,

    marginTop: 50,

    backgroundColor: "#B8D7A3",

    borderRadius: 20,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingHorizontal: 12,
  },

  dropdownText: {
    color: "#4CAF50",

    fontSize: 10,
  },

  title: {
    marginTop: 30,

    fontSize: 48,

    color: "#4CAF50",

    fontWeight: "700",
  },

  subtitle: {
    color: "#88A07B",

    fontSize: 11,

    marginTop: 5,
  },

  input: {
    marginTop: 25,

    backgroundColor: "#EDF6E8",

    borderRadius: 14,

    height: 50,

    paddingHorizontal: 15,
  },

  textarea: {
    marginTop: 12,

    backgroundColor: "#EDF6E8",

    borderRadius: 14,

    height: 170,

    padding: 15,
  },

  bottomIcons: {
    position: "absolute",

    bottom: 70,

    width: "100%",

    flexDirection: "row",

    justifyContent: "center",

    gap: 35,

    alignSelf: "center",
  },
});