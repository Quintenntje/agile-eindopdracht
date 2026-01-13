import { router } from "expo-router";
import { Camera, Image as ImageIcon, MapPin, X } from "lucide-react-native";
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
import { useVideoPlayer, VideoView } from "expo-video";
import { getThemeClass, useTheme } from "../lib/contexts/ThemeContext";

type MediaType = "image" | "video" | null;

const PreviewVideo = ({ uri }: { uri: string }) => {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = false;
    player.play();
  });

  return (
    <VideoView
      player={player}
      style={{ width: "100%", height: "100%" }}
      contentFit="cover"
      nativeControls={true}
    />
  );
};

export default function ReportScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [afterImageUri, setAfterImageUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    long: number;
  } | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const themeClass = getThemeClass(theme);

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Toegang tot locatie geweigerd");
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
      Alert.alert("Fout bij ophalen locatie");
    } finally {
      setLoadingLocation(false);
    }
  };

  const pickMedia = async (type: "image" | "video") => {
    try {
      if (type === "image") {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.5,
        });

        if (!result.canceled) {
          setMediaUri(result.assets[0].uri);
          setMediaType("image");
        }
      } else {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["videos"],
          allowsEditing: true,
          videoMaxDuration: 30, // Max 30 seconds
          quality: 0.5,
        });

        if (!result.canceled) {
          setMediaUri(result.assets[0].uri);
          setMediaType("video");
        }
      }
    } catch {
      Alert.alert("Fout bij vastleggen media");
    }
  };

  const pickFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        videoMaxDuration: 30,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const detectedType = asset.type === "video" ? "video" : "image";
        setMediaUri(asset.uri);
        setMediaType(detectedType);
        // Reset after image if main type changes to video
        if (detectedType === "video") setAfterImageUri(null);
      }
    } catch {
      Alert.alert("Fout bij selecteren media");
    }
  };

  const pickAfterImage = async (source: "camera" | "library") => {
    try {
      let result;
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      };

      if (source === "camera") {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled) {
        setAfterImageUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Fout bij vastleggen opruimfoto");
    }
  };

  const showMediaPicker = () => {
    Alert.alert(
      "Bewijs Toevoegen",
      "Kies hoe je bewijs wilt vastleggen",
      [
        {
          text: "Foto Maken",
          onPress: () => pickMedia("image"),
        },
        {
          text: "Video Opnemen",
          onPress: () => pickMedia("video"),
        },
        {
          text: "Uit Bibliotheek",
          onPress: () => pickFromLibrary(),
        },
        {
          text: "Annuleren",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Fout", "Je moet ingelogd zijn om een rapport in te dienen");
      return;
    }

    if (!mediaUri) {
      Alert.alert("Fout", "Maak een foto of neem een video op");
      return;
    }

    if (mediaType === "image" && !afterImageUri) {
      Alert.alert("Fout", "Geef een opruimfoto (na) op");
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
            "Fout",
            "Locatie niet gevonden op basis van adres. Probeer het opnieuw of gebruik huidige locatie."
          );
          setIsSubmitting(false);
          return;
        }
      } catch {
        Alert.alert("Fout", "Adreslocatie oplossen mislukt.");
        setIsSubmitting(false);
        return;
      }
    }

    if (!finalCoordinates) {
      Alert.alert(
        "Fout",
        "Geef een locatie op (adres of huidige locatie)"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Je moet ingelogd zijn om een rapport in te dienen");
      }

      const uploadFile = async (uri: string, type: MediaType) => {
        if (!uri.startsWith("file://")) return uri;

        const fileExt =
          uri.split(".").pop() || (type === "video" ? "mp4" : "jpg");
        const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const mimeType = type === "video" ? "video/mp4" : "image/jpeg";

        const formData = new FormData();
        formData.append("file", {
          uri: uri,
          name: fileName,
          type: mimeType,
        } as any);

        const { error: uploadError } = await supabase.storage
          .from("trash-images")
          .upload(fileName, formData);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("trash-images").getPublicUrl(fileName);

        return publicUrl;
      };

      const uploadedUrl = await uploadFile(mediaUri, mediaType);

      let afterImageUrl = null;
      if (mediaType === "image" && afterImageUri) {
        afterImageUrl = await uploadFile(afterImageUri, "image");
      }

      const { error } = await supabase.from("recorded_trash").insert({
        user_id: user.id,
        image: uploadedUrl,
        after_image: afterImageUrl,
        media_type: mediaType, // Store the media type
        lat: finalCoordinates.lat,
        long: finalCoordinates.long,
        description: description || null,
        location_name: address || null,
      });

      if (error) {
        throw error;
      }

      Alert.alert("Succes", "Rapport succesvol ingediend", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Fout", error.message || "Rapport indienen mislukt");
      setIsSubmitting(false);
    }
  };

  const clearMedia = () => {
    setMediaUri(null);
    setAfterImageUri(null);
    setMediaType(null);
  };

  return (
    <View
      className={`flex-1 bg-white dark:bg-theme-secondary pt-2 ${themeClass}`}
    >
      <View className="p-4 flex-row justify-between items-center border-b border-theme-secondary dark:border-theme-primary/10 mt-8">
        <ThemedText variant="subtitle" className="text-theme-primary">
          Nieuw Rapport
        </ThemedText>
        <Pressable
          onPress={() => router.back()}
          className="p-2 bg-theme-secondary dark:bg-theme-primary/10 rounded-full"
        >
          <X size={20} color={isDark ? "#fafafa" : "#18181b"} />
        </Pressable>
      </View>

      <ScrollView className="flex-1 p-6">
        {/* Picture/Video Area */}
        <ThemedText
          variant="caption"
          className="mb-2 uppercase tracking-wider text-theme-primary/70"
        >
          1. Bewijs Voor
        </ThemedText>

        {mediaUri ? (
          <View className="mb-6">
            <View className="w-full h-64 rounded-2xl overflow-hidden border-2 border-theme-secondary dark:border-theme-primary/20">
              {mediaType === "video" ? (
                <PreviewVideo uri={mediaUri} />
              ) : (
                <Image
                  source={{ uri: mediaUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              )}
            </View>
            <View className="flex-row gap-3 mt-3">
              <TouchableOpacity
                onPress={showMediaPicker}
                className="flex-1 bg-theme-secondary dark:bg-theme-primary/20 p-3 rounded-xl items-center"
              >
                <ThemedText className="font-plus-jakarta-sans-medium text-theme-primary text-sm">
                  Opnieuw
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={clearMedia}
                className="flex-1 bg-red-100 dark:bg-red-900/20 p-3 rounded-xl items-center"
              >
                <ThemedText className="font-plus-jakarta-sans-medium text-red-600 dark:text-red-400 text-sm">
                  Remove
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={showMediaPicker}
              className="flex-1 h-40 bg-theme-secondary/20 dark:bg-theme-primary/5 rounded-2xl items-center justify-center border-2 border-dashed border-theme-secondary dark:border-theme-primary/20"
            >
              <Camera size={36} color={isDark ? "#96CA64" : "#96CA64"} />
              <ThemedText className="text-theme-primary mt-2 font-plus-jakarta-sans-medium text-sm">
                Media Toevoegen
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* After Picture Area (Only for Images) */}
        {mediaType === "image" && (
          <View className="mb-6">
            <ThemedText
              variant="caption"
              className="mb-2 uppercase tracking-wider text-theme-primary/70"
            >
              2. Bewijs Na (Verplicht)
            </ThemedText>

            {afterImageUri ? (
              <View>
                <View className="w-full h-64 rounded-2xl overflow-hidden border-2 border-theme-secondary dark:border-theme-primary/20">
                  <Image
                    source={{ uri: afterImageUri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                <View className="flex-row gap-3 mt-3">
                  <TouchableOpacity
                    onPress={() => pickAfterImage("camera")}
                    className="flex-1 bg-theme-secondary dark:bg-theme-primary/20 p-3 rounded-xl items-center"
                  >
                    <ThemedText className="font-plus-jakarta-sans-medium text-theme-primary text-sm">
                      Opnieuw
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setAfterImageUri(null)}
                    className="flex-1 bg-red-100 dark:bg-red-900/20 p-3 rounded-xl items-center"
                  >
                    <ThemedText className="font-plus-jakarta-sans-medium text-red-600 dark:text-red-400 text-sm">
                      Remove
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => pickAfterImage("camera")}
                  className="flex-1 h-40 bg-theme-secondary/20 dark:bg-theme-primary/5 rounded-2xl items-center justify-center border-2 border-dashed border-theme-secondary dark:border-theme-primary/20"
                >
                  <Camera size={24} color={isDark ? "#e8f3ee" : "#1a4d2e"} />
                  <ThemedText className="text-theme-primary mt-2 font-plus-jakarta-sans-medium text-xs">
                    Foto Maken
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => pickAfterImage("library")}
                  className="flex-1 h-40 bg-theme-secondary/20 dark:bg-theme-primary/5 rounded-2xl items-center justify-center border-2 border-dashed border-theme-secondary dark:border-theme-primary/20"
                >
                  <ImageIcon size={24} color={isDark ? "#96CA64" : "#96CA64"} />
                  <ThemedText className="text-theme-primary mt-2 font-plus-jakarta-sans-medium text-xs">
                    Uit Bibliotheek
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Location Area */}
        <ThemedText
          variant="caption"
          className="mb-2 uppercase tracking-wider text-theme-primary/70"
        >
          Locatie
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
              loadingLocation ? "Locatie bepalen..." : "Leeuwstraat 1, Gent"
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
                color={isDark ? "#96CA64" : "#96CA64"}
              />
            ) : (
              <>
                <MapPin size={18} color={isDark ? "#e8f3ee" : "#1a4d2e"} />
                <ThemedText className="ml-2 font-plus-jakarta-sans-medium text-theme-primary">
                  Gebruik mijn huidige locatie
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
          Bijzonderheden
        </ThemedText>
        <Input
          value={description}
          onChangeText={setDescription}
          placeholder="Beschrijf het afval (optioneel)"
          multiline
          numberOfLines={3}
          className="h-24 py-3 align-top bg-theme-secondary/20 dark:bg-theme-primary/10 border-theme-secondary dark:border-theme-primary/10 text-theme-primary"
          style={{ textAlignVertical: "top" }}
        />
      </ScrollView>

      <View className="p-4 border-t border-theme-secondary dark:border-theme-primary/10">
        <Button
          label="Rapport Indienen"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          disabled={
            !mediaUri ||
            (mediaType === "image" && !afterImageUri) ||
            (!coordinates && !address) ||
            !user
          }
        />
      </View>
    </View>
  );
}
