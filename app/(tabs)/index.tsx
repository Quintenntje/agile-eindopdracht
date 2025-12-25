import { View } from "react-native";
import { ThemedText } from "../../components/ThemedText";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-950 p-4">
      <ThemedText variant="title">Cleanup Ghent</ThemedText>
      <ThemedText variant="subtitle" className="mt-2 text-center">
        Welcome to the cleanup app!
      </ThemedText>
      <ThemedText className="mt-4 text-center">
        Start by reporting trash or viewing the map.
      </ThemedText>
    </View>
  );
}
