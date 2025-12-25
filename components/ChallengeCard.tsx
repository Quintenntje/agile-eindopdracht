import { Calendar, Clock } from "lucide-react-native";
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

  const getIcon = () => {
    const color = isDark ? "#a1a1aa" : "#71717a"; // zinc-400 / zinc-500
    switch (type) {
      case "daily":
        return <Clock size={20} color={color} />; // Changed from Sun to Clock as Sun might not be in the exact set or preferred
      case "weekly":
        return <Calendar size={20} color={color} />;
      default:
        return <Target size={20} color={color} />; // Fallback
    }
  };

  // Need to import Target if used default.
  // Actually let's just use specific icons or generic ones.
  // Let's use simple logic: Daily=Clock, Weekly=Calendar, else=CircleCheck for now or similar.

  return (
    <View
      className={`bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-4 ${className}`}
      {...rest}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center space-x-2 mb-1">
            <View className="flex-row items-center border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-0.5">
              <ThemedText className="text-xs uppercase font-plus-jakarta-sans-medium text-zinc-500 dark:text-zinc-400 mr-2">
                {type}
              </ThemedText>
              {type === "daily" && (
                <Clock size={12} color={isDark ? "#a1a1aa" : "#71717a"} />
              )}
              {type === "weekly" && (
                <Calendar size={12} color={isDark ? "#a1a1aa" : "#71717a"} />
              )}
            </View>
            {status === "completed" && (
              <View className="flex-row items-center bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-md">
                <ThemedText className="text-xs text-green-700 dark:text-green-400 font-plus-jakarta-sans-medium">
                  Done
                </ThemedText>
              </View>
            )}
          </View>
          <ThemedText variant="subtitle" className="mb-1">
            {title}
          </ThemedText>
          <ThemedText variant="caption">{description}</ThemedText>
        </View>
        <View className="items-end">
          <ThemedText className="font-plus-jakarta-sans-bold text-amber-600 dark:text-amber-500 text-lg">
            +{points} pts
          </ThemedText>
        </View>
      </View>

      <View className="mt-3">
        <View className="flex-row justify-between mb-1">
          <ThemedText className="text-xs text-zinc-500 dark:text-zinc-400">
            Progress
          </ThemedText>
          <ThemedText className="text-xs text-zinc-500 dark:text-zinc-400 font-plus-jakarta-sans-medium">
            {currentProgress} / {goalTarget}
          </ThemedText>
        </View>
        <View className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <View
            className="h-full bg-zinc-900 dark:bg-zinc-50 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </View>
      </View>
    </View>
  );
}
