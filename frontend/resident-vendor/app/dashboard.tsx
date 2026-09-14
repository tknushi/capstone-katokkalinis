import { useRouter } from "expo-router";
import {
  BarChart3,
  Calendar,
  FileText,
  Home,
  MapPin,
  Plus,
  User,
} from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Dashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      {/* =========================
          TOP GREEN HEADER
      ========================== */}
      <View style={styles.header}>

        <View>
          <Text style={styles.welcomeText}>
            Welcome, Resident!
          </Text>

          <Text style={styles.subtitle}>
            Kakatok, Lilinis, Gagaan ang Buhay
          </Text>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => {
            // Profile page can be added later
          }}
        >
          <User size={22} color="#4CAF50" />
        </TouchableOpacity>

      </View>


      {/* =========================
          WHITE MAIN CONTENT
      ========================== */}
      <View style={styles.content}>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* =========================
              LOCATION CARD
          ========================== */}
          <View style={styles.locationCard}>

            <View style={styles.locationIcon}>
              <MapPin
                size={22}
                color="#4CAF50"
              />
            </View>

            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>
                Your Location
              </Text>

              <Text style={styles.locationText}>
                Barangay 4
              </Text>

              <Text style={styles.locationSubtext}>
                Cagayan de Oro City
              </Text>
            </View>

          </View>


          {/* =========================
              QUICK ACTION TITLE
          ========================== */}
          <Text style={styles.sectionTitle}>
            Quick Actions
          </Text>


          {/* =========================
              REPORT
          ========================== */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/report")}
          >

            <View style={styles.actionIcon}>
              <FileText
                size={25}
                color="#4CAF50"
              />
            </View>

            <View style={styles.actionInfo}>

              <Text style={styles.actionTitle}>
                Report an Issue
              </Text>

              <Text style={styles.actionDescription}>
                Report garbage collection problems
                or sanitation concerns.
              </Text>

            </View>

          </TouchableOpacity>


          {/* =========================
              SCHEDULE
          ========================== */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/schedule")}
          >

            <View style={styles.actionIcon}>
              <Calendar
                size={25}
                color="#4CAF50"
              />
            </View>

            <View style={styles.actionInfo}>

              <Text style={styles.actionTitle}>
                Collection Schedule
              </Text>

              <Text style={styles.actionDescription}>
                Check the garbage collection
                schedule in your barangay.
              </Text>

            </View>

          </TouchableOpacity>


          {/* =========================
              REPORT FEED
          ========================== */}
          <Text style={styles.sectionTitle}>
            Recent Reports
          </Text>


          <View style={styles.reportCard}>

            <View style={styles.reportHeader}>

              <View style={styles.reportAvatar}>
                <User
                  size={17}
                  color="#4CAF50"
                />
              </View>

              <View style={styles.reportUserInfo}>

                <Text style={styles.reportName}>
                  Jane Doe
                </Text>

                <Text style={styles.reportTime}>
                  1 hr ago
                </Text>

              </View>

            </View>

            <Text style={styles.reportText}>
              Garbage collection issue reported
              near the public market.
            </Text>

          </View>


          <View style={styles.reportCard}>

            <View style={styles.reportHeader}>

              <View style={styles.reportAvatar}>
                <User
                  size={17}
                  color="#4CAF50"
                />
              </View>

              <View style={styles.reportUserInfo}>

                <Text style={styles.reportName}>
                  John Doe
                </Text>

                <Text style={styles.reportTime}>
                  2 hrs ago
                </Text>

              </View>

            </View>

            <Text style={styles.reportText}>
              Missed garbage collection reported
              in Barangay 4.
            </Text>

          </View>


          {/* Extra space for bottom navigation */}
          <View style={{ height: 80 }} />

        </ScrollView>

      </View>


      {/* =========================
          FLOATING REPORT BUTTON
      ========================== */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/post")}
      >
        <Plus
          size={30}
          color="#FFFFFF"
        />
      </TouchableOpacity>


      {/* =========================
          BOTTOM NAVIGATION
      ========================== */}
      <View style={styles.bottomNav}>

        {/* HOME */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {}}
        >
          <Home
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.navText}>
            Home
          </Text>
        </TouchableOpacity>


        {/* REPORT */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/report")}
        >
          <BarChart3
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.navText}>
            Report
          </Text>
        </TouchableOpacity>


        {/* SPACE FOR FAB */}
        <View style={styles.navSpace} />


        {/* SCHEDULE */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/schedule")}
        >
          <Calendar
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.navText}>
            Schedule
          </Text>
        </TouchableOpacity>


        {/* PROFILE */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {}}
        >
          <User
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.navText}>
            Profile
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}


