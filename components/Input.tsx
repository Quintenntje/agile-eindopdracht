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
        placeholderTextColor={isDark ? "#f2f9f6" : "#1a4d2e"}
        className={`
            h-14 rounded-2xl px-4 
            bg-theme-secondary/20 dark:bg-theme-primary/5 
            border border-theme-secondary dark:border-theme-primary/10 
            text-theme-primary font-plus-jakarta-sans
            focus:border-theme-accent
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
