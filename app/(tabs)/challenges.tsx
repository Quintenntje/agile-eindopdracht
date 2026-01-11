import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ChallengeCard,
  ChallengeProps,
  ChallengeStatus,
  ChallengeType,
} from "../../components/ChallengeCard";
import { ScreenContent } from "../../components/ScreenContent";
import { ThemedText } from "../../components/ThemedText";
import { useAuth } from "../../lib/contexts/AuthContext";
import { supabase } from "../../lib/utils/supabase";

type UserChallenge = {
  id: string;
  challenge_id: string;
  current_progress: number;
  status: ChallengeStatus;
  challenges: {
    id: string;
    title: string;
    description: string;
    type: ChallengeType;
    points_reward: number;
    goal_target: number;
  };
};

type FilterType = "all" | "daily" | "weekly" | "one_time";

export default function ChallengesScreen() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchChallenges = useCallback(async () => {
    if (!user) return;

    // Sync challenges progress first
    await supabase.rpc("sync_user_challenges", { p_user_id: user.id });

    const { data, error } = await supabase
      .from("user_challenges")
      .select(
        `
        id,
        challenge_id,
        current_progress,
        status,
        challenges (
          id,
          title,
          description,
          type,
          points_reward,
          goal_target
        )
      `
      )
      .eq("user_id", user.id)
      .order("status", { ascending: true });

    if (error) {
      console.error("Error fetching challenges:", error);
      return;
    }

    const mapped: ChallengeProps[] = (data as unknown as UserChallenge[]).map(
      (uc) => ({
        id: uc.id,
        title: uc.challenges.title,
        description: uc.challenges.description,
        points: uc.challenges.points_reward,
        type: uc.challenges.type,
        currentProgress: uc.current_progress,
        goalTarget: uc.challenges.goal_target,
        status: uc.status,
      })
    );

    setChallenges(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchChallenges();
    setRefreshing(false);
  }, [fetchChallenges]);

  const handleClaim = async (userChallengeId: string) => {
    setClaimingId(userChallengeId);

    const { data, error } = await supabase.rpc("claim_challenge_reward", {
      p_user_challenge_id: userChallengeId,
    });

    setClaimingId(null);

    if (error) {
      Alert.alert("Error", "Failed to claim reward. Please try again.");
      console.error("Claim error:", error);
      return;
    }

    if (data?.success) {
      Alert.alert("Beloning Geclaimd!", `Je hebt ${data.points_awarded} punten verdiend!`);
      fetchChallenges();
    } else {
      Alert.alert("Fout", data?.error || "Beloning claimen mislukt");
    }
  };

  const filterChallenges = (list: ChallengeProps[]) => {
    if (filter === "all") return list;
    return list.filter((c) => c.type === filter);
  };

  const activeChallenges = filterChallenges(
    challenges.filter((c) => c.status === "in_progress")
  );
  const completedChallenges = filterChallenges(
    challenges.filter((c) => c.status === "completed")
  );
  const claimedChallenges = filterChallenges(
    challenges.filter((c) => c.status === "claimed")
  );

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Alles" },
    { key: "daily", label: "Dagelijks" },
    { key: "weekly", label: "Wekelijks" },
    { key: "one_time", label: "Mijlpaal" },
  ];

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-theme-secondary items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScreenContent
      className="bg-white dark:bg-theme-secondary pt-2"
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ThemedText variant="title" className="mb-2 mt-8 text-theme-primary">
        Challenges
      </ThemedText>
      <ThemedText variant="body" className="mb-4 text-theme-primary/70">
        Complete challenges to earn points and rewards.
      </ThemedText>

      {/* Filter Buttons */}
      <View className="flex-row gap-2 mb-6">
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full ${
              filter === f.key
                ? "bg-theme-primary dark:bg-theme-accent"
                : "bg-theme-secondary/50 dark:bg-theme-primary/10"
            }`}
            activeOpacity={0.7}
          >
            <ThemedText
              className={`text-xs font-plus-jakarta-sans-bold ${
                filter === f.key
                  ? "text-white dark:text-theme-secondary"
                  : "text-theme-primary"
              }`}
            >
              {f.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {completedChallenges.length > 0 && (
        <>
          <ThemedText variant="subtitle" className="mb-4">
            Klaar om te Claimen
          </ThemedText>
          {completedChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              {...challenge}
              onClaim={handleClaim}
              isClaiming={claimingId === challenge.id}
            />
          ))}
        </>
      )}

      <ThemedText variant="subtitle" className="mb-4 mt-2">
        Active ({activeChallenges.length})
      </ThemedText>

      {activeChallenges.length === 0 ? (
        <ThemedText variant="body" className="text-theme-primary/50 mb-4">
          No active challenges available.
        </ThemedText>
      ) : (
        activeChallenges.map((challenge) => (
          <ChallengeCard key={challenge.id} {...challenge} />
        ))
      )}

      {claimedChallenges.length > 0 && (
        <>
          <ThemedText variant="subtitle" className="mb-4 mt-4">
            Geclaimd ({claimedChallenges.length})
          </ThemedText>
          {claimedChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} {...challenge} />
          ))}
        </>
      )}
    </ScreenContent>
  );
}
