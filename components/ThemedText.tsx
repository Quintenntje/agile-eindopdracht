import { Text, TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  variant?: "body" | "title" | "subtitle" | "link" | "caption";
};

export function ThemedText({
  style,
  variant = "body",
  className,
  ...rest
}: ThemedTextProps) {
  let variantStyles = "";

  switch (variant) {
    case "body":
      variantStyles = "text-base font-plus-jakarta-sans text-theme-primary";
      break;
    case "title":
      variantStyles = "text-3xl font-plus-jakarta-sans-bold text-theme-primary";
      break;
    case "subtitle":
      variantStyles =
        "text-xl font-plus-jakarta-sans-medium text-theme-primary";
      break;
    case "link":
      variantStyles =
        "text-base font-plus-jakarta-sans text-blue-600 dark:text-blue-400 underline";
      break;
    case "caption":
      variantStyles =
        "text-sm font-plus-jakarta-sans text-theme-primary opacity-70";
      break;
  }

  return (
    <Text className={`${variantStyles} ${className}`} style={style} {...rest} />
  );
}
