import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Button } from "../../components/Button";
import { ThemedText } from "../../components/ThemedText";
import { getThemeClass, useTheme } from "../../lib/contexts/ThemeContext";
import { TRASH_BINS } from "../../lib/data/trash_bins";
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
  const isWeb = Platform.OS === "web";

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
        .eq("status", "verified")
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
      {isWeb ? (
        <View className="flex-1 items-center justify-center bg-white dark:bg-theme-secondary">
          <ThemedText variant="title" className="text-theme-primary mb-2">
            Map Preview
          </ThemedText>
          <ThemedText className="text-theme-primary/70 text-center px-6">
            Map view requires a native build. Please use the Expo Go app or
            build the app to view the map.
          </ThemedText>
          <View className="mt-6 px-4">
            <ThemedText variant="subtitle" className="text-theme-primary mb-2">
              Reports Found: {reports.length}
            </ThemedText>
            {reports.length > 0 && (
              <View className="mt-2">
                {reports.slice(0, 5).map((report) => (
                  <View
                    key={report.id}
                    className="mb-2 p-3 bg-theme-secondary dark:bg-theme-primary/20 rounded-lg"
                  >
                    <ThemedText className="font-semibold text-theme-primary">
                      {report.location_name || "Trash Report"}
                    </ThemedText>
                    {report.description && (
                      <ThemedText
                        variant="caption"
                        className="text-theme-primary/70 mt-1"
                      >
                        {report.description}
                      </ThemedText>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          <View className="mt-4 px-4">
            <ThemedText variant="subtitle" className="text-theme-primary mb-2">
              Public Bins: {TRASH_BINS.length}
            </ThemedText>
            <View className="mt-2">
              {TRASH_BINS.slice(0, 5).map((bin) => (
                <View
                  key={bin.id}
                  className="mb-2 p-3 bg-theme-secondary dark:bg-theme-primary/20 rounded-lg"
                >
                  <ThemedText className="font-semibold text-theme-primary">
                    {bin.location_name}
                  </ThemedText>
                  <ThemedText
                    variant="caption"
                    className="text-theme-primary/70 mt-1"
                  >
                    {bin.description}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : (
        <MapView
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_GOOGLE}
          showsUserLocation
          showsMyLocationButton
          initialRegion={{
            latitude: location?.coords.latitude || 51.0543,
            longitude: location?.coords.longitude || 3.7174,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {TRASH_BINS.map((bin) => (
            <Marker
              key={bin.id}
              coordinate={{
                latitude: bin.lat,
                longitude: bin.long,
              }}
              title={bin.location_name}
              description={bin.description}
              pinColor="#10b981" // emerald-500
            />
          ))}
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
      )}

      {/* Floating Action Button */}
      <View className="absolute bottom-28 right-6">
        <TouchableOpacity
          className="w-16 h-16 bg-theme-primary dark:bg-theme-accent rounded-full items-center justify-center shadow-lg"
          onPress={() => router.push("/report")}
          activeOpacity={0.8}
        >
          <Plus size={32} color={isDark ? "#f2f9f6" : "#1a2f2b"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
