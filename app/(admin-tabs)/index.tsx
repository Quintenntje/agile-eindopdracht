import { router } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  Calendar,
  Check,
  ClipboardList,
  Film,
  LogOut,
  MapPin,
  Play,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ScreenContent } from "../../components/ScreenContent";
import { ThemedText } from "../../components/ThemedText";
import { useAuth } from "../../lib/contexts/AuthContext";
import { supabase } from "../../lib/utils/supabase";

type TrashReport = {
  id: string;
  user_id: string;
  image: string;
  after_image?: string | null;
  media_type?: "image" | "video" | null;
  lat: number;
  long: number;
  description: string | null;
  location_name?: string | null;
  created_at: string;
  status: "pending" | "verified" | "rejected";
};

const POINTS_PER_VERIFIED_REPORT = 10;

// Sub-component for rendering video thumbnail in list
const VideoThumbnail = ({ uri }: { uri: string }) => {
  const player = useVideoPlayer(uri, (player) => {
    player.muted = true;
    player.loop = false;
  });

  return (
    <View className="w-full h-full relative">
      <VideoView
        player={player}
        style={{ width: "100%", height: "100%", position: "absolute" }}
        contentFit="cover"
        nativeControls={false}
      />
      {/* Overlay to darken slightly if needed, or just let it sit */}
    </View>
  );
};

// Sub-component for the Modal Video Player
const ModalVideoPlayer = ({ uri }: { uri: string }) => {
  const { width: screenWidth } = Dimensions.get("window");
  const player = useVideoPlayer(uri, (player) => {
    player.loop = false;
    player.play(); // Auto play when modal opens
  });

  return (
    <VideoView
      player={player}
      style={{ width: screenWidth, height: screenWidth * (3 / 4) }}
      contentFit="contain"
      nativeControls={true}
    />
  );
};

