import { useRouter } from "expo-router";
import { ChevronLeft, Crown, Medal } from "lucide-react-native";
import {
  Image,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ScreenContent } from "../../components/ScreenContent";
import { ThemedText } from "../../components/ThemedText";

// Mock Data Generator
const generateMockData = () => {
  const users = [
    {
      id: "1",
      name: "Alice",
      score: 2500,
      avatar: "https://i.pravatar.cc/150?u=1",
    },
    {
      id: "2",
      name: "Bob",
      score: 2450,
      avatar: "https://i.pravatar.cc/150?u=2",
    },
    {
      id: "3",
      name: "Charlie",
      score: 2400,
      avatar: "https://i.pravatar.cc/150?u=3",
    },
    ...Array.from({ length: 47 }).map((_, i) => ({
      id: `${i + 4}`,
      name: `User ${i + 4}`,
      score: 2300 - i * 10, // Decreasing score
      avatar: `https://i.pravatar.cc/150?u=${i + 4}`,
    })),
  ];
  return users;
};

const users = generateMockData();
const top3 = users.slice(0, 3);
const rest = users.slice(3);

export default function LeaderboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "dark" ? "#f4f4f5" : "#18181b"; // zinc-50 : zinc-900

  return (
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
        <View className="flex-row justify-center items-end px-4 mb-12 h-64">
          {/* 2nd Place (Silver) */}
          <View className="items-center mx-2 z-10">
            <View className="mb-2 relative w-16">
              <View className="absolute -top-10 w-full items-center">
                <Medal size={32} color="#C0C0C0" />
              </View>
              <Image
                source={{ uri: top3[1].avatar }}
                className="w-16 h-16 rounded-full border-2 border-zinc-300"
              />
            </View>
            <View className="bg-gray-300 w-24 h-32 rounded-t-lg items-center justify-start py-2 shadow-lg">
              <ThemedText className="font-bold text-zinc-800 text-lg">
                2
              </ThemedText>
              <ThemedText className="font-semibold text-zinc-700 text-sm mt-1">
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
              <Image
                source={{ uri: top3[0].avatar }}
                className="w-20 h-20 rounded-full border-4 border-yellow-400"
              />
            </View>
            <View className="bg-yellow-400 w-28 h-40 rounded-t-lg items-center justify-start py-4 shadow-xl">
              <ThemedText className="font-bold text-yellow-900 text-2xl">
                1
              </ThemedText>
              <ThemedText className="font-bold text-yellow-900 text-lg mt-1">
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
              <Image
                source={{ uri: top3[2].avatar }}
                className="w-16 h-16 rounded-full border-2 border-orange-300"
              />
            </View>
            <View className="bg-orange-300 w-24 h-24 rounded-t-lg items-center justify-start py-2 shadow-lg">
              <ThemedText className="font-bold text-orange-900 text-lg">
                3
              </ThemedText>
              <ThemedText className="font-semibold text-orange-800 text-sm mt-1">
                {top3[2].name}
              </ThemedText>
              <ThemedText className="text-xs text-orange-800 font-bold">
                {top3[2].score}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* List */}
        <View className="px-4">
          {rest.map((user, index) => (
            <View
              key={user.id}
              className="flex-row items-center bg-zinc-100 dark:bg-zinc-900 p-4 mb-3 rounded-2xl shadow-sm"
            >
              <ThemedText className="w-8 font-bold text-lg text-zinc-400">
                {index + 4}
              </ThemedText>
              <Image
                source={{ uri: user.avatar }}
                className="w-10 h-10 rounded-full mx-3"
              />
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
      </ScrollView>
    </ScreenContent>
  );
}
