import { useState } from "react";
import { TextInput, TextInputProps, useColorScheme, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, onFocus, onBlur, ...rest }: InputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View className="mb-4">
      {label && (
        <ThemedText variant="caption" className="mb-1.5 ml-1">
          {label}
        </ThemedText>
      )}
      <TextInput
        placeholderTextColor={isDark ? "#a1a1aa" : "#71717a"}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`
            h-14 rounded-2xl px-4 
            bg-theme-secondary/20 dark:bg-theme-primary/5 
            border ${isFocused ? "border-theme-accent" : "border-theme-secondary-fg dark:border-theme-secondary-fg"}
            text-theme-primary font-plus-jakarta-sans
            placeholder:text-zinc-400 dark:placeholder:text-zinc-500
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
