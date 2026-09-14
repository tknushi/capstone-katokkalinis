import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Report() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      <View style={styles.whiteContainer}>

        <Text style={styles.title}>
          Create a report
        </Text>

        <Text style={styles.subtitle}>
          To report issues or concerns to help admins
          monitor and improve waste collection services.
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
        >

          {/* Post 1 */}

          <View style={styles.post}>

            <View style={styles.userRow}>

              <Image
                source={{
                  uri: "https://i.pravatar.cc/100",
                }}
                style={styles.avatar}
              />

              <Text style={styles.name}>
                Jane Doe
              </Text>

              <Text style={styles.time}>
                1 hr ago
              </Text>

            </View>

            <Image
              source={{
                uri:
                  "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b",
              }}
              style={styles.postImage}
            />

          </View>

          {/* Post 2 */}

          <View style={styles.post}>

            <View style={styles.userRow}>

              <Image
                source={{
                  uri: "https://i.pravatar.cc/101",
                }}
                style={styles.avatar}
              />

              <Text style={styles.name}>
                John Doe
              </Text>

              <Text style={styles.time}>
                2 weeks ago
              </Text>

            </View>

            <Text style={styles.paragraph}>
              Lorem ipsum dolor sit amet, consectetur
              adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </Text>

          </View>

          {/* Post 3 */}

          <View style={styles.post}>

            <View style={styles.userRow}>

              <Image
                source={{
                  uri: "https://i.pravatar.cc/102",
                }}
                style={styles.avatar}
              />

              <Text style={styles.name}>
                Jane Doe
              </Text>

              <Text style={styles.time}>
                3 months ago
              </Text>

            </View>

            <Text style={styles.paragraph}>
              Lorem ipsum dolor sit amet, consectetur
              adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </Text>

          </View>

        </ScrollView>

      </View>

      {/* Bottom Navigation */}

      <View style={styles.navbar}>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            router.push("/dashboard")
          }
        >
          <Ionicons
            name="home-outline"
            size={20}
            color="#fff"
          />

          <Text style={styles.navText}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
        >
          <Ionicons
            name="document-text-outline"
            size={20}
            color="#fff"
          />

          <Text style={styles.navText}>
            Report
          </Text>
        </TouchableOpacity>

        <View style={{ width: 70 }} />

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            router.push("/schedule")
          }
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color="#fff"
          />

          <Text style={styles.navText}>
            Schedule
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
        >
          <Ionicons
            name="person-outline"
            size={20}
            color="#fff"
          />

          <Text style={styles.navText}>
            Profile
          </Text>
        </TouchableOpacity>

      </View>

      {/* Floating Button */}

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          router.push("/post")
        }
      >
        <Ionicons
          name="add"
          size={35}
          color="#fff"
        />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#7ED957",
  },

  whiteContainer: {
    flex: 1,

    backgroundColor: "#F8F8F8",

    marginTop: 60,

    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,

    padding: 18,
  },

  title: {
    fontSize: 32,

    fontWeight: "700",

    color: "#4CAF50",
  },

  subtitle: {
    fontSize: 11,

    color: "#6A6A6A",

    marginTop: 8,

    marginBottom: 20,
  },

  post: {
    marginBottom: 20,

    borderBottomWidth: 1,

    borderBottomColor: "#E5E5E5",

    paddingBottom: 15,
  },

  userRow: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 10,
  },

  avatar: {
    width: 28,

    height: 28,

    borderRadius: 14,
  },

  name: {
    marginLeft: 10,

    fontWeight: "600",

    color: "#4CAF50",
  },

  time: {
    marginLeft: 12,

    color: "#AAA",

    fontSize: 10,
  },

  postImage: {
    width: "100%",

    height: 190,

    borderRadius: 10,
  },

  paragraph: {
    color: "#666",

    fontSize: 11,

    lineHeight: 18,
  },

  navbar: {
    height: 55,

    backgroundColor: "#7ED957",

    flexDirection: "row",

    justifyContent: "space-around",

    alignItems: "center",
  },

  navItem: {
    alignItems: "center",
  },

  navText: {
    color: "#fff",

    fontSize: 10,
  },

  fab: {
    position: "absolute",

    bottom: 25,

    alignSelf: "center",

    width: 62,

    height: 62,

    borderRadius: 31,

    backgroundColor: "#4CAF50",

    justifyContent: "center",

    alignItems: "center",

    elevation: 10,
  },
});