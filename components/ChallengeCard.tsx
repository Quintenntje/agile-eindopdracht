import { Calendar, Clock, Leaf } from "lucide-react-native";
import { useColorScheme, View, ViewProps } from "react-native";
import { ThemedText } from "./ThemedText";

export type ChallengeType = "daily" | "weekly" | "seasonal" | "one_time";

export type ChallengeStatus = "in_progress" | "completed" | "claimed";

export interface ChallengeProps extends ViewProps {
  title: string;
  description: string;
  points: number;
  type: ChallengeType;
  currentProgress: number;
  goalTarget: number;
  status: ChallengeStatus;
}

export function ChallengeCard({
  title,
  description,
  points,
  type,
  currentProgress,
  goalTarget,
  status,
  className,
  ...rest
}: ChallengeProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const progressPercentage = Math.min(
    (currentProgress / goalTarget) * 100,
    100
  );

  return (
    <View
      className={`bg-white dark:bg-theme-secondary p-4 rounded-2xl border border-theme-secondary dark:border-theme-primary/20 mb-4 shadow-sm ${className}`}
      {...rest}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center space-x-2 mb-1">
            <View className="flex-row items-center bg-theme-secondary/50 dark:bg-theme-primary/10 rounded-full px-3 py-1">
              <ThemedText className="text-xs uppercase font-plus-jakarta-sans-bold text-theme-primary mr-2">
                {type}
              </ThemedText>
              {type === "daily" && (
                <Clock size={12} color={isDark ? "#e8f3ee" : "#1a4d2e"} />
              )}
              {type === "weekly" && (
                <Calendar size={12} color={isDark ? "#e8f3ee" : "#1a4d2e"} />
              )}
              {type !== "daily" && type !== "weekly" && (
                <Leaf size={12} color={isDark ? "#e8f3ee" : "#1a4d2e"} />
              )}
            </View>
            {status === "completed" && (
              <View className="flex-row items-center bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                <ThemedText className="text-xs text-green-700 dark:text-green-400 font-plus-jakarta-sans-bold">
                  Done
                </ThemedText>
              </View>
            )}
          </View>
          <ThemedText
            variant="subtitle"
            className="mb-1 text-theme-primary font-plus-jakarta-sans-bold"
          >
            {title}
          </ThemedText>
          <ThemedText variant="caption" className="text-theme-primary/70">
            {description}
          </ThemedText>
        </View>
        <View className="items-end bg-theme-secondary/30 dark:bg-theme-primary/10 p-2 rounded-lg">
          <ThemedText className="font-plus-jakarta-sans-bold text-theme-accent text-lg">
            +{points} pts
          </ThemedText>
        </View>
      </View>

      <View className="mt-3">
        <View className="flex-row justify-between mb-1">
          <ThemedText className="text-xs text-theme-primary/70">
            Progress
          </ThemedText>
          <ThemedText className="text-xs text-theme-primary font-plus-jakarta-sans-bold">
            {currentProgress} / {goalTarget}
          </ThemedText>
        </View>
        <View className="h-3 bg-theme-secondary dark:bg-theme-primary/20 rounded-full overflow-hidden">
          <View
            className="h-full bg-theme-primary dark:bg-theme-accent rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </View>
      </View>
    </View>
  );
}
