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
      variantStyles = "text-base font-plus-jakarta-sans text-zinc-900 dark:text-zinc-50";
      break;
    case "title":
      variantStyles =
        "text-3xl font-plus-jakarta-sans-bold text-zinc-900 dark:text-zinc-50";
      break;
    case "subtitle":
      variantStyles =
        "text-xl font-plus-jakarta-sans-medium text-zinc-800 dark:text-zinc-100";
      break;
    case "link":
      variantStyles = "text-base font-plus-jakarta-sans text-blue-600 dark:text-blue-400 underline";
      break;
    case "caption":
      variantStyles = "text-sm font-plus-jakarta-sans text-zinc-500 dark:text-zinc-400";
      break;
  }

  return (
    <Text
      className={`${variantStyles} ${className}`}
      style={style}
      {...rest}
    />
  );
}
