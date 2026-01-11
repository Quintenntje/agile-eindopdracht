import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import { Calendar, Plus, Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import MapView, { Heatmap, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Button } from "../../components/Button";
import { ThemedText } from "../../components/ThemedText";
import { getThemeClass, useTheme } from "../../lib/contexts/ThemeContext";
import { TRASH_BINS } from "../../lib/data/trash_bins";
import { Event } from "../../lib/types";
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
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { theme } = useTheme();
  const themeClass = getThemeClass(theme);
  const isWeb = Platform.OS === "web";

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Toegang tot locatie geweigerd");
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setLoading(false);
    })();
  }, []);

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      // Fetch Reports
      const { data: reportsData, error: reportsError } = await supabase
        .from("recorded_trash")
        .select("id, description, location_name, lat, long, created_at")
        .eq("status", "verified")
        .order("created_at", { ascending: false });

      if (reportsError) throw reportsError;
      setReports(reportsData || []);

      // Fetch Events
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .in("status", ["upcoming", "active"])
        .order("event_date", { ascending: true });

      if (eventsError) throw eventsError;
      setEvents((eventsData as Event[]) || []);
    } catch (error) {
      console.error("Error fetching map data:", error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  if (loading) {
    return (
      <View
        className={`flex-1 items-center justify-center bg-white dark:bg-theme-secondary ${themeClass}`}
      >
        <ActivityIndicator size="large" className="color-theme-primary" />
        <ThemedText className="mt-4 text-theme-primary">
          Locatie bepalen...
        </ThemedText>
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
          Locatie Vereist
        </ThemedText>
        <ThemedText className="text-center mb-4 text-theme-primary">
          {errorMsg}
        </ThemedText>
        <Button label="Opnieuw Proberen" onPress={() => setLoading(true)} />
      </View>
    );
  }

  return (
    <View className={`flex-1 ${themeClass}`}>
      {isWeb ? (
        <View className="flex-1 items-center justify-center bg-white dark:bg-theme-secondary">
          <ThemedText variant="title" className="text-theme-primary mb-2">
            Kaart Voorbeeld
          </ThemedText>
          <ThemedText className="text-theme-primary/70 text-center px-6">
            Kaartweergave vereist een native build. Gebruik de Expo Go-app of
            bouw de app om de kaart te bekijken.
          </ThemedText>
          <View className="mt-6 px-4">
            <ThemedText variant="subtitle" className="text-theme-primary mb-2">
              Samenvatting
            </ThemedText>
            <ThemedText className="text-theme-primary">
              Evenementen: {events.length}
            </ThemedText>
            <ThemedText className="text-theme-primary">
              Rapporten: {reports.length}
            </ThemedText>
            <ThemedText className="text-theme-primary">
              Prullenbakken: {TRASH_BINS.length}
            </ThemedText>
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
            >
              <View className="bg-emerald-500 p-2 rounded-full shadow-md border-2 border-white">
                <Trash2 size={16} color="#ffffff" />
              </View>
            </Marker>
          ))}

          {events.map((event) => (
            <Marker
              key={event.id}
              coordinate={{
                latitude: event.lat,
                longitude: event.long,
              }}
              title={event.title}
              description={event.location_name}
              onCalloutPress={() => router.push(`/event/${event.id}`)}
            >
              <View className="bg-indigo-600 p-2 rounded-full shadow-md border-2 border-white">
                <Calendar size={16} color="#ffffff" />
              </View>
            </Marker>
          ))}

          {/* Heatmap for Verified Reports */}
          {reports.length > 0 && (
            <Heatmap
              points={reports.map((report) => ({
                latitude: Number(report.lat),
                longitude: Number(report.long),
                weight: 1,
              }))}
              radius={50}
              opacity={0.7}
              gradient={{
                colors: ["#4ade80", "#facc15", "#fb923c", "#ef4444"], // Green -> Yellow -> Orange -> Red
                startPoints: [0.1, 0.4, 0.7, 1],
                colorMapSize: 256,
              }}
            />
          )}
        </MapView>
      )}

      {/* Legend */}
      <View className="absolute bottom-28 left-4 bg-white/90 dark:bg-zinc-900/90 p-3 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
        <ThemedText className="font-plus-jakarta-sans-bold text-xs mb-2 text-zinc-900 dark:text-zinc-100 uppercase">
          Kaart Legende
        </ThemedText>

        <View className="flex-row items-center gap-2 mb-2">
          <View className="w-6 h-6 bg-emerald-500 rounded-full items-center justify-center">
            <Trash2 size={12} color="#ffffff" />
          </View>
          <ThemedText className="text-xs text-zinc-600 dark:text-zinc-300">
            Openbare Prullenbak
          </ThemedText>
        </View>

        <View className="flex-row items-center gap-2 mb-2">
          <View className="w-6 h-6 bg-indigo-600 rounded-full items-center justify-center">
            <Calendar size={12} color="#ffffff" />
          </View>
          <ThemedText className="text-xs text-zinc-600 dark:text-zinc-300">
            Evenement
          </ThemedText>
        </View>

        <View className="flex-row items-center gap-2">
          <View className="w-6 h-6 rounded-full items-center justify-center overflow-hidden bg-orange-400">
            <View className="w-full h-full bg-orange-400 opacity-60" />
          </View>
          <ThemedText className="text-xs text-zinc-600 dark:text-zinc-300">
            Afval Heatmap
          </ThemedText>
        </View>
      </View>

      {/* Floating Action Button */}
      <View className="absolute bottom-28 right-6">
        <TouchableOpacity
          className="w-16 h-16 bg-theme-accent rounded-full items-center justify-center shadow-lg"
          onPress={() => router.push("/report")}
          activeOpacity={0.8}
        >
          <Plus size={32} color={isDark ? "#1a2f2b" : "#f4f4f5"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
