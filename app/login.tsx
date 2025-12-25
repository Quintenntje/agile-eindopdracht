import { Link, router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { ThemedText } from "../components/ThemedText";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.replace("/(tabs)");
    }, 1500);
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
              Welcome back
            </ThemedText>
            <ThemedText className="text-zinc-500 dark:text-zinc-400">
              Sign in to continue cleaning up Ghent.
            </ThemedText>
          </View>

          <View className="mb-6">
            <Input
              label="Email"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <View className="items-end mb-6">
              <Link href="/(tabs)" asChild>
                <ThemedText variant="link" className="text-sm">
                  Forgot password?
                </ThemedText>
              </Link>
            </View>

            <Button
              label="Sign In"
              onPress={handleLogin}
              isLoading={isLoading}
            />
          </View>

          <View className="flex-row justify-center mt-4">
            <ThemedText className="text-zinc-500 dark:text-zinc-400 mr-1">
              Don't have an account?
            </ThemedText>
            <Link href="/register" asChild>
              <ThemedText variant="link">Sign Up</ThemedText>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
