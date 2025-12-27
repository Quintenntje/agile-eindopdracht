import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";
import { AuthProvider, useAuth } from "../lib/contexts/AuthContext";
import { ThemeProvider, useTheme } from "../lib/contexts/ThemeContext";
import "./global.css";

SplashScreen.preventAutoHideAsync();

// Wrapper component to access theme context
function AppContent() {
  const { session, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return null;
  }

  // Apply theme class to root view
  const themeClass = theme === "default" ? "" : `theme-${theme}`;

  return (
    <View style={{ flex: 1 }} className={themeClass}>
      {!session ? (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
        </Stack>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="report"
            options={{
              presentation: "modal",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="store"
            options={{
              presentation: "modal",
              headerShown: false,
            }}
          />
        </Stack>
      )}
    </View>
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
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
