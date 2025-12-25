import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../lib/contexts/AuthContext";
import "./global.css";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!session) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
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
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
