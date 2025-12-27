import { ScreenContent } from "../../components/ScreenContent";
import { ThemedText } from "../../components/ThemedText";

export default function LeaderboardScreen() {
  return (
    <ScreenContent className="items-center justify-center bg-white dark:bg-zinc-950">
      <ThemedText variant="title">Leaderboard</ThemedText>
      <ThemedText className="mt-4 text-center">
        See who has gathered the most points!
      </ThemedText>
    </ScreenContent>
  );
}
