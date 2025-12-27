import { ChallengeCard, ChallengeProps } from "../../components/ChallengeCard";
import { ScreenContent } from "../../components/ScreenContent";
import { ThemedText } from "../../components/ThemedText";

const DEMO_CHALLENGES: ChallengeProps[] = [
  {
    title: "Morning Patroller",
    description: "Report 3 trash items before 12:00 PM.",
    points: 150,
    type: "daily",
    currentProgress: 1,
    goalTarget: 3,
    status: "in_progress",
  },
  {
    title: "Weekly Warrior",
    description: "Collect 500 points this week.",
    points: 500,
    type: "weekly",
    currentProgress: 350,
    goalTarget: 500,
    status: "in_progress",
  },
  {
    title: "Park Ranger",
    description: "Report trash in 3 different parks.",
    points: 300,
    type: "seasonal",
    currentProgress: 3,
    goalTarget: 3,
    status: "completed",
  },
  {
    title: "First Steps",
    description: "Make your first report.",
    points: 100,
    type: "one_time",
    currentProgress: 1,
    goalTarget: 1,
    status: "claimed",
  },
];

export default function ChallengesScreen() {
  return (
    <ScreenContent
      className="bg-white dark:bg-zinc-950 pt-2"
      contentContainerStyle={{ padding: 16 }}
    >
      <ThemedText variant="title" className="mb-2 mt-8">
        Challenges
      </ThemedText>
      <ThemedText
        variant="body"
        className="mb-6 text-zinc-500 dark:text-zinc-400"
      >
        Complete challenges to earn points and rewards.
      </ThemedText>

      <ThemedText variant="subtitle" className="mb-4">
        Active
      </ThemedText>

      {DEMO_CHALLENGES.filter((c) => c.status === "in_progress").map(
        (challenge, index) => (
          <ChallengeCard key={index} {...challenge} />
        )
      )}

      <ThemedText variant="subtitle" className="mb-4 mt-4">
        Completed
      </ThemedText>

      {DEMO_CHALLENGES.filter((c) => c.status !== "in_progress").map(
        (challenge, index) => (
          <ChallengeCard key={index} {...challenge} />
        )
      )}
    </ScreenContent>
  );
}