/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

  /* =========================
     MAIN CONTAINER
  ========================== */

  container: {
    flex: 1,
    backgroundColor: "#7ED957",
  },


  /* =========================
     HEADER
  ========================== */

  header: {
    height: 170,

    paddingTop: 55,
    paddingHorizontal: 25,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  welcomeText: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 6,

    color: "#FFFFFF",

    fontSize: 12,

    letterSpacing: 0.5,
  },


  /* =========================
     PROFILE BUTTON
  ========================== */

  profileButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",
  },


  /* =========================
     WHITE CONTENT
  ========================== */

  content: {
    flex: 1,

    backgroundColor: "#F8FAF6",

    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,

    overflow: "hidden",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },


  /* =========================
     LOCATION CARD
  ========================== */

  locationCard: {
    backgroundColor: "rgba(201, 247, 182, 0.63)",

    borderRadius: 12,

    padding: 15,

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 22,
  },

  locationIcon: {
    width: 45,
    height: 45,

    borderRadius: 23,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",
  },

  locationInfo: {
    marginLeft: 12,
  },

  locationLabel: {
    color: "#588743",

    fontSize: 11,
  },

  locationText: {
    color: "#4CAF50",

    fontSize: 18,

    fontWeight: "700",

    marginTop: 2,
  },

  locationSubtext: {
    color: "#588743",

    fontSize: 10,

    marginTop: 2,
  },


  /* =========================
     SECTION TITLE
  ========================== */

  sectionTitle: {
    color: "#4CAF50",

    fontSize: 20,

    fontWeight: "700",

    marginBottom: 12,

    marginTop: 4,
  },


  /* =========================
     ACTION CARDS
  ========================== */

  actionCard: {
    width: "100%",

    minHeight: 105,

    backgroundColor: "rgba(201, 247, 182, 0.63)",

    borderRadius: 12,

    padding: 16,

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 12,
  },

  actionIcon: {
    width: 48,
    height: 48,

    borderRadius: 24,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",
  },

  actionInfo: {
    flex: 1,

    marginLeft: 14,
  },

  actionTitle: {
    color: "#4CAF50",

    fontSize: 17,

    fontWeight: "700",
  },

  actionDescription: {
    color: "#588743",

    fontSize: 11,

    lineHeight: 16,

    marginTop: 5,

    paddingRight: 5,
  },


  /* =========================
     REPORT CARD
  ========================== */

  reportCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 12,

    padding: 15,

    marginBottom: 12,
  },

  reportHeader: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 10,
  },

  reportAvatar: {
    width: 34,
    height: 34,

    borderRadius: 17,

    backgroundColor: "#E8F5E9",

    justifyContent: "center",
    alignItems: "center",
  },

  reportUserInfo: {
    marginLeft: 9,
  },

  reportName: {
    color: "#4CAF50",

    fontSize: 13,

    fontWeight: "700",
  },

  reportTime: {
    color: "#AAAAAA",

    fontSize: 9,

    marginTop: 2,
  },

  reportText: {
    color: "#666666",

    fontSize: 11,

    lineHeight: 17,
  },


  /* =========================
     FLOATING ACTION BUTTON
  ========================== */

  fab: {
    position: "absolute",

    bottom: 37,

    alignSelf: "center",

    width: 62,
    height: 62,

    borderRadius: 31,

    backgroundColor: "#4CAF50",

    justifyContent: "center",
    alignItems: "center",

    elevation: 8,

    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },


  /* =========================
     BOTTOM NAVIGATION
  ========================== */

  bottomNav: {
    height: 65,

    backgroundColor: "#7ED957",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-around",

    paddingHorizontal: 10,
  },

  navItem: {
    width: 65,

    alignItems: "center",

    justifyContent: "center",
  },

  navText: {
    color: "#FFFFFF",

    fontSize: 9,

    marginTop: 3,
  },

  navSpace: {
    width: 65,
  },

});