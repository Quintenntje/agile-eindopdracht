import { router } from "expo-router";
import { Camera, MapPin, X } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { ThemedText } from "../components/ThemedText";
import { useAuth } from "../lib/contexts/AuthContext";
import { supabase } from "../lib/utils/supabase";

import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { getThemeClass, useTheme } from "../lib/contexts/ThemeContext";

export default function ReportScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    long: number;
  } | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const themeClass = getThemeClass(theme);

  // Removed useEffect for automatic location fetching

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
      setCoordinates({
        lat: location.coords.latitude,
        long: location.coords.longitude,
      });

      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        setAddress(`${addr.street} ${addr.streetNumber || ""}, ${addr.city}`);
      }
    } catch {
      Alert.alert("Error fetching location");
    } finally {
      setLoadingLocation(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Error taking picture");
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to submit a report");
      return;
    }

    if (!image) {
      Alert.alert("Error", "Please take a picture");
      return;
    }

    // Try to resolve location from address if coordinates are missing
    let finalCoordinates = coordinates;

    if (!finalCoordinates && address) {
      setIsSubmitting(true);
      try {
        const geocoded = await Location.geocodeAsync(address);
        if (geocoded.length > 0) {
          finalCoordinates = {
            lat: geocoded[0].latitude,
            long: geocoded[0].longitude,
          };
        } else {
          Alert.alert(
            "Error",
            "Could not find location from address. Please try again or use current location."
          );
          setIsSubmitting(false);
          return;
        }
      } catch {
        Alert.alert("Error", "Failed to resolve address location.");
        setIsSubmitting(false);
        return;
      }
    }

    if (!finalCoordinates) {
      Alert.alert(
        "Error",
        "Please provide a location (address or current location)"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to submit a report");
      }

      let imageUrl = image;

      if (image && image.startsWith("file://")) {
        const fileExt = image.split(".").pop() || "jpg";
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        const formData = new FormData();
        formData.append("file", {
          uri: image,
          name: fileName,
          type: "image/jpeg",
        } as any);

        const { error: uploadError } = await supabase.storage
          .from("trash-images")
          .upload(fileName, formData);

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("trash-images").getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const { error } = await supabase.from("recorded_trash").insert({
        user_id: user.id,
        image: imageUrl,
        lat: finalCoordinates.lat,
        long: finalCoordinates.long,
        description: description || null,
        location_name: address || null,
      });

      if (error) {
        throw error;
      }

      Alert.alert("Success", "Report submitted successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to submit report");
      setIsSubmitting(false);
    }
  };

  return (
    <View
      className={`flex-1 bg-white dark:bg-theme-secondary pt-2 ${themeClass}`}
    >
      <View className="p-4 flex-row justify-between items-center border-b border-theme-secondary dark:border-theme-primary/10 mt-8">
        <ThemedText variant="subtitle" className="text-theme-primary">
          New Report
        </ThemedText>
        <Pressable
          onPress={() => router.back()}
          className="p-2 bg-theme-secondary dark:bg-theme-primary/10 rounded-full"
        >
          <X size={20} color={isDark ? "#f2f9f6" : "#1a4d2e"} />
        </Pressable>
      </View>

      <ScrollView className="flex-1 p-6">
        {/* Picture Area */}
        <ThemedText
          variant="caption"
          className="mb-2 uppercase tracking-wider text-theme-primary/70"
        >
          Evidence
        </ThemedText>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={pickImage}
          className="w-full h-64 bg-theme-secondary/20 dark:bg-theme-primary/5 rounded-2xl items-center justify-center border-2 border-dashed border-theme-secondary dark:border-theme-primary/20 mb-6 overflow-hidden"
        >
          {image ? (
            <Image
              source={{ uri: image }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="items-center">
              <Camera size={48} color={isDark ? "#f2f9f6" : "#1a4d2e"} />
              <ThemedText className="text-theme-primary mt-2 font-plus-jakarta-sans-medium">
                Tap to take picture
              </ThemedText>
            </View>
          )}
        </TouchableOpacity>

        {/* Location Area */}
        <ThemedText
          variant="caption"
          className="mb-2 uppercase tracking-wider text-theme-primary/70"
        >
          Location
        </ThemedText>
        <View className="mb-6">
          <Input
            value={address}
            onChangeText={(text) => {
              setAddress(text);
              // If user types, we should clear the 'current location' coordinates to ensure we re-geocode or rely on address
              if (coordinates) setCoordinates(null);
            }}
            placeholder={
              loadingLocation ? "Locating..." : "Leeuwstraat 1, Gent"
            }
            className="mb-3 bg-theme-secondary/20 dark:bg-theme-primary/10 border-theme-secondary dark:border-theme-primary/10 text-theme-primary"
          />
          <TouchableOpacity
            onPress={getCurrentLocation}
            disabled={loadingLocation}
            className="flex-row items-center justify-center bg-theme-secondary dark:bg-theme-primary/20 p-3 rounded-xl border border-theme-secondary dark:border-theme-primary/10"
          >
            {loadingLocation ? (
              <ActivityIndicator
                size="small"
                color={isDark ? "#f2f9f6" : "#1a4d2e"}
              />
            ) : (
              <>
                <MapPin size={18} color={isDark ? "#f2f9f6" : "#1a4d2e"} />
                <ThemedText className="ml-2 font-plus-jakarta-sans-medium text-theme-primary">
                  Use my current location
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Description */}
        <ThemedText
          variant="caption"
          className="mb-2 uppercase tracking-wider text-theme-primary/70"
        >
          Details
        </ThemedText>
        <Input
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the trash (optional)"
          multiline
          numberOfLines={3}
          className="h-24 py-3 align-top bg-theme-secondary/20 dark:bg-theme-primary/10 border-theme-secondary dark:border-theme-primary/10 text-theme-primary"
          style={{ textAlignVertical: "top" }}
        />
      </ScrollView>

      <View className="p-4 border-t border-theme-secondary dark:border-theme-primary/10">
        <Button
          label="Submit Report"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          disabled={!image || (!coordinates && !address) || !user}
        />
      </View>
    </View>
  );
}
