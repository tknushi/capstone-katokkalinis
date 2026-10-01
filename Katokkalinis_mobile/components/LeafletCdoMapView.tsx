import React, { useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { BarangayItem } from "../services/driver";

interface LeafletCdoMapViewProps {
  height?: number;
  barangays?: BarangayItem[];
  selectedBarangay?: string;
  onSelectBarangay?: (barangayName: string, barangayId?: number) => void;
  activeTruckPlate?: string;
}

export default function LeafletCdoMapView({
  height = 360,
  barangays = [],
  selectedBarangay,
  onSelectBarangay,
  activeTruckPlate = "KAL-104",
}: LeafletCdoMapViewProps) {
  const [activeRouteFilter, setActiveRouteFilter] = useState<number>(0); // 0 = all, 1..4
  const webViewRef = useRef<WebView>(null);

  // Generate Leaflet HTML document centered strictly on Cagayan de Oro, Northern Mindanao, Philippines
  const generateLeafletHtml = () => {
    // Generate barangay markers array
    const barangayMarkers = Array.from({ length: 40 }, (_, i) => {
      const num = i + 1;
      const routeNum = Math.ceil(num / 10);
      const truckPlate = `KAL-${100 + routeNum}`;

      // Downtown Cagayan de Oro real street grid coordinates
      // Lat range: 8.4710 to 8.4875, Lng range: 124.6410 to 124.6565
      const row = Math.floor(i / 5);
      const col = i % 5;
      const lat = 8.4720 + row * 0.0022 + ((col % 2 === 0) ? 0.0004 : -0.0004);
      const lng = 124.6420 + col * 0.0031 + ((row % 2 === 0) ? 0.0003 : -0.0003);

      return {
        id: num,
        name: `Barangay ${num}`,
        number: num,
        lat: Number(lat.toFixed(5)),
        lng: Number(lng.toFixed(5)),
        route: routeNum,
        truck: truckPlate,
      };
    });

    const routeColors: Record<number, string> = {
      1: "#2E7D32", // Green
      2: "#1976D2", // Blue
      3: "#F57C00", // Orange
      4: "#7B1FA2", // Purple
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Cagayan de Oro Garbage Truck Routes</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #e5e3df; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .custom-brgy-pin {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 800;
      border: 2px solid #fff;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      cursor: pointer;
    }
    .custom-truck-pin {
      background: #2E7D32;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid #fff;
      box-shadow: 0 3px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.6); }
      70% { box-shadow: 0 0 0 10px rgba(46, 125, 50, 0); }
      100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
    }
    .leaflet-popup-content-wrapper {
      border-radius: 12px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.18);
      padding: 0;
      overflow: hidden;
    }
    .popup-box {
      padding: 12px 14px;
    }
    .popup-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 6px;
      margin-bottom: 4px;
    }
    .popup-title {
      font-size: 14px;
      font-weight: 800;
      color: #1a2a1a;
      margin-bottom: 4px;
    }
    .popup-info {
      font-size: 11px;
      color: #556655;
      margin-bottom: 8px;
    }
    .popup-btn {
      display: block;
      width: 100%;
      background: #2E7D32;
      color: #fff;
      text-align: center;
      padding: 6px 10px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      border: none;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // Strict bounding box for Cagayan de Oro City & Mindanao, Philippines
    var cdoBounds = L.latLngBounds(
      L.latLng(8.3800, 124.5500), // Southwest (Mindanao / CDO)
      L.latLng(8.5600, 124.7200)  // Northeast (Mindanao / CDO)
    );

    // Initialize Map centered on Cagayan de Oro downtown
    var map = L.map('map', {
      center: [8.4822, 124.6472],
      zoom: 14,
      minZoom: 12,
      maxZoom: 18,
      maxBounds: cdoBounds,
      maxBoundsViscosity: 0.95
    });

    // Real OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap | CDO City Sanitation',
      maxZoom: 19
    }).addTo(map);

    var barangays = ${JSON.stringify(barangayMarkers)};
    var routeColors = ${JSON.stringify(routeColors)};
    var activeFilter = ${activeRouteFilter};

    // Store layers
    var markerLayer = L.layerGroup().addTo(map);
    var routeLinesLayer = L.layerGroup().addTo(map);

    function notifyReactNative(action, data) {
      var msg = JSON.stringify({ action: action, data: data });
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(msg);
      } else if (window.parent && window.parent.postMessage) {
        window.parent.postMessage(msg, '*');
      }
    }

    function renderMap(filterRoute) {
      markerLayer.clearLayers();
      routeLinesLayer.clearLayers();

      // Render Route Polylines
      for (var r = 1; r <= 4; r++) {
        if (filterRoute === 0 || filterRoute === r) {
          var routeBrgys = barangays.filter(function(b) { return b.route === r; });
          var coords = routeBrgys.map(function(b) { return [b.lat, b.lng]; });
          
          L.polyline(coords, {
            color: routeColors[r],
            weight: (filterRoute === r) ? 5 : 3,
            opacity: 0.85,
            dashArray: (filterRoute === r) ? null : '6, 6'
          }).addTo(routeLinesLayer);
        }
      }

      // Render Barangay Markers 1 to 40
      barangays.forEach(function(b) {
        if (filterRoute === 0 || filterRoute === b.route) {
          var color = routeColors[b.route];
          
          var icon = L.divIcon({
            className: '',
            html: '<div class="custom-brgy-pin" style="background-color: ' + color + ';">' + b.number + '</div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          var marker = L.marker([b.lat, b.lng], { icon: icon }).addTo(markerLayer);

          var popupContent = 
            '<div class="popup-box">' +
              '<span class="popup-badge" style="background: ' + color + '15; color: ' + color + ';">Route ' + b.route + ' • ' + b.truck + '</span>' +
              '<div class="popup-title">' + b.name + '</div>' +
              '<div class="popup-info">Cagayan de Oro City • Sector ' + b.number + '</div>' +
              '<button class="popup-btn" style="background:' + color + ';" onclick="selectBrgy(' + b.id + ', \\'' + b.name + '\\')">Record Collection</button>' +
            '</div>';

          marker.bindPopup(popupContent);
        }
      });

      // Active Truck Pin
      var activeTruckLocation = [8.4835, 124.6480]; // Stop 2 / Central CDO
      var truckIcon = L.divIcon({
        className: '',
        html: '<div class="custom-truck-pin"><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      var truckMarker = L.marker(activeTruckLocation, { icon: truckIcon }).addTo(markerLayer);
      truckMarker.bindPopup(
        '<div class="popup-box">' +
          '<span class="popup-badge" style="background:#E8F8EE; color:#2E7D32;">ACTIVE DISPATCH</span>' +
          '<div class="popup-title">${activeTruckPlate} Live</div>' +
          '<div class="popup-info">Barangay 2 Main Ave, Cagayan de Oro</div>' +
        '</div>'
      );
    }

    window.selectBrgy = function(id, name) {
      notifyReactNative('select_barangay', { id: id, name: name });
    };

    renderMap(activeFilter);
  </script>
</body>
</html>
    `;
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.action === "select_barangay" && data.data && onSelectBarangay) {
        onSelectBarangay(data.data.name, data.data.id);
      }
    } catch (e) {
      console.warn("Leaflet message parse error:", e);
    }
  };

  return (
    <View style={styles.container}>
      {/* ROUTE TABS (Barangay 1 to 40 Garbage Truck Routes) */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, activeRouteFilter === 0 && styles.filterChipActive]}
          onPress={() => setActiveRouteFilter(0)}
        >
          <Text style={[styles.filterChipText, activeRouteFilter === 0 && styles.filterChipTextActive]}>
            All Brgy 1-40
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeRouteFilter === 1 && [styles.filterChipActive, { backgroundColor: "#2E7D32" }]]}
          onPress={() => setActiveRouteFilter(1)}
        >
          <Text style={[styles.filterChipText, activeRouteFilter === 1 && styles.filterChipTextActive]}>
            R1: 1-10 (KAL-101)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeRouteFilter === 2 && [styles.filterChipActive, { backgroundColor: "#1976D2" }]]}
          onPress={() => setActiveRouteFilter(2)}
        >
          <Text style={[styles.filterChipText, activeRouteFilter === 2 && styles.filterChipTextActive]}>
            R2: 11-20 (KAL-102)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeRouteFilter === 3 && [styles.filterChipActive, { backgroundColor: "#F57C00" }]]}
          onPress={() => setActiveRouteFilter(3)}
        >
          <Text style={[styles.filterChipText, activeRouteFilter === 3 && styles.filterChipTextActive]}>
            R3: 21-30 (KAL-103)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeRouteFilter === 4 && [styles.filterChipActive, { backgroundColor: "#7B1FA2" }]]}
          onPress={() => setActiveRouteFilter(4)}
        >
          <Text style={[styles.filterChipText, activeRouteFilter === 4 && styles.filterChipTextActive]}>
            R4: 31-40 (KAL-104)
          </Text>
        </TouchableOpacity>
      </View>

      {/* LEAFLET OPENSTREETMAP CONTAINER */}
      <View style={[styles.mapContainer, { height }]}>
        {Platform.OS === "web" ? (
          <iframe
            srcDoc={generateLeafletHtml()}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Leaflet Cagayan de Oro Map"
          />
        ) : (
          <WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{ html: generateLeafletHtml() }}
            style={styles.webView}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scrollEnabled={false}
          />
        )}

        {/* MAP LOCATION BADGE */}
        <View style={styles.cdoBadge}>
          <MaterialCommunityIcons name="map-marker" size={14} color="#2E7D32" />
          <Text style={styles.cdoBadgeText}>Cagayan de Oro (Mindanao, PH)</Text>
        </View>
      </View>

      <Text style={styles.hintText}>
        Tap any Barangay pin (1-40) on OpenStreetMap to preview route stops & log collections.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F0F4EF",
    borderWidth: 1,
    borderColor: "#D8E6D7",
  },
  filterChipActive: {
    backgroundColor: "#1E331B",
    borderColor: "transparent",
  },
  filterChipText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4A6148",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  mapContainer: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#DCE7DB",
    backgroundColor: "#E5E3DF",
    position: "relative",
  },
  webView: {
    flex: 1,
    backgroundColor: "#E5E3DF",
  },
  cdoBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C5EBD2",
    zIndex: 10,
  },
  cdoBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1E331B",
  },
  hintText: {
    fontSize: 10,
    color: "#688264",
    marginTop: 6,
    fontStyle: "italic",
  },
});
