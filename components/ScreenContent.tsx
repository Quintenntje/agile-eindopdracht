import { ScrollView, ScrollViewProps, View, ViewProps } from "react-native";

interface ScreenContentProps extends ScrollViewProps {
  children: React.ReactNode;
  contentContainerClassName?: string;
 
  scroll?: boolean;
}

export function ScreenContent({
  children,
  contentContainerClassName,
  className,
  scroll = true,
  contentContainerStyle,
  ...rest
}: ScreenContentProps) {

  const defaultPaddingBottom = 120;

  if (!scroll) {
    return (
      <View
        className={`flex-1 bg-white dark:bg-zinc-950 px-6 pt-4 ${className}`}
        {...(rest as ViewProps)}
      >
        <View style={{ paddingBottom: defaultPaddingBottom }}>{children}</View>
      </View>
    );
  }

  return (
    <ScrollView
      className={`flex-1 bg-white dark:bg-zinc-900 ${className}`}
      contentContainerStyle={[
        { paddingBottom: defaultPaddingBottom },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}
