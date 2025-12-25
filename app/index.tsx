import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center gap-4 p-4">
      <Text className="text-red-500 text-2xl font-bold">
        Befault font (bold)
      </Text>

      <Text className="font-plus-jakarta-sans text-blue-500 text-2xl">
        Plus Jakarta Sans Regular
      </Text>

      <Text className="font-plus-jakarta-sans-medium text-green-500 text-2xl">
        Plus Jakarta Sans Medium
      </Text>

      <Text className="font-plus-jakarta-sans-bold text-purple-500 text-2xl">
        Plus Jakarta Sans Bold
      </Text>
    </View>
  );
}
