import { Redirect } from "expo-router";
import { View } from "react-native";
import { useAuth } from "../lib/contexts/AuthContext";

export default function Index() {
  const { session, user, loading } = useAuth();

  if (loading) {
    return <View className="flex-1 bg-white dark:bg-zinc-950" />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  const role = user?.user_metadata?.role || "user";

  if (role === "admin") {
    // @ts-ignore
    return <Redirect href="/(admin-tabs)" />;
  }

  return <Redirect href="/(tabs)" />;
}
