import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

export interface RouteStop {
  id: number;
  name: string;
  time: string;
  status: "completed" | "in_progress" | "pending";
  landmark?: string;
}

interface PhilippinesMapViewProps {
  truckName?: string;
  truckPlate?: string;
  activeBarangay?: string;
  nextStopName?: string;
  stops?: RouteStop[];
  onSelectStop?: (stop: RouteStop) => void;
  height?: number;
  showControls?: boolean;
}

const DEFAULT_STOPS: RouteStop[] = [
  { id: 1, name: "Barangay 1 Poblacion", time: "08:00 AM", status: "completed", landmark: "City Health Office" },
  { id: 2, name: "Barangay 2 Main Ave", time: "09:15 AM", status: "in_progress", landmark: "Commercial Junction" },
  { id: 3, name: "Barangay 3 Residential Zone", time: "10:30 AM", status: "pending", landmark: "Subdivision Gate 1" },
  { id: 4, name: "Barangay 4 Public Market", time: "11:45 AM", status: "pending", landmark: "Market Compactor Bay" },
];

export default function PhilippinesMapView({
  truckName = "Compactor Truck #04",
  truckPlate = "KAL-104",
  activeBarangay = "Barangay 2, Cagayan de Oro",
  nextStopName = "Barangay 3 Residential Zone",
  stops = DEFAULT_STOPS,
  onSelectStop,
  height = 360,
  showControls = true,
}: PhilippinesMapViewProps) {
  const [selectedStopId, setSelectedStopId] = useState<number>(2);
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");

  const handleStopPress = (stop: RouteStop) => {
    setSelectedStopId(stop.id);
    if (onSelectStop) onSelectStop(stop);
  };

  // Real OpenStreetMap tile for Cagayan de Oro City, Philippines center
  // High quality static map tile imagery
  const osmMapUri =
    mapType === "standard"
      ? "https://staticmap.openstreetmap.de/staticmap.php?center=8.4822,124.6472&zoom=14&size=600x400&maptype=mapnik"
      : "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80";

  return (
    <View style={styles.container}>
      {/* MAP VIEW CONTAINER */}
      <View style={[styles.mapWrapper, { height }]}>
        {/* REAL MAP TILE BACKGROUND */}
        <Image
          source={{ uri: osmMapUri }}
          style={styles.mapTileImage}
          resizeMode="cover"
        />

        {/* MAP OVERLAY GRADIENT & GRID ROADS */}
        <View style={styles.mapGridOverlay}>
          <Svg width="100%" height="100%" viewBox="0 0 360 300" preserveAspectRatio="none">
            {/* Real Street paths overlay */}
            <Path
              d="M20 180 Q90 140 160 150 T280 90 T340 70"
              stroke="#FFFFFF"
              strokeWidth="10"
              fill="none"
              opacity={0.85}
            />
            <Path
              d="M20 180 Q90 140 160 150 T280 90 T340 70"
              stroke="#43A047"
              strokeWidth="5"
              fill="none"
              strokeDasharray="8,5"
            />

            {/* Route Stops */}
            {/* Stop 1 (Completed) */}
            <Circle cx="50" cy="170" r="10" fill="#2E7D32" stroke="#FFFFFF" strokeWidth="2.5" />
            {/* Stop 2 (Active / Truck location) */}
            <Circle cx="160" cy="150" r="14" fill="#E53935" stroke="#FFFFFF" strokeWidth="3" />
            {/* Stop 3 (Upcoming) */}
            <Circle cx="260" cy="98" r="9" fill="#1976D2" stroke="#FFFFFF" strokeWidth="2.5" />
            {/* Stop 4 (Pending) */}
            <Circle cx="320" cy="74" r="9" fill="#757575" stroke="#FFFFFF" strokeWidth="2.5" />
          </Svg>
        </View>

        {/* ACTIVE TRUCK PIN WITH CALLOUT */}
        <View style={styles.truckPinContainer}>
          <View style={styles.pinCallout}>
            <View style={styles.pinDotLive} />
            <View style={{ flex: 1 }}>
              <Text style={styles.pinCalloutTitle} numberOfLines={1}>
                {truckName}
              </Text>
              <Text style={styles.pinCalloutSub} numberOfLines={1}>
                Next: {nextStopName}
              </Text>
            </View>
          </View>
          <View style={styles.truckBadge}>
            <MaterialCommunityIcons name="truck-fast" size={20} color="#FFFFFF" />
          </View>
        </View>

        {/* MAP CONTROLS & BADGES */}
        <View style={styles.topControlRow}>
          <View style={styles.locationTag}>
            <MaterialCommunityIcons name="map-marker-radius" size={14} color="#2E7D32" />
            <Text style={styles.locationTagText}>Cagayan de Oro City, PH</Text>
          </View>

          {showControls && (
            <TouchableOpacity
              style={styles.layerSwitch}
              activeOpacity={0.8}
              onPress={() => setMapType(mapType === "standard" ? "satellite" : "standard")}
            >
              <MaterialCommunityIcons
                name={mapType === "standard" ? "earth" : "map"}
                size={16}
                color="#2E7D32"
              />
              <Text style={styles.layerSwitchText}>
                {mapType === "standard" ? "Satellite" : "Standard"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* BOTTOM TELEMETRY BAR */}
        <View style={styles.telemetryBar}>
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryLabel}>TRUCK</Text>
            <Text style={styles.telemetryVal}>{truckPlate}</Text>
          </View>
          <View style={styles.telemetryDivider} />
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryLabel}>SPEED</Text>
            <Text style={styles.telemetryVal}>24 km/h</Text>
          </View>
          <View style={styles.telemetryDivider} />
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryLabel}>STATUS</Text>
            <Text style={[styles.telemetryVal, { color: "#2E7D32" }]}>Collecting</Text>
          </View>
        </View>
      </View>

      {/* ROUTE STOPS CHECKLIST */}
      <View style={styles.stopsSection}>
        <View style={styles.stopsHeaderRow}>
          <Text style={styles.stopsHeaderTitle}>Route Stops Checklist</Text>
          <Text style={styles.stopsHeaderSub}>
            {stops.filter((s) => s.status === "completed").length}/{stops.length} Complete
          </Text>
        </View>

        <View style={styles.stopsCard}>
          {stops.map((stop, index) => {
            const isSelected = selectedStopId === stop.id;
            const isCompleted = stop.status === "completed";
            const isInProgress = stop.status === "in_progress";

            const badgeBg = isCompleted ? "#E8F8EE" : isInProgress ? "#FFF3E0" : "#F5F5F5";
            const badgeColor = isCompleted ? "#2E7D32" : isInProgress ? "#E65100" : "#757575";

            return (
              <TouchableOpacity
                key={stop.id}
                style={[
                  styles.stopRow,
                  isSelected && styles.stopRowSelected,
                  index === stops.length - 1 && { borderBottomWidth: 0 },
                ]}
                activeOpacity={0.8}
                onPress={() => handleStopPress(stop)}
              >
                {/* Node indicator */}
                <View style={styles.nodeWrapper}>
                  <View
                    style={[
                      styles.nodeCircle,
                      isCompleted && styles.nodeCircleCompleted,
                      isInProgress && styles.nodeCircleActive,
                    ]}
                  >
                    {isCompleted ? (
                      <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />
                    ) : (
                      <Text
                        style={[
                          styles.nodeNumber,
                          (isCompleted || isInProgress) && { color: "#FFFFFF" },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  {index < stops.length - 1 && (
                    <View
                      style={[
                        styles.connectorLine,
                        isCompleted && styles.connectorLineDone,
                      ]}
                    />
                  )}
                </View>

                {/* Stop info */}
                <View style={styles.stopTextContainer}>
                  <Text style={[styles.stopName, isSelected && styles.stopNameSelected]}>
                    {stop.name}
                  </Text>
                  {stop.landmark && (
                    <Text style={styles.stopLandmark}>{stop.landmark}</Text>
                  )}
                </View>

                {/* Time & status badge */}
                <View style={styles.stopRight}>
                  <Text style={styles.stopTime}>{stop.time}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                    <Text style={[styles.statusBadgeText, { color: badgeColor }]}>
                      {isCompleted ? "Cleared" : isInProgress ? "Active" : "Upcoming"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  mapWrapper: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E8F0E6",
    borderWidth: 1,
    borderColor: "#DCE7D9",
    shadowColor: "#1A3816",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  mapTileImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  mapGridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  truckPinContainer: {
    position: "absolute",
    top: "42%",
    left: "38%",
    alignItems: "center",
    zIndex: 10,
  },
  pinCallout: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 6,
    maxWidth: 180,
  },
  pinDotLive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2E7D32",
    marginRight: 6,
  },
  pinCalloutTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E331B",
  },
  pinCalloutSub: {
    fontSize: 10,
    color: "#5C7558",
  },
  truckBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  topControlRow: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5EFE2",
  },
  locationTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1E331B",
    marginLeft: 4,
  },
  layerSwitch: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5EFE2",
  },
  layerSwitchText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2E7D32",
    marginLeft: 4,
  },
  telemetryBar: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5EFE2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  telemetryItem: {
    flex: 1,
    alignItems: "center",
  },
  telemetryLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#8FA58A",
    letterSpacing: 0.5,
  },
  telemetryVal: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E331B",
    marginTop: 1,
  },
  telemetryDivider: {
    width: 1,
    height: 22,
    backgroundColor: "#E0EAE0",
  },
  stopsSection: {
    marginTop: 18,
  },
  stopsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  stopsHeaderTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E331B",
  },
  stopsHeaderSub: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E7D32",
  },
  stopsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#EDF3EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  stopRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F6F1",
  },
  stopRowSelected: {
    backgroundColor: "#F7FAF6",
    borderRadius: 10,
  },
  nodeWrapper: {
    alignItems: "center",
    width: 28,
    marginRight: 10,
  },
  nodeCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#EEF3ED",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#C5D8C3",
  },
  nodeCircleCompleted: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  nodeCircleActive: {
    backgroundColor: "#E65100",
    borderColor: "#E65100",
  },
  nodeNumber: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6B8468",
  },
  connectorLine: {
    width: 2,
    height: 18,
    backgroundColor: "#DCE5DB",
    marginTop: 2,
  },
  connectorLineDone: {
    backgroundColor: "#2E7D32",
  },
  stopTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  stopName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E331B",
  },
  stopNameSelected: {
    color: "#2E7D32",
  },
  stopLandmark: {
    fontSize: 11,
    color: "#7A9277",
    marginTop: 2,
  },
  stopRight: {
    alignItems: "flex-end",
  },
  stopTime: {
    fontSize: 11,
    fontWeight: "600",
    color: "#5C7558",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
});
