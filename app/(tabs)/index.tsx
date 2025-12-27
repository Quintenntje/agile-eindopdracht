import { router } from "expo-router";
import {
  Award,
  Camera,
  ChevronRight,
  Map as MapIcon,
  Trophy,
  Zap,
} from "lucide-react-native";
import { TouchableOpacity, useColorScheme, View } from "react-native";
import { ScreenContent } from "../../components/ScreenContent";
import { ThemedText } from "../../components/ThemedText";
import { useAuth } from "../../lib/contexts/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Check metadata for admin role
  const isAdmin =
    user?.user_metadata?.role === "admin" ||
    user?.app_metadata?.role === "admin";

  const firstName = user?.user_metadata?.first_name || "Citizen";

  return (
    <ScreenContent
      className="bg-white dark:bg-zinc-950"
      contentContainerClassName="padding-0"
    >
      {/* Hero Section */}
      <View className="-mx-0 pt-16 pb-8 px-6 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 rounded-b-[32px]">
        <View className="flex-row justify-between items-start mb-6">
          <View>
            {isAdmin && (
              <View className="bg-indigo-100 dark:bg-indigo-900/30 self-start px-3 py-1 rounded-full mb-2">
                <ThemedText className="text-xs font-plus-jakarta-sans-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Hi Admin
                </ThemedText>
              </View>
            )}
            <ThemedText className="text-zinc-500 dark:text-zinc-400 text-lg">
              Welcome back,
            </ThemedText>
            <ThemedText
              variant="title"
              className="text-3xl mt-1 text-zinc-900 dark:text-zinc-50"
            >
              {firstName}
            </ThemedText>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full items-center justify-center shadow-sm border border-zinc-100 dark:border-zinc-700"
          >
            <ThemedText className="font-plus-jakarta-sans-bold text-lg text-zinc-700 dark:text-zinc-300">
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
            <Trophy size={16} color={isDark ? "#f4f4f5" : "#18181b"} />
            <ThemedText className="text-zinc-500 dark:text-zinc-400 font-plus-jakarta-sans-medium text-xs uppercase tracking-wider ml-2">
              Total Score
            </ThemedText>
          </View>
          <View className="flex-row items-baseline">
            <ThemedText className="text-5xl font-plus-jakarta-sans-bold text-zinc-900 dark:text-white mr-2">
              1,250
            </ThemedText>
            <ThemedText className="text-zinc-500 dark:text-zinc-400 font-plus-jakarta-sans-medium">
              pts
            </ThemedText>
          </View>
          <View className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700 flex-row justify-between items-center">
            <ThemedText className="text-zinc-500 dark:text-zinc-400 text-sm">
              Rank:{" "}
              <ThemedText className="text-zinc-900 dark:text-white font-plus-jakarta-sans-bold">
                #42
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
            <Camera size={24} color="#4f46e5" />
          </View>
          <ThemedText className="font-plus-jakarta-sans-bold text-zinc-900 dark:text-zinc-50">
            Report Trash
          </ThemedText>
          <ThemedText className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-1">
            Earn 50 pts
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/map")}
          activeOpacity={0.9}
          className="flex-1 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 items-center justify-center py-6"
        >
          <View className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full items-center justify-center mb-3">
            <MapIcon size={24} color="#10b981" />
          </View>
          <ThemedText className="font-plus-jakarta-sans-bold text-zinc-900 dark:text-zinc-50">
            View Map
          </ThemedText>
          <ThemedText className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-1">
            Find local spots
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Active Challenges Preview */}
      <View className="px-6 mt-8">
        <View className="flex-row justify-between items-center mb-4">
          <ThemedText variant="subtitle">Active Challenge</ThemedText>
          <TouchableOpacity onPress={() => router.push("/challenges")}>
            <ThemedText className="text-indigo-600 dark:text-indigo-400 text-sm font-plus-jakarta-sans-medium">
              View All
            </ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/challenges")}
          activeOpacity={0.8}
          className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex-row items-center"
        >
          <View className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full items-center justify-center mr-4">
            <Zap size={20} color="#d97706" />
          </View>
          <View className="flex-1">
            <ThemedText className="font-plus-jakarta-sans-bold text-zinc-900 dark:text-zinc-50 mb-0.5">
              Weekend Warrior
            </ThemedText>
            <ThemedText className="text-xs text-zinc-500 dark:text-zinc-400">
              Report 5 items this weekend
            </ThemedText>
            {/* Progress Bar Mini */}
            <View className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mt-2 w-full overflow-hidden">
              <View className="h-full bg-amber-500 w-[60%] rounded-full" />
            </View>
          </View>
          <View className="ml-4 items-end">
            <ThemedText className="font-plus-jakarta-sans-bold text-amber-600 dark:text-amber-500">
              3/5
            </ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      {/* Leaderboard Preview */}
      <View className="px-6 mt-8">
        <View className="flex-row justify-between items-center mb-4">
          <ThemedText variant="subtitle">Top Cleaners</ThemedText>
          <TouchableOpacity onPress={() => router.push("/leaderboard")}>
            <ThemedText className="text-zinc-500 dark:text-zinc-400 text-sm">
              This Week
            </ThemedText>
          </TouchableOpacity>
        </View>

        {[
          { name: "Sarah V.", points: 2400, rank: 1, color: "#eab308" }, // yellow
          { name: "Mike T.", points: 2150, rank: 2, color: "#94a3b8" }, // slate
          { name: "Emma L.", points: 1900, rank: 3, color: "#b45309" }, // amber-700 (bronze)
        ].map((player, index) => (
          <View
            key={index}
            className="flex-row items-center py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
          >
            <View className="w-8 items-center mr-3">
              {index < 3 ? (
                <Award size={20} color={player.color} />
              ) : (
                <ThemedText className="text-zinc-500 font-plus-jakarta-sans-bold">
                  {player.rank}
                </ThemedText>
              )}
            </View>
            <View className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full items-center justify-center mr-3">
              <ThemedText className="text-xs font-plus-jakarta-sans-bold text-zinc-600 dark:text-zinc-400">
                {player.name[0]}
              </ThemedText>
            </View>
            <ThemedText className="flex-1 font-plus-jakarta-sans-medium text-zinc-900 dark:text-zinc-50">
              {player.name}
            </ThemedText>
            <ThemedText className="font-plus-jakarta-sans-bold text-zinc-900 dark:text-zinc-50">
              {player.points}
            </ThemedText>
          </View>
        ))}

        <TouchableOpacity
          onPress={() => router.push("/leaderboard")}
          className="mt-4 w-full bg-zinc-100 dark:bg-zinc-800 py-3 rounded-xl items-center flex-row justify-center"
        >
          <ThemedText className="text-zinc-900 dark:text-zinc-100 font-plus-jakarta-sans-bold mr-2">
            View Full Leaderboard
          </ThemedText>
          <ChevronRight size={16} color={isDark ? "#f4f4f5" : "#18181b"} />
        </TouchableOpacity>
      </View>
    </ScreenContent>
  );
}
