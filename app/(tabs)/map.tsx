import * as Location from "expo-location";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { Button } from "../../components/Button";
import { ThemedText } from "../../components/ThemedText";

// Dummy data for trash reports
const DUMMY_REPORTS = [
  {
    id: 1,
    title: "Overflowing Bin",
    description: "Veldstraat 45",
    coordinate: { latitude: 51.0543, longitude: 3.7174 },
  },
  {
    id: 2,
    title: "Plastic Waste",
    description: "Korenmarkt",
    coordinate: { latitude: 51.0549, longitude: 3.7223 },
  },
  {
    id: 3,
    title: "Discarded Electronics",
    description: "Graslei",
    coordinate: { latitude: 51.0536, longitude: 3.7198 },
  },
];

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-950">
        <ActivityIndicator
          size="large"
          className="color-zinc-900 dark:color-zinc-50"
        />
        <ThemedText className="mt-4">Locating...</ThemedText>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-950 p-6">
        <ThemedText variant="title" className="mb-2 text-center">
          Location Required
        </ThemedText>
        <ThemedText className="text-center mb-4">{errorMsg}</ThemedText>
        <Button label="Retry" onPress={() => setLoading(true)} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        showsUserLocation
        showsMyLocationButton
        initialRegion={{
          latitude: location?.coords.latitude || 51.0543,
          longitude: location?.coords.longitude || 3.7174,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {DUMMY_REPORTS.map((report) => (
          <Marker
            key={report.id}
            coordinate={report.coordinate}
            title={report.title}
            description={report.description}
          />
        ))}
      </MapView>

      {/* Overlay for report count or status */}
      <View className="absolute top-12 left-4 right-4 bg-white/90 dark:bg-zinc-900/90 p-4 rounded-xl shadow-sm">
        <ThemedText variant="subtitle" className="text-center">
          {DUMMY_REPORTS.length} Reports Nearby
        </ThemedText>
      </View>

      {/* Floating Action Button */}
      <View className="absolute bottom-6 right-6">
        <TouchableOpacity
          className="w-16 h-16 bg-zinc-900 dark:bg-zinc-50 rounded-full items-center justify-center shadow-lg"
          onPress={() => router.push("/report")}
          activeOpacity={0.8}
        >
          <Plus size={32} color={isDark ? "#09090b" : "#ffffff"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
