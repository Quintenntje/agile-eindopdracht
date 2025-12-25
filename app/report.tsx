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

export default function ReportScreen() {
  const { user } = useAuth();
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

    if (!coordinates) {
      Alert.alert("Error", "Please get your location");
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
        lat: coordinates.lat,
        long: coordinates.long,
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
    <View className="flex-1 bg-white dark:bg-zinc-950 pt-2">
      <View className="p-4 flex-row justify-between items-center border-b border-zinc-100 dark:border-zinc-800 mt-8">
        <ThemedText variant="subtitle">New Report</ThemedText>
        <Pressable
          onPress={() => router.back()}
          className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full"
        >
          <X size={20} color={isDark ? "#e4e4e7" : "#52525b"} />
        </Pressable>
      </View>

      <ScrollView className="flex-1 p-6">
        {/* Picture Area */}
        <ThemedText variant="caption" className="mb-2 uppercase tracking-wider">
          Evidence
        </ThemedText>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={pickImage}
          className="w-full h-64 bg-zinc-100 dark:bg-zinc-900 rounded-2xl items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 mb-6 overflow-hidden"
        >
          {image ? (
            <Image
              source={{ uri: image }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="items-center">
              <Camera size={48} color={isDark ? "#52525b" : "#a1a1aa"} />
              <ThemedText className="text-zinc-500 mt-2 font-plus-jakarta-sans-medium">
                Tap to take picture
              </ThemedText>
            </View>
          )}
        </TouchableOpacity>

        {/* Location Area */}
        <ThemedText variant="caption" className="mb-2 uppercase tracking-wider">
          Location
        </ThemedText>
        <View className="mb-6 relative">
          <Input
            value={address}
            onChangeText={setAddress}
            placeholder={loadingLocation ? "Locating..." : "Enter address"}
            className="pl-12"
          />
          <TouchableOpacity
            onPress={getCurrentLocation}
            className="absolute left-3 top-3.5 z-10 p-1"
            disabled={loadingLocation}
          >
            {loadingLocation ? (
              <ActivityIndicator
                size="small"
                color={isDark ? "#a1a1aa" : "#71717a"}
              />
            ) : (
              <MapPin size={20} color={isDark ? "#a1a1aa" : "#71717a"} />
            )}
          </TouchableOpacity>
        </View>

        {/* Description */}
        <ThemedText variant="caption" className="mb-2 uppercase tracking-wider">
          Details
        </ThemedText>
        <Input
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the trash (optional)"
          multiline
          numberOfLines={3}
          className="h-24 py-3 align-top"
          style={{ textAlignVertical: "top" }}
        />
      </ScrollView>

      <View className="p-4 border-t border-zinc-100 dark:border-zinc-800">
        <Button
          label="Submit Report"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          disabled={!image || !coordinates || !user}
        />
      </View>
    </View>
  );
}
