import { router } from "expo-router";
import { Calendar, MapPin, Plus, Trash2, Users } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenContent } from "../../components/ScreenContent";
import { ThemedText } from "../../components/ThemedText";
import { Event } from "../../lib/types";
import { supabase } from "../../lib/utils/supabase";

export default function AdminEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
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

  const handleDelete = (id: string) => {
    Alert.alert(
      "Evenement Verwijderen",
      "Weet je zeker dat je dit evenement wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.",
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Verwijderen",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("events")
                .delete()
                .eq("id", id);

              if (error) throw error;
              setEvents((prev) => prev.filter((e) => e.id !== id));
              Alert.alert("Succes", "Evenement succesvol verwijderd");
            } catch (error) {
              console.error("Error deleting event:", error);
              Alert.alert("Fout", "Evenement verwijderen mislukt");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-zinc-900 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <ScreenContent
      className="bg-white dark:bg-zinc-900 pt-2"
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="flex-row items-center justify-between mb-8 mt-20 px-2">
        <View>
          <ThemedText variant="title" className="text-3xl mb-2">
            Evenementen Beheren
          </ThemedText>
          <ThemedText className="text-zinc-500 dark:text-zinc-400 text-base">
            Maak en bewerk community evenementen
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(admin-tabs)/create-event")}
          className="w-12 h-12 bg-indigo-600 rounded-full items-center justify-center shadow-md shadow-indigo-500/30"
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {events.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full items-center justify-center mb-4">
              <Calendar size={32} color={isDark ? "#71717a" : "#9ca3af"} />
            </View>
            <ThemedText className="text-zinc-500 font-plus-jakarta-sans-medium">
              Geen evenementen gevonden
            </ThemedText>
          </View>
        ) : (
          events.map((event) => (
            <View
              key={event.id}
              className="bg-white dark:bg-zinc-900/50 rounded-2xl p-4 mb-4 shadow-sm border border-zinc-100 dark:border-zinc-800"
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-2">
                  <ThemedText
                    className="font-plus-jakarta-sans-bold text-lg text-zinc-900 dark:text-zinc-100"
                    numberOfLines={1}
                  >
                    {event.title}
                  </ThemedText>
                  <ThemedText className="text-xs text-zinc-500 mb-2">
                    {event.status.toUpperCase()}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(event.id)}
                  className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"
                >
                  <Trash2 size={16} color={isDark ? "#f87171" : "#ef4444"} />
                </TouchableOpacity>
              </View>

              <View className="flex-row gap-4 mb-3">
                <View className="flex-row items-center gap-1.5">
                  <Calendar size={14} color={isDark ? "#a1a1aa" : "#71717a"} />
                  <ThemedText className="text-xs text-zinc-600 dark:text-zinc-400">
                    {formatDate(event.event_date)}
                  </ThemedText>
                </View>
                <View className="flex-row items-center gap-1.5 flex-1">
                  <MapPin size={14} color={isDark ? "#a1a1aa" : "#71717a"} />
                  <ThemedText
                    className="text-xs text-zinc-600 dark:text-zinc-400"
                    numberOfLines={1}
                  >
                    {event.location_name}
                  </ThemedText>
                </View>
              </View>

              {event.max_participants && (
                <View className="flex-row items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800 self-start px-2 py-1 rounded">
                  <Users size={12} color={isDark ? "#a1a1aa" : "#71717a"} />
                  <ThemedText className="text-[10px] text-zinc-500">
                    Max: {event.max_participants}
                  </ThemedText>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </ScreenContent>
  );
}
