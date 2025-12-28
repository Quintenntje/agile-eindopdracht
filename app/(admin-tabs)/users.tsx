import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { ScreenContent } from "../../components/ScreenContent";
import { ThemedText } from "../../components/ThemedText";
import { supabase } from "../../lib/utils/supabase";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
};

export default function AdminUsersScreen() {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setProfiles(data || []);
      } catch (error) {
        console.error("Error fetching (admin-tabs) profiles:", error);
      } finally {
        // loading state removed
      }
    };

    fetchProfiles();
  }, []);

  return (
    <ScreenContent>
      <View className="mb-6 mt-20 px-4">
        <ThemedText variant="title" className="text-3xl">
          Users
        </ThemedText>
        <ThemedText className="text-zinc-500 dark:text-zinc-400">
          Manage platform users
        </ThemedText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {profiles.map((profile) => (
          <View
            key={profile.id}
            className="bg-white dark:bg-zinc-900 p-4 rounded-2xl mb-3 shadow-sm border border-zinc-100 dark:border-zinc-800 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full items-center justify-center">
                <ThemedText className="font-plus-jakarta-sans-bold text-indigo-600 dark:text-indigo-400">
                  {(
                    profile.full_name?.[0] ||
                    profile.email?.[0] ||
                    "?"
                  ).toUpperCase()}
                </ThemedText>
              </View>
              <View>
                <ThemedText className="font-plus-jakarta-sans-bold text-zinc-900 dark:text-zinc-100">
                  {profile.full_name || "Unknown User"}
                </ThemedText>
                <ThemedText className="text-xs text-zinc-500 dark:text-zinc-400">
                  {profile.email || "No email"}
                </ThemedText>
              </View>
            </View>
            <View
              className={`px-2 py-1 rounded-md ${
                profile.role === "admin"
                  ? "bg-indigo-100 dark:bg-indigo-900/30"
                  : "bg-zinc-100 dark:bg-zinc-800"
              }`}
            >
              <ThemedText
                className={`text-xs font-plus-jakarta-sans-bold uppercase ${
                  profile.role === "admin"
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {profile.role}
              </ThemedText>
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenContent>
  );
}
