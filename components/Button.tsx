import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  useColorScheme,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  isLoading?: boolean;
  label: string;
}

export function Button({
  variant = "primary",
  isLoading = false,
  label,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  
  let baseStyles =
    "h-14 rounded-full flex-row items-center justify-center px-6 shadow-sm";
  let textStyles = "text-base font-plus-jakarta-sans-medium";

  switch (variant) {
    case "primary":
      baseStyles += " bg-theme-accent";
      textStyles += " text-theme-secondary-fg";
      break;
    case "secondary":
      baseStyles += " bg-theme-secondary dark:bg-theme-primary/20";
      textStyles += " text-theme-primary";
      break;
    case "outline":
      baseStyles +=
        " border border-theme-secondary-fg dark:border-theme-secondary-fg bg-transparent";
      textStyles += " text-theme-primary";
      break;
    case "ghost":
      baseStyles += " bg-transparent";
      textStyles += " text-theme-primary";
      break;
  }

  if (disabled || isLoading) {
    baseStyles += " opacity-50";
  }

  // Determine ActivityIndicator color based on variant and theme
  const getActivityIndicatorColor = () => {
    if (variant === "primary") {
      return isDark ? "#27272a" : "#f4f4f5"; // theme-secondary-fg
    }
    return isDark ? "#fafafa" : "#18181b"; // theme-primary (default theme)
  };

  return (
    <TouchableOpacity
      className={`${baseStyles} ${className}`}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={getActivityIndicatorColor()} />
      ) : (
        <Text className={textStyles}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
