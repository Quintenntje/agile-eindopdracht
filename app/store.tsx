import * as Clipboard from "expo-clipboard";
import { router, useFocusEffect } from "expo-router";
import {
  Check,
  Copy,
  Gift,
  Lock,
  Palette,
  Ticket,
  X,
} from "lucide-react-native";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
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
        "Onvoldoende Punten",
        `Je hebt ${item.price} punten nodig maar hebt er slechts ${userPoints}.\n\nBlijf afval rapporteren om meer punten te verdienen!`,
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Thema Kopen",
      `Wil je "${item.name}" kopen voor ${item.price} punten?\n\nJe saldo: ${userPoints} punten`,
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Kopen",
          onPress: async () => {
            const result = await purchaseItem(item);
            if (result.success) {
              Alert.alert("Succes!", result.message, [
                {
                  text: "Nu Activeren",
                  onPress: () => setTheme(item.id as any),
                },
                { text: "Later" },
              ]);
            } else {
              Alert.alert("Aankoop Mislukt", result.message);
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
        "Onvoldoende Punten",
        `Je hebt ${item.price.toLocaleString()} punten nodig maar hebt er slechts ${userPoints.toLocaleString()}.\n\nBlijf afval rapporteren om meer punten te verdienen!`,
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Coupon Inwisselen",
      `Wil je "${item.name}" inwisselen voor ${item.price.toLocaleString()} punten?\n\nJe saldo: ${userPoints.toLocaleString()} punten`,
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Inwisselen",
          onPress: async () => {
            const result = await purchaseItem(item);
            if (result.success && result.code) {
              Alert.alert(
                "Coupon Ingewisseld! 🎉",
                `Je couponcode:\n\n${result.code}\n\nJe kunt deze code altijd bekijken in "Mijn Coupons" hieronder.`,
                [
                  {
                    text: "Code Kopiëren",
                    onPress: () => Clipboard.setStringAsync(result.code!),
                  },
                  { text: "OK" },
                ]
              );
            } else {
              Alert.alert("Inwisselen Mislukt", result.message);
            }
          },
        },
      ]
    );
  };

  const showCouponCode = (code: string, name: string) => {
    Alert.alert(name, `Je couponcode:\n\n${code}`, [
      {
        text: "Code Kopiëren",
        onPress: () => {
          Clipboard.setStringAsync(code);
          Alert.alert("Gekopieerd!", "Code naar klembord gekopieerd");
        },
      },
      { text: "OK" },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-theme-secondary">
        <ActivityIndicator size="large" className="color-theme-primary" />
        <ThemedText className="mt-4 text-theme-primary">
          Winkel laden...
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
          <Gift size={24} color={isDark ? "#96CA64" : "#96CA64"} />
          <ThemedText variant="subtitle" className="text-theme-primary">
            Beloningen Winkel
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 bg-theme-secondary dark:bg-theme-primary/20 rounded-full"
        >
          <X size={20} color={isDark ? "#fafafa" : "#18181b"} />
        </TouchableOpacity>
      </View>

      {/* Points Balance */}
      <View className="mx-6 mt-4 p-4 bg-theme-primary/10 dark:bg-theme-primary/20 rounded-2xl flex-row items-center justify-between">
        <View>
          <ThemedText className="text-theme-primary/70 text-sm">
            Jouw Saldo
          </ThemedText>
          <ThemedText variant="title" className="text-theme-primary text-2xl">
            {userPoints.toLocaleString()} ptn
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={refreshPoints}
          className="bg-theme-primary dark:bg-theme-accent px-4 py-2 rounded-full"
        >
          <ThemedText className="text-white dark:text-theme-secondary font-plus-jakarta-sans-bold text-sm">
            Vernieuwen
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View className="p-6">
        {/* Themes Section */}
        <View className="flex-row items-center gap-2 mb-4">
          <Palette size={20} color={isDark ? "#f2f9f6" : "#1a4d2e"} />
          <ThemedText variant="subtitle" className="text-theme-primary">
            Thema&apos;s
          </ThemedText>
        </View>
        <ThemedText className="mb-4 text-theme-primary/70 text-sm">
          Pas het uiterlijk van je app aan met unieke kleurthema&apos;s.
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
                      {isActive ? "Actief" : "In bezit"}
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
                        punten
                      </ThemedText>
                      {!affordable && (
                        <ThemedText className="text-red-500 text-xs ml-2">
                          (nog {themeOption.price - userPoints} nodig)
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
          <Ticket size={20} color={isDark ? "#96CA64" : "#96CA64"} />
          <ThemedText variant="subtitle" className="text-theme-primary">
            Couponcodes
          </ThemedText>
        </View>
        <ThemedText className="mb-4 text-theme-primary/70 text-sm">
          Wissel je punten in voor echte beloningen en kortingen.
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
                        punten
                      </ThemedText>
                      {!affordable && (
                        <ThemedText className="text-red-500 text-xs ml-2">
                          (nog {(coupon.price - userPoints).toLocaleString()}{" "}
                          nodig)
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
              <Gift size={20} color={isDark ? "#96CA64" : "#96CA64"} />
              <ThemedText variant="subtitle" className="text-theme-primary">
                Mijn Coupons
              </ThemedText>
            </View>
            <ThemedText className="mb-4 text-theme-primary/70 text-sm">
              Tik op een coupon om de code te bekijken en te kopiëren.
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
                      <Copy size={18} color={isDark ? "#96CA64" : "#96CA64"} />
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
