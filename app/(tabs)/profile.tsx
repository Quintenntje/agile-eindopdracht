import { View } from "react-native";
import { ThemedText } from "../../components/ThemedText";

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-950 p-4">
      <ThemedText variant="title">Profile</ThemedText>
      <ThemedText className="mt-4 text-center">
        Your stats and rewards.
      </ThemedText>
    </View>
  );
}
