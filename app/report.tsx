import { router } from "expo-router";
import { X } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { ThemedText } from "../components/ThemedText";

export default function ReportScreen() {
  return (
    <View className="flex-1 bg-white dark:bg-zinc-950 p-4">
      <View className="flex-row justify-between items-center mb-6">
        <ThemedText variant="title">Report Trash</ThemedText>
        <Pressable onPress={() => router.back()} className="p-2">
          <X size={24} color="#52525b" />
        </Pressable>
      </View>
      <ThemedText>Take a picture and report location here.</ThemedText>
    </View>
  );
}
