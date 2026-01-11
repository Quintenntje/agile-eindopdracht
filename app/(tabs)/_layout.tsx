import { Tabs, router } from "expo-router";
import { Calendar, House, Map, Plus, Target, User } from "lucide-react-native";
import { Pressable, View, useColorScheme } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#09090b" : "#ffffff", // zinc-950 / white
          borderTopColor: "transparent",
          height: 64,
          paddingBottom: 0, // Remove default safe area padding
          position: "absolute",
          bottom: 16,
          left: 16, // Increasing spacing to make it visible (4px is very subtle)
          right: 16,
          borderRadius: 32,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 0,
        },
        tabBarActiveTintColor: isDark ? "#fafafa" : "#18181b", // zinc-50 / zinc-900
        tabBarInactiveTintColor: isDark ? "#71717a" : "#a1a1aa", // zinc-500 / zinc-400
        tabBarLabelStyle: {
          fontFamily: "PlusJakartaSans-Medium",
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <House size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => <Map size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "",
          tabBarButton: (props) => (
            <Pressable
              {...props}
              onPress={() => router.push("/report")}
              style={{
                top: -20,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View className="w-14 h-14 rounded-full bg-zinc-900 dark:bg-zinc-50 items-center justify-center shadow-md">
                <Plus size={30} color={isDark ? "#09090b" : "#ffffff"} />
              </View>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: "Challenges",
          tabBarIcon: ({ color }) => <Target size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profiel"
        options={{
          title: "Profiel",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      {/* Hide other potential screens from tab bar if needed */}
      <Tabs.Screen
        name="leaderboard"
        options={{
          href: null, // This hides it from the tab bar
        }}
      />
    </Tabs>
  );
}
