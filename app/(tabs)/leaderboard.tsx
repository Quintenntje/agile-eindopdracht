import { ScreenContent } from "../../components/ScreenContent";
import { ThemedText } from "../../components/ThemedText";

export default function LeaderboardScreen() {
  return (
    <ScreenContent className="items-center justify-center bg-white dark:bg-theme-secondary">
      <ThemedText variant="title" className="text-theme-primary">
        Leaderboard
      </ThemedText>
      <ThemedText className="mt-4 text-center text-theme-primary/70">
        See who has gathered the most points!
      </ThemedText>
    </ScreenContent>
  );
}
