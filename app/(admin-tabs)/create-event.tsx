import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { ArrowLeft, Calendar, Clock, MapPin, Save } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenContent } from "../../components/ScreenContent";
import { ThemedText } from "../../components/ThemedText";
import { useAuth } from "../../lib/contexts/AuthContext";
import { supabase } from "../../lib/utils/supabase";

export default function CreateEventScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location_name: "",
    lat: "",
    long: "",
    max_participants: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        setLoadingLocation(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      // Update coordinates
      setForm((prev) => ({
        ...prev,
        lat: location.coords.latitude.toString(),
        long: location.coords.longitude.toString(),
      }));

      // Reverse geocode to get address
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const addressString = `${addr.street} ${addr.streetNumber || ""}, ${addr.city}`;
        setForm((prev) => ({
          ...prev,
          location_name: addressString,
        }));
      }
    } catch {
      Alert.alert("Error fetching location");
    } finally {
      setLoadingLocation(false);
    }
  };

  const validateForm = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.location_name.trim()) return "Location name is required";

    // Date must be valid and future
    if (date < new Date()) return "Event date must be in the future";

    if (form.lat && isNaN(parseFloat(form.lat)))
      return "Latitude must be a number";
    if (form.long && isNaN(parseFloat(form.long)))
      return "Longitude must be a number";

    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert("Validation Error", error);
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in");
      return;
    }

    setLoading(true);
    try {
      let finalLat = form.lat ? parseFloat(form.lat) : 0;
      let finalLong = form.long ? parseFloat(form.long) : 0;

      // Geocode if address provided but no coordinates
      if (finalLat === 0 && finalLong === 0 && form.location_name) {
        try {
          const geocoded = await Location.geocodeAsync(form.location_name);
          if (geocoded.length > 0) {
            finalLat = geocoded[0].latitude;
            finalLong = geocoded[0].longitude;
          } else {
            throw new Error("Could not find location from address");
          }
        } catch (e) {
          console.error("Geocoding error:", e);
          Alert.alert(
            "Error",
            "Could not find coordinates for this address. Please try 'Use my current location' or enter coordinates manually."
          );
          setLoading(false);
          return;
        }
      }

      const { error: dbError } = await supabase.from("events").insert({
        title: form.title,
        description: form.description || null,
        location_name: form.location_name,
        lat: finalLat,
        long: finalLong,
        event_date: date.toISOString(),
        created_by: user.id,
        max_participants: form.max_participants
          ? parseInt(form.max_participants)
          : null,
        status: "upcoming",
      });

      if (dbError) throw dbError;

      Alert.alert("Success", "Event created successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error("Error creating event:", err);
      Alert.alert("Error", "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios"); // Keep open on iOS
    if (selectedDate) {
      // Preserve current time, update date
      const currentDate = new Date(date);
      currentDate.setFullYear(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );
      setDate(currentDate);
    }
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
  };

  const onChangeTime = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === "ios"); // Keep open on iOS
    if (selectedDate) {
      // Preserve current date, update time
      const currentDate = new Date(date);
      currentDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setDate(currentDate);
    }
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScreenContent
        className="bg-white dark:bg-zinc-900"
        contentContainerStyle={{ padding: 16 }}
      >
        <View className="flex-row items-center justify-between mb-6 mt-12">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full items-center justify-center"
          >
            <ArrowLeft size={20} color={isDark ? "#ffffff" : "#000000"} />
          </TouchableOpacity>
          <ThemedText variant="subtitle">Create Event</ThemedText>
          <View className="w-10" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="gap-4 pb-20">
            {/* Title */}
            <View>
              <ThemedText className="mb-2 font-plus-jakarta-sans-bold">
                Title *
              </ThemedText>
              <TextInput
                className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl font-plus-jakarta-sans-medium text-zinc-900 dark:text-zinc-100"
                placeholder="Community Cleanup"
                placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                value={form.title}
                onChangeText={(text) => handleChange("title", text)}
              />
            </View>

            {/* Description */}
            <View>
              <ThemedText className="mb-2 font-plus-jakarta-sans-bold">
                Description
              </ThemedText>
              <TextInput
                className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl font-plus-jakarta-sans-medium text-zinc-900 dark:text-zinc-100 min-h-[100px]"
                placeholder="Details about the event..."
                placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                multiline
                textAlignVertical="top"
                value={form.description}
                onChangeText={(text) => handleChange("description", text)}
              />
            </View>

            {/* Location Section */}
            <View>
              <ThemedText className="mb-2 font-plus-jakarta-sans-bold">
                Location *
              </ThemedText>

              <TextInput
                className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl font-plus-jakarta-sans-medium text-zinc-900 dark:text-zinc-100 mb-3"
                placeholder="Leeuwstraat 1, Gent"
                placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                value={form.location_name}
                onChangeText={(text) => {
                  // Update location name
                  handleChange("location_name", text);
                }}
              />

              <TouchableOpacity
                onPress={getCurrentLocation}
                disabled={loadingLocation}
                className="flex-row items-center justify-center bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700"
              >
                {loadingLocation ? (
                  <ActivityIndicator
                    size="small"
                    color={isDark ? "#e8f3ee" : "#1a4d2e"}
                  />
                ) : (
                  <>
                    <MapPin size={18} color={isDark ? "#e8f3ee" : "#1a4d2e"} />
                    <ThemedText className="ml-2 font-plus-jakarta-sans-medium text-zinc-900 dark:text-zinc-100">
                      Use my current location
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Coordinates (Optional/Auto-filled) */}
            <View className="flex-row gap-4">
              <View className="flex-1">
                <ThemedText className="mb-2 font-plus-jakarta-sans-bold">
                  Latitude
                </ThemedText>
                <TextInput
                  className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl font-plus-jakarta-sans-medium text-zinc-900 dark:text-zinc-100"
                  placeholder="51.05"
                  placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                  keyboardType="numeric"
                  value={form.lat}
                  onChangeText={(text) => handleChange("lat", text)}
                />
              </View>
              <View className="flex-1">
                <ThemedText className="mb-2 font-plus-jakarta-sans-bold">
                  Longitude
                </ThemedText>
                <TextInput
                  className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl font-plus-jakarta-sans-medium text-zinc-900 dark:text-zinc-100"
                  placeholder="3.71"
                  placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                  keyboardType="numeric"
                  value={form.long}
                  onChangeText={(text) => handleChange("long", text)}
                />
              </View>
            </View>

            {/* Date & Time Picker */}
            <View>
              <ThemedText className="mb-2 font-plus-jakarta-sans-bold">
                Date & Time *
              </ThemedText>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="flex-1 bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl flex-row items-center justify-between"
                >
                  <ThemedText className="font-plus-jakarta-sans-medium text-zinc-900 dark:text-zinc-100">
                    {date.toLocaleDateString()}
                  </ThemedText>
                  <Calendar size={20} color={isDark ? "#a1a1aa" : "#71717a"} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  className="flex-1 bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl flex-row items-center justify-between"
                >
                  <ThemedText className="font-plus-jakarta-sans-medium text-zinc-900 dark:text-zinc-100">
                    {date.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </ThemedText>
                  <Clock size={20} color={isDark ? "#a1a1aa" : "#71717a"} />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  testID="datePicker"
                  value={date}
                  mode="date"
                  is24Hour={true}
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={onChangeDate}
                  themeVariant={isDark ? "dark" : "light"}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  testID="timePicker"
                  value={date}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={onChangeTime}
                  themeVariant={isDark ? "dark" : "light"}
                />
              )}
            </View>

            {/* Max Participants */}
            <View>
              <ThemedText className="mb-2 font-plus-jakarta-sans-bold">
                Max Participants (Optional)
              </ThemedText>
              <TextInput
                className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl font-plus-jakarta-sans-medium text-zinc-900 dark:text-zinc-100"
                placeholder="50"
                placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                keyboardType="numeric"
                value={form.max_participants}
                onChangeText={(text) => handleChange("max_participants", text)}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className="mt-4 bg-indigo-600 dark:bg-indigo-500 py-4 rounded-full flex-row items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Save size={20} color="#ffffff" />
                  <ThemedText className="text-white font-plus-jakarta-sans-bold text-lg">
                    Create Event
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContent>
    </KeyboardAvoidingView>
  );
}
