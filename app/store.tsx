import { router } from "expo-router";
import { Check, Lock, Palette, X } from "lucide-react-native";
import {
  Alert,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../lib/contexts/ThemeContext";

export default function StoreScreen() {
  const {
    theme: currentTheme,
    setTheme,
    buyTheme,
    purchasedThemes,
    availableThemes,
  } = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handlePurchase = async (themeId: any, price: number, name: string) => {
    if (price === 0) {
      setTheme(themeId);
      return;
    }

    Alert.alert(
      "Purchase Theme",
      `Do you want to buy the "${name}" theme for ${price} points?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Buy",
          onPress: async () => {
            const success = await buyTheme(themeId);
            if (success) {
              Alert.alert("Success", "Theme purchased!", [
                { text: "Activate Now", onPress: () => setTheme(themeId) },
                { text: "Later" },
              ]);
            } else {
              Alert.alert("Error", "Not enough points (Simulated)");
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950 pt-2">
      <View className="p-4 flex-row justify-between items-center border-b border-zinc-100 dark:border-zinc-800 mt-8">
        <View className="flex-row items-center gap-2">
          <Palette size={24} color={isDark ? "#fafafa" : "#18181b"} />
          <ThemedText variant="subtitle">Theme Store</ThemedText>
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full"
        >
          <X size={20} color={isDark ? "#e4e4e7" : "#52525b"} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6">
        <ThemedText className="mb-6 text-zinc-500 dark:text-zinc-400">
          Customize your app appearance. Earn points by cleaning up trash to
          unlock premium themes.
        </ThemedText>

        <View className="gap-4">
          {availableThemes.map((themeOption) => {
            const isPurchased = purchasedThemes.includes(themeOption.id);
            const isActive = currentTheme === themeOption.id;

            return (
              <TouchableOpacity
                key={themeOption.id}
                activeOpacity={0.8}
                onPress={() => {
                  if (isPurchased) {
                    setTheme(themeOption.id);
                  } else {
                    handlePurchase(
                      themeOption.id,
                      themeOption.price,
                      themeOption.name
                    );
                  }
                }}
                className={`flex-row items-center p-4 rounded-2xl border-2 ${
                  isActive
                    ? "border-zinc-900 dark:border-zinc-50 bg-zinc-50 dark:bg-zinc-900"
                    : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                }`}
              >
                {/* Color Preview */}
                <View
                  className="w-16 h-16 rounded-xl mr-4 items-center justify-center shadow-sm"
                  style={{ backgroundColor: themeOption.color }}
                >
                  {isActive && <Check size={24} color="#ffffff" />}
                </View>

                <View className="flex-1">
                  <ThemedText variant="subtitle" className="mb-1">
                    {themeOption.name}
                  </ThemedText>

                  {isPurchased ? (
                    <ThemedText className="text-zinc-500 text-sm">
                      {isActive ? "Active" : "Owned"}
                    </ThemedText>
                  ) : (
                    <View className="flex-row items-center">
                      <ThemedText className="font-plus-jakarta-sans-bold text-amber-500 mr-1">
                        {themeOption.price}
                      </ThemedText>
                      <ThemedText className="text-zinc-400 text-xs">
                        points
                      </ThemedText>
                    </View>
                  )}
                </View>

                {!isPurchased && (
                  <View className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full">
                    <Lock size={20} color={isDark ? "#a1a1aa" : "#71717a"} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
