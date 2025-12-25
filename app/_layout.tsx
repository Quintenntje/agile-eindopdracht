import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "./global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "PlusJakartaSans-Regular": require("../assets/fonts/PlusJakartaSansRegular.ttf"),
    "PlusJakartaSans-Medium": require("../assets/fonts/PlusJakartaSansMedium.ttf"),
    "PlusJakartaSans-Bold": require("../assets/fonts/PlusJakartaSansBold.ttf"),
    // Android font names (same files, different names)
    PlusJakartaSansRegular: require("../assets/fonts/PlusJakartaSansRegular.ttf"),
    PlusJakartaSansMedium: require("../assets/fonts/PlusJakartaSansMedium.ttf"),
    PlusJakartaSansBold: require("../assets/fonts/PlusJakartaSansBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="report"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
