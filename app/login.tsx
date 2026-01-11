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

export default function LoginScreen() {
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.replace("/");
    }
  }, [session]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Fout", "Vul alle velden in");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert("Fout", error.message);
        setIsLoading(false);
        return;
      }

      // Navigation will happen automatically via auth state change
      router.replace("/");
    } catch (_) {
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
          <View className="mb-10">
            <ThemedText variant="title" className="mb-2">
              Welkom terug
            </ThemedText>
            <ThemedText className="text-zinc-500 dark:text-zinc-400">
              Log in om verder te gaan met het opruimen van Gent.
            </ThemedText>
          </View>

          <View className="mb-6">
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

            <Button
              label="Inloggen"
              onPress={handleLogin}
              isLoading={isLoading}
            />
          </View>

          <View className="flex-row justify-center mt-4">
            <ThemedText className="text-zinc-500 dark:text-zinc-400 mr-1">
              Nog geen account?
            </ThemedText>
            <Link href="/register" asChild>
              <ThemedText variant="link">Registreren</ThemedText>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
