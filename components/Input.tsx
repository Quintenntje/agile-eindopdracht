import { TextInput, TextInputProps, useColorScheme, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...rest }: InputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="mb-4">
      {label && (
        <ThemedText variant="caption" className="mb-1.5 ml-1">
          {label}
        </ThemedText>
      )}
      <TextInput
        placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"} // zinc-500 / zinc-400
        className={`
            h-14 rounded-2xl px-4 
            bg-zinc-50 dark:bg-zinc-900 
            border border-zinc-200 dark:border-zinc-800 
            text-zinc-900 dark:text-zinc-50 font-plus-jakarta-sans
            focus:border-zinc-500 dark:focus:border-zinc-400
            ${error ? "border-red-500 dark:border-red-500" : ""}
            ${className}
        `}
        {...rest}
      />
      {error && (
        <ThemedText className="text-red-500 text-xs mt-1 ml-1">
          {error}
        </ThemedText>
      )}
    </View>
  );
}
