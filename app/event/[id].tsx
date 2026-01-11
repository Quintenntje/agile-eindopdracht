import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  Share as ShareIcon,
  Users,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  Share,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ScreenContent } from "../../components/ScreenContent";
import { ThemedText } from "../../components/ThemedText";
import { useAuth } from "../../lib/contexts/AuthContext";
import { getThemeClass, useTheme } from "../../lib/contexts/ThemeContext";
import { Event, EventParticipant } from "../../lib/types";
import { supabase } from "../../lib/utils/supabase";

type ParticipantWithProfile = EventParticipant & {
  profiles: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
};

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const themeClass = getThemeClass(theme);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<ParticipantWithProfile[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEventDetails = useCallback(async () => {
    try {
      if (!id) return;

      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      const { data: participantsData, error: participantsError } =
        await supabase
          .from("event_participants")
          .select(
            `
          *,
          profiles (
            id,
            first_name,
            last_name,
            full_name,
            avatar_url
          )
        `
          )
          .eq("event_id", id)
          .eq("status", "registered");

      if (participantsError) throw participantsError;

      const parts =
        (participantsData as unknown as ParticipantWithProfile[]) || [];
      setParticipants(parts);

      if (user) {
        const joined = parts.some((p) => p.user_id === user.id);
        setIsJoined(joined);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      Alert.alert("Fout", "Evenementdetails laden mislukt");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEventDetails();
  }, [fetchEventDetails]);

  const handleJoinLeave = async () => {
    if (!user || !event) return;
    setActionLoading(true);

    try {
      if (isJoined) {
        // Leave logic (Delete or update status to cancelled)
        // Opting for delete for simplicity unless status history is required
        const { error } = await supabase
          .from("event_participants")
          .delete()
          .eq("event_id", event.id)
          .eq("user_id", user.id);

        if (error) throw error;
        setIsJoined(false);
        setParticipants((prev) => prev.filter((p) => p.user_id !== user.id));
        Alert.alert("Success", "You have left the event.");
      } else {
        // Join logic
        if (
          event.max_participants &&
          participants.length >= event.max_participants
        ) {
          Alert.alert("Vol", "Dit evenement heeft het maximum aantal deelnemers bereikt.");
          return;
        }

        const { error } = await supabase.from("event_participants").insert({
          event_id: event.id,
          user_id: user.id,
          status: "registered",
        });

        if (error) {
          if (error.code === "23505") {
            // Unique constraint violation
            Alert.alert("Info", "You are already registered.");
            setIsJoined(true);
          } else {
            throw error;
          }
        } else {
          setIsJoined(true);
          // Optimistically add user - fetching profile would be better but simple add for now
          // For full correctness, we should refetch or fetch user profile from context/db
          fetchEventDetails();
          Alert.alert("Succes", "Je doet nu mee aan het evenement!");
        }
      }
    } catch (error) {
      console.error("Error joining/leaving:", error);
      Alert.alert("Error", "Failed to update participation.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this event: ${event?.title} at ${event?.location_name}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View className={`flex-1 bg-white dark:bg-theme-secondary items-center justify-center ${themeClass}`}>
        <ActivityIndicator size="large" color={isDark ? "#96CA64" : "#96CA64"} />
      </View>
    );
  }

  if (!event) {
    return (
      <View className={`flex-1 bg-white dark:bg-theme-secondary items-center justify-center ${themeClass}`}>
        <ThemedText variant="title" className="text-theme-primary">Event not found</ThemedText>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${themeClass}`}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className={`absolute top-0 left-0 right-0 z-10 flex-row justify-between items-center px-4 pt-14 pb-4 bg-white dark:bg-theme-secondary border-b border-theme-secondary dark:border-theme-primary/10 ${themeClass}`}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-theme-secondary dark:bg-theme-primary/20 rounded-full items-center justify-center"
        >
          <ArrowLeft size={20} color={isDark ? "#fafafa" : "#18181b"} />
        </TouchableOpacity>
        <ThemedText
          className="font-plus-jakarta-sans-bold text-lg max-w-[70%] text-theme-primary"
          numberOfLines={1}
        >
          {event.title}
        </ThemedText>
        <TouchableOpacity
          onPress={handleShare}
          className="w-10 h-10 bg-theme-secondary dark:bg-theme-primary/20 rounded-full items-center justify-center"
        >
          <ShareIcon size={18} color={isDark ? "#fafafa" : "#18181b"} />
        </TouchableOpacity>
      </View>

      <ScreenContent
        className="bg-white dark:bg-theme-secondary"
        contentContainerStyle={{ paddingTop: 100, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-5">
          {/* Date Badge */}
          <View className="self-start bg-theme-accent/10 dark:bg-theme-accent/20 px-3 py-1.5 rounded-lg mb-4 border border-theme-accent/20 dark:border-theme-accent/30">
            <ThemedText className="text-theme-accent dark:text-theme-accent font-plus-jakarta-sans-bold text-xs uppercase">
              {new Date(event.event_date).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </ThemedText>
          </View>

          <ThemedText variant="title" className="mb-4 text-theme-primary">
            {event.title}
          </ThemedText>

          {/* Location */}
          <View className="flex-row items-center gap-3 mb-6 bg-theme-secondary/50 dark:bg-theme-primary/10 p-4 rounded-xl border border-theme-secondary dark:border-theme-primary/20">
            <View className="w-10 h-10 bg-white dark:bg-theme-primary/20 rounded-full items-center justify-center shadow-sm">
              <MapPin size={20} color={isDark ? "#96CA64" : "#96CA64"} />
            </View>
            <View className="flex-1">
              <ThemedText className="font-plus-jakarta-sans-bold text-sm mb-0.5 text-theme-primary">
                {event.location_name}
              </ThemedText>
              <ThemedText className="text-theme-primary/60 dark:text-theme-primary/50 text-xs font-mono">
                {event.lat.toFixed(4)}, {event.long.toFixed(4)}
              </ThemedText>
            </View>
          </View>

          <ThemedText variant="subtitle" className="mb-2 text-theme-primary">
            Over Evenement
          </ThemedText>
          <ThemedText className="text-theme-primary/70 dark:text-theme-primary/60 leading-6 mb-8">
            {event.description || "Geen beschrijving beschikbaar."}
          </ThemedText>

          {/* Participants */}
          <View className="flex-row items-center justify-between mb-4">
            <ThemedText variant="subtitle" className="text-theme-primary">
              Participants ({participants.length})
            </ThemedText>
            {event.max_participants && (
              <ThemedText className="text-theme-primary/60 dark:text-theme-primary/50 text-sm">
                Max {event.max_participants}
              </ThemedText>
            )}
          </View>

          {participants.length === 0 ? (
            <View className="p-6 bg-theme-secondary/50 dark:bg-theme-primary/10 rounded-xl items-center mb-8 border border-theme-secondary dark:border-theme-primary/20">
              <Users size={24} color={isDark ? "#96CA64" : "#96CA64"} />
              <ThemedText className="text-theme-primary/60 dark:text-theme-primary/50 mt-2 text-sm">
                Wees de eerste die meedoet!
              </ThemedText>
            </View>
          ) : (
            <View className="gap-3 mb-8">
              {participants.map((p) => {
                const displayName = p.profiles.full_name || 
                  (p.profiles.first_name && p.profiles.last_name 
                    ? `${p.profiles.first_name} ${p.profiles.last_name}` 
                    :                       p.profiles.first_name || 
                      p.profiles.last_name || 
                      "Onbekende Gebruiker");
                const initials = displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "?";

                return (
                  <View
                    key={p.id}
                    className="flex-row items-center gap-3 bg-theme-secondary/30 dark:bg-theme-primary/10 p-3 rounded-xl border border-theme-secondary dark:border-theme-primary/20"
                  >
                    {p.profiles.avatar_url ? (
                      <Image
                        source={{ uri: p.profiles.avatar_url }}
                        className="w-10 h-10 rounded-full bg-theme-secondary dark:bg-theme-primary/20"
                      />
                    ) : (
                      <View className="w-10 h-10 rounded-full bg-theme-accent/20 dark:bg-theme-accent/30 items-center justify-center">
                        <ThemedText className="text-theme-accent dark:text-theme-accent font-bold text-xs">
                          {initials}
                        </ThemedText>
                      </View>
                    )}
                    <View className="flex-1">
                      <ThemedText className="font-plus-jakarta-sans-bold text-sm text-theme-primary">
                        {displayName}
                      </ThemedText>
                      <ThemedText className="text-xs text-theme-primary/60 dark:text-theme-primary/50">
                        Joined {new Date(p.joined_at).toLocaleDateString()}
                      </ThemedText>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScreenContent>

      {/* Footer Action */}
      <View className={`absolute bottom-0 left-0 right-0 p-5 bg-white dark:bg-theme-secondary border-t border-theme-secondary dark:border-theme-primary/10 ${themeClass}`}>
        <TouchableOpacity
          onPress={handleJoinLeave}
          disabled={actionLoading}
          className={`w-full py-4 rounded-full items-center justify-center flex-row gap-2 ${
            isJoined
              ? "bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30"
              : "bg-theme-accent dark:bg-theme-accent"
          }`}
          activeOpacity={0.8}
        >
          {actionLoading ? (
            <ActivityIndicator 
              size="small" 
              color={isJoined ? "#ef4444" : (isDark ? "#1a2f2b" : "#f2f9f6")} 
            />
          ) : (
            <>
              {isJoined ? (
                <ThemedText className="text-red-600 dark:text-red-400 font-plus-jakarta-sans-bold">
                  Verlaat Evenement
                </ThemedText>
              ) : (
                <ThemedText className={`font-plus-jakarta-sans-bold ${isDark ? "text-theme-secondary" : "text-theme-secondary-fg"}`}>
                  Doe Mee
                </ThemedText>
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
