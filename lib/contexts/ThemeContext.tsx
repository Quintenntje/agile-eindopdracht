import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeOption = "default" | "eco" | "ocean" | "sunset" | "forest";

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
  { id: "default", name: "Classic", price: 0, color: "#18181b" },
  { id: "eco", name: "Eco Nature", price: 1000, color: "#1a4d2e" },
  { id: "ocean", name: "Ocean Blue", price: 1000, color: "#0e7490" },
  { id: "sunset", name: "Sunset Orange", price: 1000, color: "#c2410c" },
  { id: "forest", name: "Forest Green", price: 1000, color: "#15803d" },
];

export const THEME_COLORS: Record<
  ThemeOption,
  { light: Record<string, string>; dark: Record<string, string> }
> = {
  default: {
    light: {
      "--color-primary": "#18181b",
      "--color-primary-fg": "#fafafa",
      "--color-secondary": "#f4f4f5",
      "--color-secondary-fg": "#27272a",
      "--color-accent": "#3b82f6",
    },
    dark: {
      "--color-primary": "#fafafa",
      "--color-primary-fg": "#18181b",
      "--color-secondary": "#27272a",
      "--color-secondary-fg": "#f4f4f5",
      "--color-accent": "#60a5fa",
    },
  },
  eco: {
    light: {
      "--color-primary": "#1a4d2e",
      "--color-primary-fg": "#f2f9f6",
      "--color-secondary": "#e8f3ee",
      "--color-secondary-fg": "#1a2f2b",
      "--color-accent": "#d4a373",
    },
    dark: {
      "--color-primary": "#f2f9f6",
      "--color-primary-fg": "#1a4d2e",
      "--color-secondary": "#1a2f2b",
      "--color-secondary-fg": "#e8f3ee",
      "--color-accent": "#4ade80",
    },
  },
  ocean: {
    light: {
      "--color-primary": "#0e7490",
      "--color-primary-fg": "#ecfeff",
      "--color-secondary": "#cffafe",
      "--color-secondary-fg": "#155e75",
      "--color-accent": "#0891b2",
    },
    dark: {
      "--color-primary": "#67e8f9",
      "--color-primary-fg": "#083344",
      "--color-secondary": "#164e63",
      "--color-secondary-fg": "#cffafe",
      "--color-accent": "#22d3ee",
    },
  },
  sunset: {
    light: {
      "--color-primary": "#ea580c",
      "--color-primary-fg": "#fff7ed",
      "--color-secondary": "#ffedd5",
      "--color-secondary-fg": "#9a3412",
      "--color-accent": "#f97316",
    },
    dark: {
      "--color-primary": "#fdba74",
      "--color-primary-fg": "#431407",
      "--color-secondary": "#7c2d12",
      "--color-secondary-fg": "#ffedd5",
      "--color-accent": "#fb923c",
    },
  },
  forest: {
    light: {
      "--color-primary": "#15803d",
      "--color-primary-fg": "#f0fdf4",
      "--color-secondary": "#dcfce7",
      "--color-secondary-fg": "#14532d",
      "--color-accent": "#16a34a",
    },
    dark: {
      "--color-primary": "#86efac",
      "--color-primary-fg": "#052e16",
      "--color-secondary": "#14532d",
      "--color-secondary-fg": "#dcfce7",
      "--color-accent": "#4ade80",
    },
  },
};

export function getThemeClass(theme: ThemeOption) {
  switch (theme) {
    case "eco":
      return "theme-eco";
    case "ocean":
      return "theme-ocean";
    case "sunset":
      return "theme-sunset";
    case "forest":
      return "theme-forest";
    case "default":
    default:
      return "";
  }
}

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
