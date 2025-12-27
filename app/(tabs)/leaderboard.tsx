import { useRouter } from "expo-router";
import { ChevronLeft, Crown, Medal } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ScreenContent } from "../../components/ScreenContent";
import { ThemedText } from "../../components/ThemedText";
import { supabase } from "../../lib/utils/supabase";

type LeaderboardUser = {
  id: string;
  name: string;
  score: number;
  avatar?: string;
  initials: string;
};

export default function LeaderboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "dark" ? "#f4f4f5" : "#18181b"; // zinc-50 : zinc-900
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase.rpc(
        "get_leaderboard",
        {
          limit_count: 50,
        }
      );

      if (fetchError) {
        throw fetchError;
      }

      if (!data || data.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const leaderboardUsers: LeaderboardUser[] = data
        .map((item) => {
          const firstName = item.first_name || "";
          const lastName = item.last_name || "";
          const fullName =
            `${firstName} ${lastName}`.trim() ||
            item.email?.split("@")[0] ||
            "User";
          const initials =
            firstName && lastName
              ? `${firstName[0]}${lastName[0]}`.toUpperCase()
              : firstName
                ? firstName[0].toUpperCase()
                : fullName[0].toUpperCase();

          return {
            id: item.user_id,
            name: fullName,
            score: item.total_points || 0,
            initials,
          };
        })
        .filter((user) => user.score >= 0);

      setUsers(leaderboardUsers);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  if (loading) {
    return (
      <ScreenContent className="bg-white dark:bg-zinc-950 px-0">
        <View className="flex-1 items-center justify-center pt-20">
          <ActivityIndicator size="large" color={iconColor} />
          <ThemedText className="mt-4 text-zinc-500 dark:text-zinc-400">
            Loading leaderboard...
          </ThemedText>
        </View>
      </ScreenContent>
    );
  }

  if (error) {
    return (
      <ScreenContent className="bg-white dark:bg-zinc-950 px-0">
        <View className="flex-1 items-center justify-center pt-20 px-4">
          <ThemedText variant="title" className="mb-2 text-center">
            Error
          </ThemedText>
          <ThemedText className="text-center mb-4 text-zinc-500 dark:text-zinc-400">
            {error}
          </ThemedText>
          <TouchableOpacity
            onPress={fetchLeaderboard}
            className="bg-zinc-900 dark:bg-zinc-100 px-6 py-3 rounded-full"
          >
            <ThemedText className="text-white dark:text-zinc-900 font-semibold">
              Retry
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScreenContent>
    );
  }

  const renderAvatar = (
    user: LeaderboardUser,
    size: "small" | "medium" | "large",
    borderColor?: string
  ) => {
    const sizeClasses = {
      small: "w-16 h-16",
      medium: "w-20 h-20",
      large: "w-10 h-10",
    };
    const textSizeClasses = {
      small: "text-base",
      medium: "text-lg",
      large: "text-sm",
    };

    if (user.avatar) {
      return (
        <Image
          source={{ uri: user.avatar }}
          className={`${sizeClasses[size]} rounded-full ${borderColor || ""}`}
        />
      );
    }
    return (
      <View
        className={`${sizeClasses[size]} rounded-full bg-zinc-200 dark:bg-zinc-800 items-center justify-center ${borderColor || ""}`}
      >
        <ThemedText
          className={`${textSizeClasses[size]} font-bold text-zinc-600 dark:text-zinc-400`}
        >
          {user.initials}
        </ThemedText>
      </View>
    );
  };

  return (
    <ScreenContent className="items-center justify-center bg-white dark:bg-theme-secondary">
      <ThemedText variant="title" className="text-theme-primary">
        Leaderboard
      </ThemedText>
      <ThemedText className="mt-4 text-center text-theme-primary/70">
        See who has gathered the most points!
      </ThemedText>
    <ScreenContent className="bg-white dark:bg-zinc-950 px-0">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-center pt-20 pb-16 px-4 relative">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute left-4 top-20 z-10 p-2"
          >
            <ChevronLeft size={28} color={iconColor} />
          </TouchableOpacity>
          <View className="items-center">
            <ThemedText
              variant="title"
              className="text-3xl font-bold text-center"
            >
              Leaderboard
            </ThemedText>
            <ThemedText className="mt-2 text-center text-zinc-500 dark:text-zinc-400">
              Who is leading the race?
            </ThemedText>
          </View>
        </View>

        {/* Podium */}
        {top3.length >= 3 && (
          <View className="flex-row justify-center items-end px-4 mb-12 h-64">
            {/* 2nd Place (Silver) */}
            <View className="items-center mx-2 z-10">
              <View className="mb-2 relative w-16">
                <View className="absolute -top-10 w-full items-center">
                  <Medal size={32} color="#C0C0C0" />
                </View>
                {renderAvatar(top3[1], "small", "border-2 border-zinc-300")}
              </View>
              <View className="bg-gray-300 w-24 h-32 rounded-t-lg items-center justify-start py-2 shadow-lg">
                <ThemedText className="font-bold text-zinc-800 text-lg">
                  2
                </ThemedText>
                <ThemedText
                  className="font-semibold text-zinc-700 text-sm mt-1 px-1 text-center"
                  numberOfLines={1}
                >
                  {top3[1].name}
                </ThemedText>
                <ThemedText className="text-xs text-zinc-600 font-bold">
                  {top3[1].score}
                </ThemedText>
              </View>
            </View>

            {/* 1st Place (Gold) */}
            <View className="items-center mx-2 z-20 -mb-2">
              <View className="mb-2 relative w-20">
                <View className="absolute -top-12 w-full items-center">
                  <Crown size={40} color="#FFD700" />
                </View>
                {renderAvatar(top3[0], "medium", "border-4 border-yellow-400")}
              </View>
              <View className="bg-yellow-400 w-28 h-40 rounded-t-lg items-center justify-start py-4 shadow-xl">
                <ThemedText className="font-bold text-yellow-900 text-2xl">
                  1
                </ThemedText>
                <ThemedText
                  className="font-bold text-yellow-900 text-lg mt-1 px-1 text-center"
                  numberOfLines={1}
                >
                  {top3[0].name}
                </ThemedText>
                <ThemedText className="text-sm text-yellow-800 font-bold">
                  {top3[0].score}
                </ThemedText>
              </View>
            </View>

            {/* 3rd Place (Bronze) */}
            <View className="items-center mx-2 z-10">
              <View className="mb-2 relative w-16">
                <View className="absolute -top-10 w-full items-center">
                  <Medal size={32} color="#CD7F32" />
                </View>
                {renderAvatar(top3[2], "small", "border-2 border-orange-300")}
              </View>
              <View className="bg-orange-300 w-24 h-24 rounded-t-lg items-center justify-start py-2 shadow-lg">
                <ThemedText className="font-bold text-orange-900 text-lg">
                  3
                </ThemedText>
                <ThemedText
                  className="font-semibold text-orange-800 text-sm mt-1 px-1 text-center"
                  numberOfLines={1}
                >
                  {top3[2].name}
                </ThemedText>
                <ThemedText className="text-xs text-orange-800 font-bold">
                  {top3[2].score}
                </ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Empty state if no users */}
        {users.length === 0 && (
          <View className="items-center justify-center py-20 px-4">
            <ThemedText className="text-zinc-500 dark:text-zinc-400 text-center">
              No users on the leaderboard yet. Be the first!
            </ThemedText>
          </View>
        )}

        {/* List */}
        {rest.length > 0 && (
          <View className="px-4">
            {rest.map((user, index) => (
              <View
                key={user.id}
                className="flex-row items-center bg-zinc-100 dark:bg-zinc-900 p-4 mb-3 rounded-2xl shadow-sm"
              >
                <ThemedText className="w-8 font-bold text-lg text-zinc-400">
                  {index + 4}
                </ThemedText>
                {user.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    className="w-10 h-10 rounded-full mx-3"
                  />
                ) : (
                  <View className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 items-center justify-center mx-3">
                    <ThemedText className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
                      {user.initials}
                    </ThemedText>
                  </View>
                )}
                <View className="flex-1">
                  <ThemedText className="font-semibold text-base">
                    {user.name}
                  </ThemedText>
                </View>
                <View className="flex-row items-center bg-zinc-200 dark:bg-zinc-800 px-3 py-1 rounded-full">
                  <ThemedText className="font-bold text-sm">
                    {user.score} pts
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContent>
  );
}
