import { router } from "expo-router";
import {
  Award,
  Edit2,
  FileText,
  LogOut,
  MapPin,
  Settings,
} from "lucide-react-native";
import {
  Alert,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { useAuth } from "../../lib/contexts/AuthContext";
import { supabase } from "../../lib/utils/supabase";

export default function ProfileScreen() {
  const { session } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Demo stats (would come from DB in real app)
  const stats = [
    { label: "Points", value: "1,250", icon: Award, color: "#f59e0b" }, // amber-500
    { label: "Reports", value: "12", icon: FileText, color: "#3b82f6" }, // blue-500
    { label: "Impact", value: "High", icon: MapPin, color: "#10b981" }, // emerald-500
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      // Router will likely handle this via AuthContext listener, but we can force it just in case
      router.replace("/login");
    }
  };

  const userEmail = session?.user?.email || "user@example.com";
  // Attempt to get name from metadata, fallback to 'User'
  const firstName = session?.user?.user_metadata?.first_name || "Citizen";
  const lastName = session?.user?.user_metadata?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = firstName ? firstName[0].toUpperCase() : "U";

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="items-center pt-12 pb-8 px-6 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <View className="w-24 h-24 rounded-full bg-zinc-200 dark:bg-zinc-800 items-center justify-center mb-4 border-4 border-white dark:border-zinc-950 shadow-sm">
            <ThemedText className="text-3xl font-plus-jakarta-sans-bold text-zinc-400 dark:text-zinc-500">
              {initials}
            </ThemedText>
          </View>
          <ThemedText variant="title" className="text-center">
            {fullName}
          </ThemedText>
          <ThemedText className="text-zinc-500 dark:text-zinc-400 mt-1">
            {userEmail}
          </ThemedText>

          <TouchableOpacity className="absolute top-12 right-6 p-2 bg-zinc-200 dark:bg-zinc-800 rounded-full">
            <Settings size={20} color={isDark ? "#a1a1aa" : "#71717a"} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View className="flex-row justify-between px-6 py-8">
          {stats.map((stat, index) => (
            <View key={index} className="items-center flex-1">
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center mb-2 bg-opacity-10"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon size={24} color={stat.color} />
              </View>
              <ThemedText
                variant="subtitle"
                className="font-plus-jakarta-sans-bold"
              >
                {stat.value}
              </ThemedText>
              <ThemedText variant="caption">{stat.label}</ThemedText>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View className="px-6 space-y-4">
          <ThemedText variant="subtitle" className="mb-2 ml-1">
            Account
          </ThemedText>

          <TouchableOpacity className="flex-row items-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <View className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 items-center justify-center mr-4">
              <Edit2 size={20} color={isDark ? "#e4e4e7" : "#52525b"} />
            </View>
            <View className="flex-1">
              <ThemedText className="font-plus-jakarta-sans-medium">
                Edit Profile
              </ThemedText>
              <ThemedText variant="caption">
                Update your personal information
              </ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20 mt-4"
          >
            <View className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mr-4">
              <LogOut size={20} color="#ef4444" />
            </View>
            <View className="flex-1">
              <ThemedText className="font-plus-jakarta-sans-medium text-red-600 dark:text-red-400">
                Log Out
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
