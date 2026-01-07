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
      baseStyles += " bg-theme-primary dark:bg-theme-accent";
      textStyles += " text-theme-primary-fg dark:text-theme-primary-fg";
      break;
    case "secondary":
      baseStyles += " bg-theme-secondary dark:bg-theme-primary/20";
      textStyles += " text-theme-primary";
      break;
    case "outline":
      baseStyles +=
        " border border-theme-secondary dark:border-theme-primary/20 bg-transparent";
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
      return isDark ? "#1a4d2e" : "#f2f9f6"; // theme-primary-fg inverted for dark
    }
    return isDark ? "#f2f9f6" : "#1a4d2e"; // theme-primary
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
