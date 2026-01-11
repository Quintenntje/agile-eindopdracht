import { router } from "expo-router";
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ScreenContent } from "../../components/ScreenContent";
import { ThemedText } from "../../components/ThemedText";
import { getThemeClass, useTheme } from "../../lib/contexts/ThemeContext";
import { Event } from "../../lib/types";
import { supabase } from "../../lib/utils/supabase";

export default function EventsScreen() {
  const { theme } = useTheme();
  const themeClass = getThemeClass(theme);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .in("status", ["upcoming", "active"])
        .order("event_date", { ascending: true });

      if (error) throw error;
      setEvents(data as Event[]);
    } catch (error) {
      console.error("Error fetching events:", error);
      Alert.alert("Fout", "Evenementen laden mislukt");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, [fetchEvents]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const EventCard = ({ event }: { event: Event }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/event/${event.id}`)}
      className="bg-white dark:bg-theme-secondary rounded-2xl mb-4 shadow-sm border border-theme-secondary dark:border-theme-primary/20 overflow-hidden"
    >
      <View className="h-2 bg-theme-accent w-full" />
      <View className="p-5">
        <View className="flex-row justify-between items-start mb-2">
          <ThemedText
            className="font-plus-jakarta-sans-bold text-lg flex-1 mr-2 text-theme-primary"
            numberOfLines={2}
          >
            {event.title}
          </ThemedText>
          {event.status === "active" && (
            <View className="bg-theme-accent/20 dark:bg-theme-accent/30 px-2 py-1 rounded-md">
              <ThemedText className="text-[10px] uppercase font-bold text-theme-accent">
                Live
              </ThemedText>
            </View>
          )}
        </View>

        <View className="flex-row items-center gap-2 mb-2">
          <Calendar size={14} color={isDark ? "#96CA64" : "#18181b"} />
          <ThemedText className="text-theme-primary/70 dark:text-theme-primary/60 text-sm">
            {formatDate(event.event_date)}
          </ThemedText>
        </View>

        <View className="flex-row items-center gap-2 mb-4">
          <MapPin size={14} color={isDark ? "#96CA64" : "#18181b"} />
          <ThemedText
            className="text-theme-primary/70 dark:text-theme-primary/60 text-sm flex-1"
            numberOfLines={1}
          >
            {event.location_name}
          </ThemedText>
        </View>

        <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-theme-secondary dark:border-theme-primary/20">
          <View className="flex-row items-center gap-1.5">
            <Users size={14} color={isDark ? "#96CA64" : "#18181b"} />
            <ThemedText className="text-xs text-theme-primary/60 dark:text-theme-primary/50">
              {event.max_participants
                ? `Max. ${event.max_participants}`
                : "Open"}
            </ThemedText>
          </View>

          <View className="flex-row items-center gap-1">
            <ThemedText className="text-theme-accent dark:text-theme-accent font-plus-jakarta-sans-bold text-sm">
              Details Bekijken
            </ThemedText>
            <ArrowRight size={14} color={isDark ? "#96CA64" : "#96CA64"} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View
        className={`flex-1 bg-white dark:bg-theme-secondary items-center justify-center ${themeClass}`}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? "#96CA64" : "#96CA64"}
        />
      </View>
    );
  }

  return (
    <ScreenContent
      className={`bg-white dark:bg-theme-secondary pt-2 ${themeClass}`}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="mb-6 mt-8">
        <ThemedText variant="title" className="text-theme-primary mb-1">
          Aankomende Evenementen
        </ThemedText>
        <ThemedText className="text-theme-primary/70 dark:text-theme-primary/60">
          Doe mee met de community in actie
        </ThemedText>
      </View>

      {events.length === 0 ? (
        <View className="items-center justify-center py-20">
          <View className="w-16 h-16 bg-theme-secondary dark:bg-theme-primary/20 rounded-full items-center justify-center mb-4">
            <Calendar size={32} color={isDark ? "#96CA64" : "#96CA64"} />
          </View>
          <ThemedText className="text-theme-primary/70 dark:text-theme-primary/60 text-center">
            Geen aankomende evenementen gevonden.{"\n"}Kom later terug!
          </ThemedText>
        </View>
      ) : (
        events.map((event) => <EventCard key={event.id} event={event} />)
      )}

      <View className="h-20" />
    </ScreenContent>
  );
}
