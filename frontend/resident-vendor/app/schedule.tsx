import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const isSmallScreen = width < 360;

type ScheduleItem = {
  day: string;
  time: string;
};

const barangays = [
  "Barangay 1",
  "Barangay 2",
  "Barangay 3",
  "Barangay 4",
  "Barangay 5",
  "Barangay 6",
];

const schedules: Record<string, ScheduleItem[]> = {
  "Barangay 1": [
    { day: "Monday", time: "8:00 AM" },
    { day: "Wednesday", time: "8:00 AM" },
    { day: "Friday", time: "8:00 AM" },
  ],

  "Barangay 2": [
    { day: "Tuesday", time: "9:00 AM" },
    { day: "Thursday", time: "9:00 AM" },
    { day: "Saturday", time: "9:00 AM" },
  ],

  "Barangay 3": [
    { day: "Monday", time: "8:30 AM" },
    { day: "Wednesday", time: "8:30 AM" },
    { day: "Friday", time: "8:30 AM" },
  ],

  "Barangay 4": [
    { day: "Monday", time: "9:00 AM" },
    { day: "Wednesday", time: "9:00 AM" },
    { day: "Friday", time: "9:00 AM" },
  ],

  "Barangay 5": [
    { day: "Tuesday", time: "8:30 AM" },
    { day: "Thursday", time: "8:30 AM" },
    { day: "Saturday", time: "8:30 AM" },
  ],

  "Barangay 6": [
    { day: "Monday", time: "10:00 AM" },
    { day: "Wednesday", time: "10:00 AM" },
    { day: "Friday", time: "10:00 AM" },
  ],
};

