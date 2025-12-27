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
import { getThemeClass, useTheme } from "../lib/contexts/ThemeContext";

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

  // Compute theme class (if currentTheme is default, no class; else theme-{currentTheme})
  const themeClass = getThemeClass(currentTheme);

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
    <View
      className={`flex-1 bg-white dark:bg-theme-secondary pt-2 ${themeClass}`}
    >
      <View className="p-4 flex-row justify-between items-center border-b border-theme-secondary dark:border-theme-primary/10 mt-8">
        <View className="flex-row items-center gap-2">
          <Palette size={24} color={isDark ? "#f2f9f6" : "#1a4d2e"} />
          <ThemedText variant="subtitle" className="text-theme-primary">
            Theme Store
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 bg-theme-secondary dark:bg-theme-primary/20 rounded-full"
        >
          <X size={20} color={isDark ? "#f2f9f6" : "#1a4d2e"} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6">
        <ThemedText className="mb-6 text-theme-primary/70">
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
                    ? "border-theme-accent bg-theme-secondary/30 dark:bg-theme-primary/20"
                    : "border-theme-secondary dark:border-theme-primary/10 bg-white dark:bg-theme-secondary"
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
                  <ThemedText
                    variant="subtitle"
                    className="mb-1 text-theme-primary"
                  >
                    {themeOption.name}
                  </ThemedText>

                  {isPurchased ? (
                    <ThemedText className="text-theme-primary/60 text-sm">
                      {isActive ? "Active" : "Owned"}
                    </ThemedText>
                  ) : (
                    <View className="flex-row items-center">
                      <ThemedText className="font-plus-jakarta-sans-bold text-theme-accent mr-1">
                        {themeOption.price}
                      </ThemedText>
                      <ThemedText className="text-theme-primary/60 text-xs">
                        points
                      </ThemedText>
                    </View>
                  )}
                </View>

                {!isPurchased && (
                  <View className="bg-theme-secondary dark:bg-theme-primary/20 p-2 rounded-full">
                    <Lock size={20} color={isDark ? "#f2f9f6" : "#1a4d2e"} />
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
