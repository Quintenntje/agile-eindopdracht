import { router } from "expo-router";
import {
  Calendar,
  Check,
  ClipboardList,
  LogOut,
  MapPin,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { ScreenContent } from "../../components/ScreenContent";
import { ThemedText } from "../../components/ThemedText";
import { useAuth } from "../../lib/contexts/AuthContext";
import { supabase } from "../../lib/utils/supabase";

type TrashReport = {
  id: string;
  image: string; // Changed from image_url
  lat: number; // Changed from latitude
  long: number; // Changed from longitude
  description: string | null;
  created_at: string;
  status: "pending" | "verified" | "rejected";
};

export default function AdminReportsScreen() {
  const [reports, setReports] = useState<TrashReport[]>([]);
  // loading removed

  const [activeTab, setActiveTab] = useState<
    "pending" | "verified" | "rejected"
  >("pending");
  const [refreshing, setRefreshing] = useState(false);
  const { signOut } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("recorded_trash")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports((data as TrashReport[]) || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleVerify = async (
    id: string,
    newStatus: "verified" | "rejected"
  ) => {
    try {
      const { error } = await supabase
        .from("recorded_trash")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setReports(
        reports.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (error) {
      console.error(`Error updating report ${id}:`, error);
      alert("Failed to update status");
    }
  };

  const filteredReports = reports.filter(
    (r) => (r.status || "pending") === activeTab
  );

  const TabButton = ({
    title,
    status,
  }: {
    title: string;
    status: typeof activeTab;
  }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(status)}
      className={`px-4 py-2 rounded-full mr-2 ${
        activeTab === status ? "bg-indigo-600" : "bg-zinc-100 dark:bg-zinc-800"
      }`}
    >
      <ThemedText
        className={`font-plus-jakarta-sans-bold text-sm ${
          activeTab === status
            ? "text-white"
            : "text-zinc-600 dark:text-zinc-400"
        }`}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ScreenContent>
      <View className="flex-row items-center justify-between mb-8 mt-20 px-4">
        <View>
          <ThemedText variant="title" className="text-3xl mb-2">
            Reports
          </ThemedText>
          <ThemedText className="text-zinc-500 dark:text-zinc-400 text-base">
            Verify community submissions
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full flex-row items-center gap-2"
        >
          <LogOut size={14} color="#ef4444" />
          <ThemedText className="text-red-600 dark:text-red-400 font-plus-jakarta-sans-bold text-xs uppercase">
            Exit
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View className="flex-row mb-8">
        <TabButton title="Pending" status="pending" />
        <TabButton title="Verified" status="verified" />
        <TabButton title="Declined" status="rejected" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchReports();
            }}
          />
        }
      >
        {filteredReports.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full items-center justify-center mb-4">
              <ClipboardList size={32} color="#9ca3af" />
            </View>
            <ThemedText className="text-zinc-500 font-plus-jakarta-sans-medium">
              No {activeTab} reports found
            </ThemedText>
          </View>
        ) : (
          filteredReports.map((report) => (
            <View
              key={report.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-5 mb-4 shadow-sm border border-zinc-100 dark:border-zinc-800"
            >
              <View className="flex-row gap-5 mb-4">
                <Image
                  source={{ uri: report.image }}
                  className="w-28 h-28 rounded-xl bg-zinc-100 dark:bg-zinc-800"
                  resizeMode="cover"
                />
                <View className="flex-1 justify-between py-1">
                  <View className="gap-2">
                    <View className="flex-row items-start gap-2">
                      <MapPin
                        size={16}
                        color={isDark ? "#f4f4f5" : "#18181b"}
                        className="mt-0.5"
                      />
                      <ThemedText
                        className="text-xs text-zinc-500 dark:text-zinc-400 flex-1 leading-5"
                        numberOfLines={2}
                      >
                        {/* Check raw null/undefined for numbers, not string properties */}
                        {report.lat !== undefined &&
                        report.lat !== null &&
                        report.long !== undefined &&
                        report.long !== null
                          ? `Lat: ${report.lat.toFixed(6)}\nLong: ${report.long.toFixed(6)}`
                          : "Location not available"}
                      </ThemedText>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Calendar
                        size={16}
                        color={isDark ? "#f4f4f5" : "#18181b"}
                      />
                      <ThemedText className="text-xs text-zinc-500 dark:text-zinc-400">
                        {new Date(report.created_at).toLocaleDateString()}
                      </ThemedText>
                    </View>
                  </View>

                  {report.status === "pending" && (
                    <View className="flex-row gap-2 mt-2">
                      <TouchableOpacity
                        onPress={() => handleVerify(report.id, "verified")}
                        className="flex-1 bg-emerald-100 dark:bg-emerald-900/30 py-2 rounded-lg items-center flex-row justify-center gap-1"
                      >
                        <Check size={16} color="#10b981" />
                        <ThemedText className="text-xs font-plus-jakarta-sans-bold text-emerald-700 dark:text-emerald-400">
                          Verify
                        </ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleVerify(report.id, "rejected")}
                        className="flex-1 bg-red-100 dark:bg-red-900/30 py-2 rounded-lg items-center flex-row justify-center gap-1"
                      >
                        <X size={16} color="#ef4444" />
                        <ThemedText className="text-xs font-plus-jakarta-sans-bold text-red-700 dark:text-red-400">
                          Decline
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  )}
                  {report.status !== "pending" && (
                    <View
                      className={`self-start px-2 py-1 rounded-md mt-2 ${
                        report.status === "verified"
                          ? "bg-emerald-100 dark:bg-emerald-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      }`}
                    >
                      <ThemedText
                        className={`text-xs font-plus-jakarta-sans-bold capitalize ${
                          report.status === "verified"
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-red-700 dark:text-red-400"
                        }`}
                      >
                        {report.status}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
              {report.description && (
                <View className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                  <ThemedText className="text-sm text-zinc-600 dark:text-zinc-300">
                    {report.description}
                  </ThemedText>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </ScreenContent>
  );
}
