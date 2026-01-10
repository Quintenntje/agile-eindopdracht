import * as Clipboard from "expo-clipboard";
import { router, useFocusEffect } from "expo-router";
import { Check, Copy, Gift, Lock, Palette, Ticket, X } from "lucide-react-native";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ScreenContent } from "../components/ScreenContent";
import { ThemedText } from "../components/ThemedText";
import { StoreItem, useStore } from "../lib/contexts/StoreContext";
import { useTheme } from "../lib/contexts/ThemeContext";

export default function StoreScreen() {
  const { theme: currentTheme, setTheme, purchasedThemes } = useTheme();

  const {
    userPoints,
    purchaseItem,
    canAfford,
    refreshPoints,
    loading,
    themes,
    coupons,
    isItemPurchased,
    getPurchasedCoupons,
  } = useStore();

  const purchasedCoupons = getPurchasedCoupons();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Refresh points when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshPoints();
    }, [refreshPoints])
  );

  const handlePurchaseTheme = async (item: StoreItem) => {
    if (item.price === 0) {
      setTheme(item.id as any);
      return;
    }

    // Check if already purchased via ThemeContext (for backwards compatibility)
    if (purchasedThemes.includes(item.id as any)) {
      setTheme(item.id as any);
      return;
    }

    // Check if user can afford
    if (!canAfford(item.price)) {
      Alert.alert(
        "Not Enough Points",
        `You need ${item.price} points but only have ${userPoints} points.\n\nKeep reporting trash to earn more points!`,
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Purchase Theme",
      `Do you want to buy "${item.name}" for ${item.price} points?\n\nYour balance: ${userPoints} points`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Buy",
          onPress: async () => {
            const result = await purchaseItem(item);
            if (result.success) {
              Alert.alert("Success!", result.message, [
                {
                  text: "Activate Now",
                  onPress: () => setTheme(item.id as any),
                },
                { text: "Later" },
              ]);
            } else {
              Alert.alert("Purchase Failed", result.message);
            }
          },
        },
      ]
    );
  };

  const handlePurchaseCoupon = async (item: StoreItem) => {
    // Check if user can afford
    if (!canAfford(item.price)) {
      Alert.alert(
        "Not Enough Points",
        `You need ${item.price.toLocaleString()} points but only have ${userPoints.toLocaleString()} points.\n\nKeep reporting trash to earn more points!`,
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Redeem Coupon",
      `Do you want to redeem "${item.name}" for ${item.price.toLocaleString()} points?\n\nYour balance: ${userPoints.toLocaleString()} points`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Redeem",
          onPress: async () => {
            const result = await purchaseItem(item);
            if (result.success && result.code) {
              Alert.alert(
                "Coupon Redeemed! 🎉",
                `Your coupon code:\n\n${result.code}\n\nYou can view this code anytime in "My Coupons" below.`,
                [
                  {
                    text: "Copy Code",
                    onPress: () => Clipboard.setStringAsync(result.code!),
                  },
                  { text: "OK" },
                ]
              );
            } else {
              Alert.alert("Redemption Failed", result.message);
            }
          },
        },
      ]
    );
  };

  const showCouponCode = (code: string, name: string) => {
    Alert.alert(name, `Your coupon code:\n\n${code}`, [
      {
        text: "Copy Code",
        onPress: () => {
          Clipboard.setStringAsync(code);
          Alert.alert("Copied!", "Code copied to clipboard");
        },
      },
      { text: "OK" },
    ]);
  };

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white dark:bg-theme-secondary"
      >
        <ActivityIndicator size="large" className="color-theme-primary" />
        <ThemedText className="mt-4 text-theme-primary">
          Loading store...
        </ThemedText>
      </View>
    );
  }

  return (
    <ScreenContent
      className="bg-white dark:bg-theme-secondary"
      contentContainerStyle={{ padding: 0 }}
    >
      {/* Header */}
      <View className="p-4 flex-row justify-between items-center border-b border-theme-secondary dark:border-theme-primary/10 mt-8">
        <View className="flex-row items-center gap-2">
          <Gift size={24} color={isDark ? "#e8f3ee" : "#1a4d2e"} />
          <ThemedText variant="subtitle" className="text-theme-primary">
            Rewards Store
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 bg-theme-secondary dark:bg-theme-primary/20 rounded-full"
        >
          <X size={20} color={isDark ? "#e8f3ee" : "#1a4d2e"} />
        </TouchableOpacity>
      </View>

      {/* Points Balance */}
      <View className="mx-6 mt-4 p-4 bg-theme-primary/10 dark:bg-theme-primary/20 rounded-2xl flex-row items-center justify-between">
        <View>
          <ThemedText className="text-theme-primary/70 text-sm">
            Your Balance
          </ThemedText>
          <ThemedText variant="title" className="text-theme-primary text-2xl">
            {userPoints.toLocaleString()} pts
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={refreshPoints}
          className="bg-theme-primary dark:bg-theme-accent px-4 py-2 rounded-full"
        >
          <ThemedText className="text-white dark:text-theme-secondary font-plus-jakarta-sans-bold text-sm">
            Refresh
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View className="p-6">
        {/* Themes Section */}
        <View className="flex-row items-center gap-2 mb-4">
          <Palette size={20} color={isDark ? "#f2f9f6" : "#1a4d2e"} />
          <ThemedText variant="subtitle" className="text-theme-primary">
            Themes
          </ThemedText>
        </View>
        <ThemedText className="mb-4 text-theme-primary/70 text-sm">
          Customize your app appearance with unique color themes.
        </ThemedText>

        <View className="gap-3 mb-8">
          {themes.map((themeOption) => {
            const isPurchased =
              themeOption.price === 0 ||
              purchasedThemes.includes(themeOption.id as any) ||
              isItemPurchased(themeOption.id);
            const isActive = currentTheme === themeOption.id;
            const affordable = canAfford(themeOption.price);

            return (
              <TouchableOpacity
                key={themeOption.id}
                activeOpacity={0.8}
                onPress={() => {
                  if (isPurchased) {
                    setTheme(themeOption.id as any);
                  } else {
                    handlePurchaseTheme(themeOption);
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
                  className="w-14 h-14 rounded-xl mr-4 items-center justify-center shadow-sm"
                  style={{ backgroundColor: themeOption.color }}
                >
                  {isActive && <Check size={24} color="#ffffff" />}
                </View>

                <View className="flex-1">
                  <ThemedText
                    variant="subtitle"
                    className="mb-1 text-theme-primary text-base"
                  >
                    {themeOption.name}
                  </ThemedText>

                  {isPurchased ? (
                    <ThemedText className="text-theme-primary/60 text-sm">
                      {isActive ? "Active" : "Owned"}
                    </ThemedText>
                  ) : (
                    <View className="flex-row items-center">
                      <ThemedText
                        className={`font-plus-jakarta-sans-bold mr-1 ${
                          affordable ? "text-theme-accent" : "text-red-500"
                        }`}
                      >
                        {themeOption.price}
                      </ThemedText>
                      <ThemedText className="text-theme-primary/60 text-xs">
                        points
                      </ThemedText>
                      {!affordable && (
                        <ThemedText className="text-red-500 text-xs ml-2">
                          (need {themeOption.price - userPoints} more)
                        </ThemedText>
                      )}
                    </View>
                  )}
                </View>

                {!isPurchased && (
                  <View
                    className={`p-2 rounded-full ${
                      affordable
                        ? "bg-theme-accent/20"
                        : "bg-theme-secondary dark:bg-theme-primary/20"
                    }`}
                  >
                    <Lock
                      size={18}
                      color={
                        affordable
                          ? isDark
                            ? "#4ade80"
                            : "#1a4d2e"
                          : isDark
                            ? "#f2f9f6"
                            : "#71717a"
                      }
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Coupons Section */}
        <View className="flex-row items-center gap-2 mb-4">
          <Ticket size={20} color={isDark ? "#f2f9f6" : "#1a4d2e"} />
          <ThemedText variant="subtitle" className="text-theme-primary">
            Coupon Codes
          </ThemedText>
        </View>
        <ThemedText className="mb-4 text-theme-primary/70 text-sm">
          Redeem your points for real-world rewards and discounts.
        </ThemedText>

        <View className="gap-3 mb-8">
          {coupons.map((coupon) => {
            const affordable = canAfford(coupon.price);

            return (
              <TouchableOpacity
                key={coupon.id}
                activeOpacity={0.8}
                onPress={() => handlePurchaseCoupon(coupon)}
                className={`p-4 rounded-2xl border-2 ${
                  affordable
                    ? "border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20"
                    : "border-theme-secondary dark:border-theme-primary/10 bg-white dark:bg-theme-secondary"
                }`}
              >
                <View className="flex-row items-center">
                  {/* Coupon Icon */}
                  <View
                    className={`w-14 h-14 rounded-xl mr-4 items-center justify-center ${
                      affordable
                        ? "bg-amber-400"
                        : "bg-zinc-300 dark:bg-zinc-700"
                    }`}
                  >
                    <Ticket
                      size={24}
                      color={
                        affordable ? "#ffffff" : isDark ? "#a1a1aa" : "#71717a"
                      }
                    />
                  </View>

                  <View className="flex-1">
                    <ThemedText
                      variant="subtitle"
                      className="mb-1 text-theme-primary text-base"
                    >
                      {coupon.name}
                    </ThemedText>
                    <ThemedText className="text-theme-primary/60 text-xs mb-1">
                      {coupon.description}
                    </ThemedText>
                    <View className="flex-row items-center">
                      <ThemedText
                        className={`font-plus-jakarta-sans-bold mr-1 ${
                          affordable
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-red-500"
                        }`}
                      >
                        {coupon.price.toLocaleString()}
                      </ThemedText>
                      <ThemedText className="text-theme-primary/60 text-xs">
                        points
                      </ThemedText>
                      {!affordable && (
                        <ThemedText className="text-red-500 text-xs ml-2">
                          (need {(coupon.price - userPoints).toLocaleString()}{" "}
                          more)
                        </ThemedText>
                      )}
                    </View>
                  </View>

                  {/* Discount Badge */}
                  <View
                    className={`px-3 py-1.5 rounded-full ${
                      affordable
                        ? "bg-amber-500"
                        : "bg-zinc-400 dark:bg-zinc-600"
                    }`}
                  >
                    <ThemedText className="text-white font-plus-jakarta-sans-bold text-xs">
                      {coupon.discount}
                    </ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* My Coupons Section */}
        {purchasedCoupons.length > 0 && (
          <>
            <View className="flex-row items-center gap-2 mb-4">
              <Gift size={20} color={isDark ? "#4ade80" : "#16a34a"} />
              <ThemedText variant="subtitle" className="text-theme-primary">
                My Coupons
              </ThemedText>
            </View>
            <ThemedText className="mb-4 text-theme-primary/70 text-sm">
              Tap on a coupon to view and copy the code.
            </ThemedText>

            <View className="gap-3 mb-8">
              {purchasedCoupons.map((coupon, index) => (
                <TouchableOpacity
                  key={`${coupon.itemId}-${index}`}
                  activeOpacity={0.8}
                  onPress={() => showCouponCode(coupon.code, coupon.name)}
                  className="p-4 rounded-2xl border-2 border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                >
                  <View className="flex-row items-center">
                    <View className="w-14 h-14 rounded-xl mr-4 items-center justify-center bg-green-500">
                      <Check size={24} color="#ffffff" />
                    </View>

                    <View className="flex-1">
                      <ThemedText
                        variant="subtitle"
                        className="mb-1 text-theme-primary text-base"
                      >
                        {coupon.name}
                      </ThemedText>
                      <View className="flex-row items-center bg-theme-secondary/50 dark:bg-theme-primary/20 rounded px-2 py-1 self-start">
                        <ThemedText className="text-theme-primary font-plus-jakarta-sans-bold text-xs tracking-wider">
                          {coupon.code}
                        </ThemedText>
                      </View>
                    </View>

                    <View className="p-2 rounded-full bg-green-100 dark:bg-green-800/30">
                      <Copy size={18} color={isDark ? "#4ade80" : "#16a34a"} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

      </View>
    </ScreenContent>
  );
}
