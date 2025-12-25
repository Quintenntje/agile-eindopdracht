import { View } from "react-native";
import { ThemedText } from "../../components/ThemedText";

export default function MapScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-950 p-4">
      <ThemedText variant="title">Map</ThemedText>
      <ThemedText className="mt-4 text-center">
        Map view will be implemented here.
      </ThemedText>
    </View>
  );
}
