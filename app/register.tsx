import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { ThemedText } from "../components/ThemedText";
import { useAuth } from "../lib/contexts/AuthContext";
import { supabase } from "../lib/utils/supabase";

export default function RegisterScreen() {
  const { session } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.replace("/(tabs)");
    }
  }, [session]);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Fout", "Vul alle velden in");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Fout", "Wachtwoorden komen niet overeen");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Fout", "Wachtwoord moet minstens 6 tekens bevatten");
      return;
    }

    setIsLoading(true);
    try {
      // Note: Email confirmation must be disabled in Supabase Dashboard:
      // Go to Authentication > Providers > Email and disable "Confirm email"
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        Alert.alert("Fout", error.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Wait a bit for the trigger to create the profile, then update if needed
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Update profile with first_name and last_name (fallback if trigger didn't set them)
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            first_name: firstName,
            last_name: lastName,
          })
          .eq("id", data.user.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
          // Don't block registration if profile update fails
          // The trigger should have already created it with the metadata
        }
      }

      // Navigation will happen automatically via auth state change
      router.replace("/");
    } catch (error) {
      Alert.alert("Fout", "Er is een onverwachte fout opgetreden");
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-white dark:bg-zinc-950 p-6 justify-center">
          <View className="mb-8">
            <ThemedText variant="title" className="mb-2">
              Account aanmaken
            </ThemedText>
            <ThemedText className="text-zinc-500 dark:text-zinc-400">
              Word lid van de community en begin impact te maken.
            </ThemedText>
          </View>

          <View className="mb-6">
            <View className="flex-row gap-4 mb-0">
              <View className="flex-1">
                <Input
                  label="Voornaam"
                  placeholder="Jan"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View className="flex-1">
                <Input
                  label="Achternaam"
                  placeholder="Doe"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            <Input
              label="E-mail"
              placeholder="naam@voorbeeld.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Wachtwoord"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Input
              label="Bevestig wachtwoord"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <Button
              label="Registreren"
              onPress={handleRegister}
              isLoading={isLoading}
              className="mt-2"
            />
          </View>

          <View className="flex-row justify-center mt-4 mb-8">
            <ThemedText className="text-zinc-500 dark:text-zinc-400 mr-1">
              Heb je al een account?
            </ThemedText>
            <Link href="/login" asChild>
              <ThemedText variant="link">Inloggen</ThemedText>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
