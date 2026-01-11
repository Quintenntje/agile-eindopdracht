import { router, useFocusEffect } from "expo-router";
import {
  Award,
  ChevronRight,
  FileText,
  Gift,
  LogOut,
  MapPin,
  Settings,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, TouchableOpacity, useColorScheme, View } from "react-native";
import { ScreenContent } from "../../components/ScreenContent";
import { ThemedText } from "../../components/ThemedText";
import { useAuth } from "../../lib/contexts/AuthContext";
import { supabase } from "../../lib/utils/supabase";

export default function ProfileScreen() {
  const { session, user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    points: 0,
    reports: 0,
    impact: "Laag",
  });

  const fetchStats = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch points
      const { data: pointsData } = await supabase
        .from("user_points")
        .select("total_points")
        .eq("user_id", user.id)
        .single();

      const points = pointsData?.total_points || 0;

      // Fetch verified reports count
      const { count: reportsCount } = await supabase
        .from("recorded_trash")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "verified");

      // Calculate impact level based on verified reports
      const verifiedReports = reportsCount || 0;
      let impact = "Laag";
      if (verifiedReports >= 100) impact = "Zeer Hoog";
      else if (verifiedReports >= 50) impact = "Hoog";
      else if (verifiedReports >= 25) impact = "Gemiddeld";
      else if (verifiedReports >= 10) impact = "Laag-Gemiddeld";

      setStats({
        points,
        reports: verifiedReports,
        impact,
      });
    } catch (error) {
      console.error("Error fetching profile stats:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

  const statsConfig = [
    { label: "Points", value: stats.points.toLocaleString(), icon: Award, color: "#f59e0b" },
    { label: "Reports", value: stats.reports.toString(), icon: FileText, color: "#3b82f6" },
    { label: "Impact", value: stats.impact, icon: MapPin, color: "#10b981" },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      // Router will likely handle this via AuthContext listener, but we can force it just in case
      router.replace("/login");
    }
  };

  const userEmail = session?.user?.email || "user@example.com";
  // Attempt to get name from metadata, fallback to 'User'
  const firstName = session?.user?.user_metadata?.first_name || "Burger";
  const lastName = session?.user?.user_metadata?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = firstName ? firstName[0].toUpperCase() : "U";

  return (
    <ScreenContent
      className="bg-white dark:bg-theme-secondary"
      contentContainerStyle={{ paddingBottom: 0 }}
    >
      {/* Header */}
      <View className="items-center pt-12 pb-8 px-6 bg-theme-secondary/20 dark:bg-theme-primary/5 border-b border-theme-secondary dark:border-theme-primary/10">
        <View className="w-24 h-24 rounded-full bg-theme-secondary dark:bg-theme-primary/20 items-center justify-center mb-4 border-4 border-white dark:border-theme-secondary shadow-sm">
          <ThemedText className="text-3xl font-plus-jakarta-sans-bold text-theme-primary">
            {initials}
          </ThemedText>
        </View>
        <ThemedText variant="title" className="text-center text-theme-primary">
          {fullName}
        </ThemedText>
        <ThemedText className="text-theme-primary/70 mt-1">
          {userEmail}
        </ThemedText>

        <TouchableOpacity className="absolute top-12 right-6 p-2 bg-theme-secondary dark:bg-theme-primary/20 rounded-full">
          <Settings size={20} color={isDark ? "#fafafa" : "#18181b"} />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View className="flex-row justify-between px-6 py-8">
        {loading ? (
          <View className="flex-1 items-center">
            <ActivityIndicator size="small" />
          </View>
        ) : (
          statsConfig.map((stat, index) => (
            <View key={index} className="items-center flex-1">
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center mb-2 bg-opacity-10"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon size={24} color={stat.color} />
              </View>
              <ThemedText
                variant="subtitle"
                className="font-plus-jakarta-sans-bold text-theme-primary"
              >
                {stat.value}
              </ThemedText>
              <ThemedText variant="caption">{stat.label}</ThemedText>
            </View>
          ))
        )}
      </View>

      {/* Actions */}
      <View className="px-6 space-y-4">
        <ThemedText variant="subtitle" className="mb-2 ml-1 text-theme-primary">
          Account
        </ThemedText>

        <TouchableOpacity
          onPress={() => router.push("/store")}
          className="flex-row items-center p-4 bg-theme-secondary/30 dark:bg-theme-primary/10 rounded-2xl border border-theme-secondary dark:border-theme-primary/20 mb-2"
          activeOpacity={0.7}
        >
          <View className="w-10 h-10 rounded-full bg-theme-primary/10 dark:bg-theme-accent/20 items-center justify-center mr-4">
            <Gift size={20} color={isDark ? "#4ade80" : "#1a4d2e"} />
          </View>
          <View className="flex-1">
            <ThemedText className="font-plus-jakarta-sans-medium text-theme-primary">
              Beloningen Winkel
            </ThemedText>
            <ThemedText variant="caption" className="text-theme-primary/60">
              Thema's & coupons
            </ThemedText>
          </View>
          <ChevronRight size={20} color={isDark ? "#fafafa" : "#18181b"} />
        </TouchableOpacity>


        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 mt-4"
        >
          <View className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mr-4">
            <LogOut size={20} color={isDark ? "#f87171" : "#ef4444"} />
          </View>
          <View className="flex-1">
            <ThemedText className="font-plus-jakarta-sans-medium text-red-600 dark:text-red-400">
              Uitloggen
            </ThemedText>
          </View>
        </TouchableOpacity>
      </View>
    </ScreenContent>
  );
}
