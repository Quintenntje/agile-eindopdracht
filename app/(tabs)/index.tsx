import { router, useFocusEffect } from "expo-router";
import {
  Calendar,
  Camera,
  Map as MapIcon,
  Medal,
  Ticket,
  Trophy,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { TouchableOpacity, useColorScheme, View } from "react-native";
import { ScreenContent } from "../../components/ScreenContent";
import { ThemedText } from "../../components/ThemedText";
import { useAuth } from "../../lib/contexts/AuthContext";
import { Event } from "../../lib/types";
import { supabase } from "../../lib/utils/supabase";

export default function HomeScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [stats, setStats] = useState({
    points: 0,
    rank: 0,
    totalReports: 0,
  });
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Check metadata for admin role
  const isAdmin =
    user?.user_metadata?.role === "admin" ||
    user?.app_metadata?.role === "admin";

  const firstName = user?.user_metadata?.first_name || "Burger";

  const fetchUserData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch points
      const { data: pointsData } = await supabase
        .from("user_points")
        .select("total_points")
        .eq("user_id", user.id)
        .single();

      const points = pointsData?.total_points || 0;

      // Fetch rank using RPC function
      const { data: rankData, error: rankError } = await supabase.rpc(
        "get_user_rank",
        { p_user_id: user.id }
      );

      const rank = rankError || rankData === null ? 1 : rankData;

      // Fetch total reports count
      const { count: reportsCount } = await supabase
        .from("recorded_trash")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Fetch pending reports
      const { data: pendingData } = await supabase
        .from("recorded_trash")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch upcoming joined events
      const { data: participantsData } = await supabase
        .from("event_participants")
        .select("event:events(*)")
        .eq("user_id", user.id)
        .eq("status", "registered");

      const now = new Date();
      const validEvents = (participantsData || [])
        // @ts-ignore
        .map((p) => p.event as Event)
        .filter((e) => e && new Date(e.event_date) > now)
        .sort(
          (a, b) =>
            new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        )
        .slice(0, 3);

      setStats({
        points,
        rank,
        totalReports: reportsCount || 0,
      });
      setPendingReports(pendingData || []);
      setUpcomingEvents(validEvents);
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  return (
    <ScreenContent
      className="bg-white dark:bg-theme-secondary"
      contentContainerClassName="padding-0"
    >
      {/* Hero Section */}
      <View className="-mx-0 pt-16 pb-8 px-6 bg-theme-secondary/20 dark:bg-theme-primary/5 border-b border-theme-secondary dark:border-theme-primary/10 rounded-b-[32px]">
        <View className="flex-row justify-between items-start mb-6">
          <View>
            {isAdmin && (
              <View className="bg-indigo-100 dark:bg-indigo-900/30 self-start px-3 py-1 rounded-full mb-2">
                <ThemedText className="text-xs font-plus-jakarta-sans-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Hallo Admin
                </ThemedText>
              </View>
            )}
            <ThemedText className="text-theme-primary/70 text-lg">
              Welcome back,
            </ThemedText>
            <ThemedText
              variant="title"
              className="text-3xl mt-1 text-theme-primary"
            >
              {firstName}
            </ThemedText>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            className="w-12 h-12 bg-white dark:bg-theme-primary/20 rounded-full items-center justify-center shadow-sm border border-theme-secondary dark:border-theme-primary/10"
          >
            <ThemedText className="font-plus-jakarta-sans-bold text-lg text-theme-primary">
              {firstName[0]?.toUpperCase()}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Points Card */}
        <View className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700 relative overflow-hidden">
          {/* Decorative circles */}
          <View className="absolute -right-4 -top-4 w-24 h-24 bg-zinc-100 dark:bg-zinc-700 rounded-full opacity-50" />
          <View className="absolute -right-10 top-12 w-20 h-20 bg-zinc-100 dark:bg-zinc-700 rounded-full opacity-50" />

          <View className="flex-row items-center mb-1">
            <Trophy size={16} color={isDark ? "#e8f3ee" : "#18181b"} />
            <ThemedText className="text-zinc-500 dark:text-zinc-400 font-plus-jakarta-sans-medium text-xs uppercase tracking-wider ml-2">
              Totaal Score
            </ThemedText>
          </View>
          <View className="flex-row items-baseline">
            <ThemedText className="text-5xl font-plus-jakarta-sans-bold text-zinc-900 dark:text-white mr-2">
              {loading ? "..." : stats.points.toLocaleString()}
            </ThemedText>
            <ThemedText className="text-zinc-500 dark:text-zinc-400 font-plus-jakarta-sans-medium">
              pts
            </ThemedText>
          </View>
          <View className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700 flex-row justify-between items-center">
            <ThemedText className="text-zinc-500 dark:text-zinc-400 text-sm">
              Rank:{" "}
              <ThemedText className="text-zinc-900 dark:text-white font-plus-jakarta-sans-bold">
                #{loading ? "..." : stats.rank}
              </ThemedText>
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push("/leaderboard")}
              className="bg-zinc-100 dark:bg-zinc-700 px-3 py-1.5 rounded-full"
            >
              <ThemedText className="text-zinc-900 dark:text-white text-xs font-plus-jakarta-sans-bold">
                View Leaderboard
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-6 -mt-6 flex-row gap-4">
        <TouchableOpacity
          onPress={() => router.push("/report")}
          activeOpacity={0.9}
          className="flex-1 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 items-center justify-center py-6"
        >
          <View className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full items-center justify-center mb-3">
            <Camera size={24} color={isDark ? "#818cf8" : "#4f46e5"} />
          </View>
          <ThemedText className="font-plus-jakarta-sans-bold text-zinc-900 dark:text-zinc-50">
            Afval Rapporteren
          </ThemedText>
          <ThemedText className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-1">
            Verdien 10 punten
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/map")}
          activeOpacity={0.9}
          className="flex-1 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 items-center justify-center py-6"
        >
          <View className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full items-center justify-center mb-3">
            <MapIcon size={24} color={isDark ? "#34d399" : "#10b981"} />
          </View>
          <ThemedText className="font-plus-jakarta-sans-bold text-zinc-900 dark:text-zinc-50">
            Kaart Bekijken
          </ThemedText>
          <ThemedText className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-1">
            Vind lokale plekken
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Upcoming Events Section */}
      <View className="px-6 mt-8">
        <View className="flex-row justify-between items-center mb-4">
          <ThemedText variant="subtitle" className="text-theme-primary">My Upcoming Events</ThemedText>
          {upcomingEvents.length > 0 && (
            <TouchableOpacity onPress={() => router.push("/(tabs)/events")}>
              <ThemedText className="text-theme-accent dark:text-theme-accent text-sm font-plus-jakarta-sans-bold">
                View All
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              activeOpacity={0.7}
              onPress={() => router.push(`/event/${event.id}`)}
              className="flex-row items-center py-3 border-b border-theme-secondary dark:border-theme-primary/20 last:border-0"
            >
              <View className="w-12 h-12 bg-theme-accent/10 dark:bg-theme-accent/20 rounded-xl items-center justify-center mr-3 border border-theme-accent/20 dark:border-theme-accent/30">
                <ThemedText className="text-xs font-plus-jakarta-sans-bold text-theme-accent dark:text-theme-accent uppercase">
                  {new Date(event.event_date).toLocaleDateString(undefined, {
                    month: "short",
                  })}
                </ThemedText>
                <ThemedText className="text-lg font-plus-jakarta-sans-bold text-theme-accent dark:text-theme-accent">
                  {new Date(event.event_date).getDate()}
                </ThemedText>
              </View>
              <View className="flex-1">
                <ThemedText
                  className="font-plus-jakarta-sans-bold text-theme-primary text-base"
                  numberOfLines={1}
                >
                  {event.title}
                </ThemedText>
                <View className="flex-row items-center mt-0.5">
                  <ThemedText
                    className="text-xs text-theme-primary/70 dark:text-theme-primary/60 flex-1"
                    numberOfLines={1}
                  >
                    {new Date(event.event_date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    • {event.location_name}
                  </ThemedText>
                </View>
              </View>
              <View className="bg-theme-accent/20 dark:bg-theme-accent/30 p-2 rounded-full">
                <Ticket size={16} color={isDark ? "#96CA64" : "#96CA64"} />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="bg-theme-secondary/50 dark:bg-theme-primary/10 p-6 rounded-2xl items-center border border-theme-secondary dark:border-theme-primary/20">
            <Calendar
              size={32}
              color={isDark ? "#96CA64" : "#96CA64"}
              className="mb-3 opacity-50"
            />
            <ThemedText className="text-theme-primary/70 dark:text-theme-primary/60 text-center mb-2">
              Geen aankomende evenementen
            </ThemedText>
            <TouchableOpacity onPress={() => router.push("/(tabs)/events")}>
              <ThemedText className="text-theme-accent dark:text-theme-accent font-plus-jakarta-sans-bold text-sm">
                Zoek evenementen om mee te doen
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Pending Reports Section */}
      <View className="px-6 mt-8 mb-8">
        <View className="flex-row justify-between items-center mb-4">
          <ThemedText variant="subtitle">In Afwachting Rapporten</ThemedText>
          <ThemedText className="text-zinc-500 dark:text-zinc-400 text-sm">
            {pendingReports.length} In afwachting
          </ThemedText>
        </View>

        {pendingReports.length > 0 ? (
          pendingReports.map((report, index) => (
            <View
              key={report.id}
              className="flex-row items-center py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
            >
              <View className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full items-center justify-center mr-3">
                <Medal size={20} color={isDark ? "#fbbf24" : "#d97706"} />
              </View>
              <View className="flex-1">
                <ThemedText
                  className="font-plus-jakarta-sans-medium text-zinc-900 dark:text-zinc-50"
                  numberOfLines={1}
                >
                  {report.location_name || report.description || "Afval Rapport"}
                </ThemedText>
                <ThemedText className="text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(report.created_at).toLocaleDateString()} • In afwachting van verificatie
                </ThemedText>
              </View>
              <View className="bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">
                <ThemedText className="text-xs font-plus-jakarta-sans-bold text-amber-700 dark:text-amber-500">
                  Pending
                </ThemedText>
              </View>
            </View>
          ))
        ) : (
          <View className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl items-center border border-zinc-100 dark:border-zinc-800">
            <ThemedText className="text-zinc-500 dark:text-zinc-400 text-center mb-2">
              Geen rapporten in afwachting
            </ThemedText>
            <ThemedText className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
              Goed gedaan! Alle je rapporten zijn verwerkt.
            </ThemedText>
          </View>
        )}
      </View>
    </ScreenContent>
  );
}