export default function Schedule() {
  const [selectedBarangay, setSelectedBarangay] =
    useState("Barangay 4");

  const [dropdownOpen, setDropdownOpen] =
    useState(false);

  const currentSchedule =
    schedules[selectedBarangay] || [];

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        <Text
          style={[
            styles.headerTitle,
            isSmallScreen && styles.headerTitleSmall,
          ]}
        >
          Collection Schedule
        </Text>

        <Text style={styles.headerSubtitle}>
          Check the garbage collection schedule
          in your barangay.
        </Text>

      </View>

      {/* CONTENT */}
      <View style={styles.content}>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* BARANGAY SELECTOR */}
          <Text style={styles.label}>
            Select a barangay
          </Text>

          <TouchableOpacity
            style={styles.dropdown}
            activeOpacity={0.8}
            onPress={() =>
              setDropdownOpen(!dropdownOpen)
            }
          >

            <View style={styles.dropdownLeft}>

              <Ionicons
                name="location-outline"
                size={20}
                color="#4CAF50"
              />

              <Text style={styles.dropdownText}>
                {selectedBarangay}
              </Text>

            </View>

            <Ionicons
              name={
                dropdownOpen
                  ? "chevron-up"
                  : "chevron-down"
              }
              size={20}
              color="#4CAF50"
            />

          </TouchableOpacity>

          {/* DROPDOWN */}
          {dropdownOpen && (
            <View style={styles.dropdownMenu}>

              {barangays.map((barangay) => (

                <TouchableOpacity
                  key={barangay}
                  style={[
                    styles.dropdownItem,
                    selectedBarangay === barangay &&
                      styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setSelectedBarangay(barangay);
                    setDropdownOpen(false);
                  }}
                >

                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedBarangay === barangay &&
                        styles.dropdownItemTextActive,
                    ]}
                  >
                    {barangay}
                  </Text>

                  {selectedBarangay === barangay && (
                    <Ionicons
                      name="checkmark"
                      size={19}
                      color="#4CAF50"
                    />
                  )}

                </TouchableOpacity>

              ))}

            </View>
          )}

          {/* SCHEDULE CARD */}
          <View style={styles.scheduleCard}>

            <View style={styles.calendarIcon}>

              <Ionicons
                name="calendar-outline"
                size={27}
                color="#4CAF50"
              />

            </View>

            <View style={styles.scheduleText}>

              <Text style={styles.scheduleTitle}>
                Collection Schedule
              </Text>

              <Text style={styles.scheduleBarangay}>
                {selectedBarangay}
              </Text>

              <Text style={styles.scheduleDescription}>
                Your scheduled garbage collection days
              </Text>

            </View>

          </View>

          {/* TABLE TITLE */}
          <Text style={styles.sectionTitle}>
            Weekly Schedule
          </Text>

          {/* TABLE */}
          <View style={styles.table}>

            {/* TABLE HEADER */}
            <View style={styles.tableHeader}>

              <View style={styles.dayColumn}>
                <Text style={styles.tableHeaderText}>
                  Day
                </Text>
              </View>

              <View style={styles.timeColumn}>
                <Text style={styles.tableHeaderText}>
                  Pick-up Time
                </Text>
              </View>

            </View>

            {/* TABLE ROWS */}
            {currentSchedule.map(
              (item, index) => (

                <View
                  key={`${item.day}-${index}`}
                  style={[
                    styles.tableRow,
                    index === currentSchedule.length - 1 &&
                      styles.lastTableRow,
                  ]}
                >

                  <View style={styles.dayColumn}>

                    <View style={styles.dayIcon}>

                      <Ionicons
                        name="calendar"
                        size={16}
                        color="#4CAF50"
                      />

                    </View>

                    <Text style={styles.dayText}>
                      {item.day}
                    </Text>

                  </View>

                  <View style={styles.timeColumn}>

                    <View style={styles.timeBadge}>

                      <Ionicons
                        name="time-outline"
                        size={15}
                        color="#4CAF50"
                      />

                      <Text style={styles.timeText}>
                        {item.time}
                      </Text>

                    </View>

                  </View>

                </View>

              )
            )}

          </View>

          {/* REMINDER */}
          <View style={styles.reminder}>

            <View style={styles.reminderIcon}>

              <Ionicons
                name="notifications-outline"
                size={22}
                color="#4CAF50"
              />

            </View>

            <View style={styles.reminderContent}>

              <Text style={styles.reminderTitle}>
                Collection Reminder
              </Text>

              <Text style={styles.reminderText}>
                Please place your garbage outside
                before the scheduled collection time.
              </Text>

            </View>

          </View>

          {/* IMPORTANT NOTE */}
          <View style={styles.note}>

            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#777"
            />

            <Text style={styles.noteText}>
              Collection schedules may change due to
              holidays, weather conditions, or other
              sanitation activities.
            </Text>

          </View>

        </ScrollView>

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
    paddingTop: 65,
    paddingHorizontal: 25,
    paddingBottom: 25,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  headerTitleSmall: {
    fontSize: 24,
  },

  headerSubtitle: {
    color: "#FFFFFF",
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 330,
  },

  content: {
    flex: 1,
    backgroundColor: "#F6F8F3",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    overflow: "hidden",
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 35,
  },

  label: {
    color: "#4CAF50",
    marginBottom: 7,
    fontSize: 13,
    fontWeight: "700",
  },

  dropdown: {
    minHeight: 52,
    backgroundColor: "#DDF5D2",
    borderRadius: 12,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#C8E8BA",
  },

  dropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  dropdownText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
  },

  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E1E1E1",
  },

  dropdownItem: {
    minHeight: 45,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  dropdownItemActive: {
    backgroundColor: "#EDF6E8",
  },

  dropdownItemText: {
    fontSize: 13,
    color: "#555",
  },

  dropdownItemTextActive: {
    color: "#4CAF50",
    fontWeight: "700",
  },

  scheduleCard: {
    backgroundColor: "#DDF5D2",
    borderRadius: 14,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#C8E8BA",
  },

  calendarIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  scheduleText: {
    flex: 1,
    marginLeft: 13,
  },

  scheduleTitle: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },

  scheduleBarangay: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4CAF50",
    marginTop: 2,
  },

  scheduleDescription: {
    fontSize: 11,
    color: "#6B8063",
    marginTop: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },

  table: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  tableHeader: {
    minHeight: 45,
    backgroundColor: "#7ED957",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  tableHeaderText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  tableRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  lastTableRow: {
    borderBottomWidth: 0,
  },

  dayColumn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  timeColumn: {
    flex: 1,
    alignItems: "flex-end",
  },

  dayIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#EDF6E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 9,
  },

  dayText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
  },

  timeBadge: {
    minHeight: 32,
    backgroundColor: "#EDF6E8",
    borderRadius: 16,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  timeText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "700",
    marginLeft: 5,
  },

  reminder: {
    backgroundColor: "#DDF5D2",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#C8E8BA",
  },

  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  reminderContent: {
    flex: 1,
    marginLeft: 11,
  },

  reminderTitle: {
    color: "#4CAF50",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 3,
  },

  reminderText: {
    color: "#5F7558",
    fontSize: 11,
    lineHeight: 17,
  },

  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 5,
    marginTop: 3,
  },

  noteText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 10,
    color: "#777",
    lineHeight: 15,
  },

});