export default function AdminReportsScreen() {
  const [reports, setReports] = useState<TrashReport[]>([]);
  const [activeTab, setActiveTab] = useState<
    "pending" | "verified" | "rejected"
  >("pending");
  const [refreshing, setRefreshing] = useState(false);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [activeMediaUrl, setActiveMediaUrl] = useState<string | null>(null);
  const [activeMediaType, setActiveMediaType] = useState<"image" | "video">(
    "image"
  );

  const { signOut } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { width: screenWidth } = Dimensions.get("window");

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
      // Find the report to get user_id
      const report = reports.find((r) => r.id === id);
      if (!report) {
        throw new Error("Report not found");
      }

      // Update report status
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

  const openMediaViewer = (url: string, type: "image" | "video") => {
    setActiveMediaUrl(url);
    setActiveMediaType(type);
    setMediaModalVisible(true);
  };

  const closeMediaViewer = () => {
    setMediaModalVisible(false);
    setActiveMediaUrl(null);
  };

  // Helper function to determine if media is video
  const isVideoMedia = (report: TrashReport): boolean => {
    // Check explicit media_type field first
    if (report.media_type === "video") return true;
    if (report.media_type === "image") return false;

    // Fallback to URL extension check
    if (report.image) {
      const lowerUrl = report.image.toLowerCase();
      return (
        lowerUrl.endsWith(".mp4") ||
        lowerUrl.endsWith(".mov") ||
        lowerUrl.endsWith(".webm") ||
        lowerUrl.endsWith(".avi")
      );
    }
    return false;
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

  const MediaPreview = ({ report }: { report: TrashReport }) => {
    const isVideo = isVideoMedia(report);

    if (report.after_image) {
      return (
        <View className="flex-row gap-3 w-full">
          {/* Before Image */}
          <View className="flex-1">
            <ThemedText className="text-xs mb-2 font-plus-jakarta-sans-bold text-zinc-500 uppercase">
              Voor
            </ThemedText>
            {isVideo ? (
              <TouchableOpacity
                onPress={() => openMediaViewer(report.image, "video")}
                className="w-full h-40 rounded-xl bg-zinc-100 dark:bg-zinc-800 items-center justify-center relative overflow-hidden"
              >
                <VideoThumbnail uri={report.image} />
                <View className="absolute inset-0 bg-black/30 items-center justify-center">
                  <Play size={20} color="#fff" style={{ marginLeft: 2 }} />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => openMediaViewer(report.image, "image")}
              >
                <Image
                  source={{ uri: report.image }}
                  className="w-full h-40 rounded-xl bg-zinc-100 dark:bg-zinc-800"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* After Image */}
          <View className="flex-1">
            <ThemedText className="text-xs mb-2 font-plus-jakarta-sans-bold text-emerald-600 dark:text-emerald-400 uppercase">
              After
            </ThemedText>
            <TouchableOpacity
              onPress={() => openMediaViewer(report.after_image!, "image")}
            >
              <Image
                source={{ uri: report.after_image! }}
                className="w-full h-40 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-2 border-emerald-500/20"
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (isVideo) {
      return (
        <TouchableOpacity
          onPress={() => openMediaViewer(report.image, "video")}
          className="w-full h-48 rounded-xl bg-zinc-100 dark:bg-zinc-800 items-center justify-center relative overflow-hidden"
        >
          {/* Video thumbnail */}
          <VideoThumbnail uri={report.image} />

          {/* Play overlay */}
          <View className="absolute inset-0 bg-black/30 items-center justify-center">
            <View className="w-16 h-16 bg-white/90 rounded-full items-center justify-center">
              <Play size={24} color="#000" style={{ marginLeft: 4 }} />
            </View>
          </View>
          {/* Video badge */}
          <View className="absolute top-3 left-3 bg-indigo-600 px-3 py-1 rounded-lg flex-row items-center">
            <Film size={12} color="#fff" />
            <ThemedText className="text-white text-xs ml-1.5 font-plus-jakarta-sans-bold">
              VIDEO
            </ThemedText>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity onPress={() => openMediaViewer(report.image, "image")}>
        <Image
          source={{ uri: report.image }}
          className="w-full h-48 rounded-xl bg-zinc-100 dark:bg-zinc-800"
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

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
          <LogOut size={14} color={isDark ? "#f87171" : "#ef4444"} />
          <ThemedText className="text-red-600 dark:text-red-400 font-plus-jakarta-sans-bold text-xs uppercase">
            Afsluiten
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
              <ClipboardList size={32} color={isDark ? "#71717a" : "#9ca3af"} />
            </View>
            <ThemedText className="text-zinc-500 font-plus-jakarta-sans-medium">
              Geen {activeTab === "pending" ? "in afwachting" : activeTab === "verified" ? "geverifieerde" : "afgewezen"} rapporten gevonden
            </ThemedText>
          </View>
        ) : (
          filteredReports.map((report) => (
            <View
              key={report.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-5 mb-4 shadow-sm border border-zinc-100 dark:border-zinc-800"
            >
              <View className="flex-col mb-4">
                <MediaPreview report={report} />
                <View className="w-full mt-4">
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1 mr-4">
                      <View className="flex-row items-center gap-1.5 mb-1">
                        <MapPin
                          size={16}
                          color={isDark ? "#e8f3ee" : "#18181b"}
                        />
                        <ThemedText
                          className="font-plus-jakarta-sans-bold text-sm text-zinc-900 dark:text-zinc-100"
                          numberOfLines={1}
                        >
                          {report.location_name || "Gepinde Locatie"}
                        </ThemedText>
                      </View>
                      <ThemedText className="text-[11px] text-zinc-400 pl-5 font-mono">
                        {report.lat !== undefined &&
                        report.lat !== null &&
                        report.long !== undefined &&
                        report.long !== null
                          ? `${report.lat.toFixed(6)}, ${report.long.toFixed(6)}`
                          : "Locatie niet beschikbaar"}
                      </ThemedText>
                    </View>

                    <View className="items-end">
                      <View className="flex-row items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                        <Calendar
                          size={12}
                          color={isDark ? "#a1a1aa" : "#71717a"}
                        />
                        <ThemedText className="text-[10px] text-zinc-600 dark:text-zinc-400 font-plus-jakarta-sans-medium">
                          {new Date(report.created_at).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" }
                          )}
                        </ThemedText>
                      </View>
                      <ThemedText className="text-[10px] text-zinc-400 mt-1">
                        {new Date(report.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </ThemedText>
                    </View>
                  </View>

                  {report.status === "pending" && (
                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        onPress={() => handleVerify(report.id, "verified")}
                        className="flex-1 bg-emerald-100 dark:bg-emerald-900/30 py-3 rounded-xl items-center flex-row justify-center gap-2"
                      >
                        <Check size={18} color="#10b981" />
                        <ThemedText className="font-plus-jakarta-sans-bold text-emerald-700 dark:text-emerald-400">
                          Verify
                        </ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleVerify(report.id, "rejected")}
                        className="flex-1 bg-red-100 dark:bg-red-900/30 py-3 rounded-xl items-center flex-row justify-center gap-2"
                      >
                        <X size={18} color="#ef4444" />
                        <ThemedText className="font-plus-jakarta-sans-bold text-red-700 dark:text-red-400">
                          Afwijzen
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  )}
                  {report.status !== "pending" && (
                    <View
                      className={`self-start px-3 py-1.5 rounded-lg ${
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

      {/* Media Viewer Modal */}
      <Modal
        visible={mediaModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMediaViewer}
      >
        <View className="flex-1 bg-black items-center justify-center">
          {/* Close button */}
          <TouchableOpacity
            onPress={closeMediaViewer}
            className="absolute top-12 right-4 z-10 w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>

          {/* Media player */}
          {activeMediaUrl && (
            <>
              {activeMediaType === "video" ? (
                <ModalVideoPlayer uri={activeMediaUrl} />
              ) : (
                <Image
                  source={{ uri: activeMediaUrl }}
                  style={{ width: screenWidth, height: "80%" }}
                  resizeMode="contain"
                />
              )}
            </>
          )}

          {activeMediaType === "video" && (
            <ThemedText className="text-white/70 mt-4 text-sm">
              Native controls enabled
            </ThemedText>
          )}
        </View>
      </Modal>
    </ScreenContent>
  );
}
