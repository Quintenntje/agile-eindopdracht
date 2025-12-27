import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
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
import { getThemeClass, useTheme } from "../../lib/contexts/ThemeContext";
import { supabase } from "../../lib/utils/supabase";

type TrashReport = {
  id: string;
  description: string | null;
  location_name: string | null;
  lat: number;
  long: number;
  created_at: string;
};

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<TrashReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { theme } = useTheme();
  const themeClass = getThemeClass(theme);

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

  const fetchReports = useCallback(async () => {
    setLoadingReports(true);
    try {
      const { data, error } = await supabase
        .from("recorded_trash")
        .select("id, description, location_name, lat, long, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );

  if (loading) {
    return (
      <View
        className={`flex-1 items-center justify-center bg-white dark:bg-theme-secondary ${themeClass}`}
      >
        <ActivityIndicator size="large" className="color-theme-primary" />
        <ThemedText className="mt-4 text-theme-primary">Locating...</ThemedText>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View
        className={`flex-1 items-center justify-center bg-white dark:bg-theme-secondary p-6 ${themeClass}`}
      >
        <ThemedText
          variant="title"
          className="mb-2 text-center text-theme-primary"
        >
          Location Required
        </ThemedText>
        <ThemedText className="text-center mb-4 text-theme-primary">
          {errorMsg}
        </ThemedText>
        <Button label="Retry" onPress={() => setLoading(true)} />
      </View>
    );
  }

  return (
    <View className={`flex-1 ${themeClass}`}>
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
        // We could change userInterfaceStyle based on isDark, but standard map styling is separate.
      >
        {reports.map((report) => (
          <Marker
            key={report.id}
            coordinate={{
              latitude: Number(report.lat),
              longitude: Number(report.long),
            }}
            title={report.location_name || "Trash Report"}
            description={report.description || "No description"}
          />
        ))}
      </MapView>

      {/* Overlay for report count or status */}
      <View className="absolute top-12 left-4 right-4 bg-white/90 dark:bg-theme-secondary/90 p-4 rounded-xl shadow-sm border border-theme-secondary dark:border-theme-primary/10">
        {loadingReports ? (
          <ActivityIndicator
            size="small"
            color={isDark ? "#f2f9f6" : "#1a4d2e"}
          />
        ) : (
          <ThemedText
            variant="subtitle"
            className="text-center text-theme-primary"
          >
            {reports.length} Report{reports.length !== 1 ? "s" : ""} Nearby
          </ThemedText>
        )}
      </View>

      {/* Floating Action Button */}
      <View className="absolute bottom-28 right-6">
        <TouchableOpacity
          className="w-16 h-16 bg-theme-primary dark:bg-theme-accent rounded-full items-center justify-center shadow-lg"
          onPress={() => router.push("/report")}
          activeOpacity={0.8}
        >
          <Plus size={32} color={isDark ? "#1a2f2b" : "#f2f9f6"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
