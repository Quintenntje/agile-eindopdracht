import { Tabs, router } from "expo-router";
import {
  ClipboardList,
  Map as MapIcon,
  Plus,
  Users,
} from "lucide-react-native";
import { Pressable, View, useColorScheme } from "react-native";

export default function AdminTabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#09090b" : "#ffffff",
          borderTopColor: "transparent",
          height: 64,
          paddingBottom: 0,
          position: "absolute",
          bottom: 16,
          left: 16,
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
        tabBarActiveTintColor: isDark ? "#fafafa" : "#18181b",
        tabBarInactiveTintColor: isDark ? "#71717a" : "#a1a1aa",
        tabBarLabelStyle: {
          fontFamily: "PlusJakartaSans-Medium",
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Reports",
          tabBarIcon: ({ color }) => <ClipboardList size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => <MapIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-report"
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push("/report");
          },
        }}
        options={{
          title: "",
          tabBarButton: (props) => (
            <Pressable
              {...props}
              style={{
                top: -20,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View className="w-14 h-14 rounded-full bg-indigo-600 items-center justify-center shadow-md">
                <Plus size={30} color="#ffffff" />
              </View>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
