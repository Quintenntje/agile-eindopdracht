import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeOption = "default" | "ocean" | "sunset" | "forest";

type ThemeContextType = {
  theme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
  availableThemes: {
    id: ThemeOption;
    name: string;
    price: number;
    color: string;
  }[];
  purchasedThemes: ThemeOption[];
  buyTheme: (theme: ThemeOption) => Promise<boolean>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEMES: {
  id: ThemeOption;
  name: string;
  price: number;
  color: string;
}[] = [
  { id: "default", name: "Default Zinc", price: 0, color: "#18181b" },
  { id: "ocean", name: "Ocean Blue", price: 500, color: "#0e7490" },
  { id: "sunset", name: "Sunset Orange", price: 500, color: "#c2410c" },
  { id: "forest", name: "Forest Green", price: 500, color: "#15803d" },
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeOption>("default");
  const [purchasedThemes, setPurchasedThemes] = useState<ThemeOption[]>([
    "default",
  ]);

  // Load saved theme
  useEffect(() => {
    (async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("user_theme");
        const savedPurchased = await AsyncStorage.getItem(
          "user_purchased_themes"
        );

        if (savedTheme) {
          setTheme(savedTheme as ThemeOption);
        }
        if (savedPurchased) {
          setPurchasedThemes(JSON.parse(savedPurchased));
        }
      } catch (e) {
        console.error("Failed to load theme", e);
      }
    })();
  }, []);

  const handleSetTheme = async (newTheme: ThemeOption) => {
    setTheme(newTheme);
    await AsyncStorage.setItem("user_theme", newTheme);
  };

  const buyTheme = async (themeId: ThemeOption) => {
    if (purchasedThemes.includes(themeId)) return true;

    // In a real app, here you would check points balance and deduct points
    // For now, we simulate a successful purchase
    const newPurchased = [...purchasedThemes, themeId];
    setPurchasedThemes(newPurchased);
    await AsyncStorage.setItem(
      "user_purchased_themes",
      JSON.stringify(newPurchased)
    );
    return true;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: handleSetTheme,
        availableThemes: THEMES,
        purchasedThemes,
        buyTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
