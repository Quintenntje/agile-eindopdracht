import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
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
  let baseStyles = "h-12 rounded-xl flex-row items-center justify-center px-4";
  let textStyles = "text-base font-plus-jakarta-sans-medium";

  switch (variant) {
    case "primary":
      baseStyles += " bg-zinc-900 dark:bg-zinc-50";
      textStyles += " text-white dark:text-zinc-900";
      break;
    case "secondary":
      baseStyles += " bg-zinc-100 dark:bg-zinc-800";
      textStyles += " text-zinc-900 dark:text-zinc-50";
      break;
    case "outline":
      baseStyles +=
        " border border-zinc-200 dark:border-zinc-700 bg-transparent";
      textStyles += " text-zinc-900 dark:text-zinc-50";
      break;
    case "ghost":
      baseStyles += " bg-transparent";
      textStyles += " text-zinc-900 dark:text-zinc-50";
      break;
  }

  if (disabled || isLoading) {
    baseStyles += " opacity-50";
  }

  return (
    <TouchableOpacity
      className={`${baseStyles} ${className}`}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#ffffff" : "#71717a"} // Simplified color choice for loader
        />
      ) : (
        <Text className={textStyles}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
