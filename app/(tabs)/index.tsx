import { View } from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { useAuth } from "../../lib/contexts/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();
  // Check both metadata locations just to be safe, though usually it's user_metadata for custom fields
  const isAdmin =
    user?.user_metadata?.role === "admin" ||
    user?.app_metadata?.role === "admin";

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-950 p-4">
      <ThemedText variant="title">Cleanup Ghent</ThemedText>

      {isAdmin && (
        <ThemedText
          variant="subtitle"
          className="mt-2 text-indigo-600 dark:text-indigo-400 font-plus-jakarta-sans-bold"
        >
          Hi Admin
        </ThemedText>
      )}

      <ThemedText variant="subtitle" className="mt-2 text-center">
        Welcome to the cleanup app!
      </ThemedText>
      <ThemedText className="mt-4 text-center">
        Start by reporting trash or viewing the map.
      </ThemedText>
    </View>
  );
}
