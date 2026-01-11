import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../utils/supabase";
import { useAuth } from "./AuthContext";

// Store item types
export type StoreItemType = "theme" | "coupon";

export type StoreItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  type: StoreItemType;
  color?: string; // For themes
  discount?: string; // For coupons (e.g., "10%", "€5")
};

// Available store items
export const STORE_THEMES: StoreItem[] = [
  {
    id: "default",
    name: "Klassiek",
    description: "Schoon zwart-wit thema",
    price: 0,
    type: "theme",
    color: "#18181b",
  },
  {
    id: "eco",
    name: "Eco Natuur",
    description: "Op de natuur geïnspireerd groen thema",
    price: 1000,
    type: "theme",
    color: "#1a4d2e",
  },
  {
    id: "ocean",
    name: "Oceaan Blauw",
    description: "Koele oceaan vibes",
    price: 1000,
    type: "theme",
    color: "#0e7490",
  },
  {
    id: "sunset",
    name: "Zonsondergang Oranje",
    description: "Warme zonsondergang kleuren",
    price: 1000,
    type: "theme",
    color: "#c2410c",
  },
  {
    id: "forest",
    name: "Bos Groen",
    description: "Diepe bos esthetiek",
    price: 1000,
    type: "theme",
    color: "#15803d",
  },
];

export const STORE_COUPONS: StoreItem[] = [
  {
    id: "coupon_delhaize_5",
    name: "Delhaize €5 Waardebon",
    description: "€5 korting op je volgende aankoop bij Delhaize",
    price: 25000,
    type: "coupon",
    discount: "€5",
  },
  {
    id: "coupon_colruyt_10",
    name: "Colruyt €10 Waardebon",
    description: "€10 korting op je volgende aankoop bij Colruyt",
    price: 50000,
    type: "coupon",
    discount: "€10",
  },
  {
    id: "coupon_ah_15",
    name: "Albert Heijn €15 Waardebon",
    description: "€15 korting op je volgende aankoop bij Albert Heijn",
    price: 75000,
    type: "coupon",
    discount: "€15",
  },
  {
    id: "coupon_cinema_ticket",
    name: "Kinepolis Bioscoopkaartje",
    description: "Gratis bioscoopkaartje bij elke Kinepolis bioscoop",
    price: 100000,
    type: "coupon",
    discount: "Gratis Ticket",
  },
];

type PurchasedItem = {
  itemId: string;
  purchaseDate: string;
  type: StoreItemType;
  code?: string; // For coupons
};

type PurchasedCoupon = {
  itemId: string;
  name: string;
  discount: string;
  code: string;
  purchaseDate: string;
};

type StoreContextType = {
  userPoints: number;
  purchasedItems: PurchasedItem[];
  purchaseItem: (
    item: StoreItem
  ) => Promise<{ success: boolean; message: string; code?: string }>;
  canAfford: (price: number) => boolean;
  refreshPoints: () => Promise<void>;
  loading: boolean;
  themes: StoreItem[];
  coupons: StoreItem[];
  isItemPurchased: (itemId: string) => boolean;
  getPurchasedCoupons: () => PurchasedCoupon[];
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState<number>(0);
  const [purchasedItems, setPurchasedItems] = useState<PurchasedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user points from Supabase
  const refreshPoints = useCallback(async () => {
    if (!user) {
      setUserPoints(0);
      setLoading(false);
      return;
    }

    try {
      // Try to get points from user_points table
      const { data, error } = await supabase
        .from("user_points")
        .select("total_points")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Error fetching points:", error);
      }

      setUserPoints(data?.total_points || 0);
    } catch (err) {
      console.error("Error fetching user points:", err);
      setUserPoints(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load purchased items from AsyncStorage
  const loadPurchasedItems = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(`purchased_items_${user?.id}`);
      if (stored) {
        setPurchasedItems(JSON.parse(stored));
      } else {
        // Default theme is always "purchased"
        setPurchasedItems([
          {
            itemId: "default",
            purchaseDate: new Date().toISOString(),
            type: "theme",
          },
        ]);
      }
    } catch (err) {
      console.error("Error loading purchased items:", err);
      setPurchasedItems([
        {
          itemId: "default",
          purchaseDate: new Date().toISOString(),
          type: "theme",
        },
      ]);
    }
  }, [user]);

  // Save purchased items to AsyncStorage
  const savePurchasedItems = async (items: PurchasedItem[]) => {
    try {
      await AsyncStorage.setItem(
        `purchased_items_${user?.id}`,
        JSON.stringify(items)
      );
    } catch (err) {
      console.error("Error saving purchased items:", err);
    }
  };

  useEffect(() => {
    if (user) {
      refreshPoints();
      loadPurchasedItems();
    } else {
      setUserPoints(0);
      setPurchasedItems([]);
      setLoading(false);
    }
  }, [user, refreshPoints, loadPurchasedItems]);

  const canAfford = (price: number): boolean => {
    return userPoints >= price;
  };

  const isItemPurchased = (itemId: string): boolean => {
    return purchasedItems.some((item) => item.itemId === itemId);
  };

  const generateCouponCode = (): string => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += "-";
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const getPurchasedCoupons = (): PurchasedCoupon[] => {
    return purchasedItems
      .filter((item) => item.type === "coupon" && item.code)
      .map((item) => {
        const coupon = STORE_COUPONS.find((c) => c.id === item.itemId);
        return {
          itemId: item.itemId,
          name: coupon?.name || "Coupon",
          discount: coupon?.discount || "",
          code: item.code!,
          purchaseDate: item.purchaseDate,
        };
      });
  };

  const purchaseItem = async (
    item: StoreItem
  ): Promise<{ success: boolean; message: string; code?: string }> => {
    if (!user) {
      return {
        success: false,
        message: "Je moet ingelogd zijn om aankopen te doen",
      };
    }

    // Check if already purchased (only for themes, coupons can be bought multiple times)
    if (item.type === "theme" && isItemPurchased(item.id)) {
      return { success: false, message: "Je bezit dit item al" };
    }

    // Check if user has enough points
    if (!canAfford(item.price)) {
      return {
        success: false,
        message: `Niet genoeg punten! Je hebt ${item.price} punten nodig maar hebt er slechts ${userPoints}.`,
      };
    }

    try {
      // Deduct points from user_points table
      const newPoints = userPoints - item.price;

      const { error: updateError } = await supabase.from("user_points").upsert(
        {
          user_id: user.id,
          total_points: newPoints,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      if (updateError) {
        console.error("Error updating points:", updateError);
        return {
          success: false,
          message: "Verwerking van aankoop mislukt. Probeer het opnieuw.",
        };
      }

      // Update local state
      setUserPoints(newPoints);

      // Generate code for coupons
      const couponCode =
        item.type === "coupon" ? generateCouponCode() : undefined;

      // Add to purchased items
      const newPurchase: PurchasedItem = {
        itemId: item.id,
        purchaseDate: new Date().toISOString(),
        type: item.type,
        code: couponCode,
      };

      const updatedPurchases = [...purchasedItems, newPurchase];
      setPurchasedItems(updatedPurchases);
      await savePurchasedItems(updatedPurchases);

      return {
        success: true,
        message:
          item.type === "coupon"
            ? `${item.name} succesvol ingewisseld!`
            : `${item.name} succesvol gekocht!`,
        code: couponCode,
      };
    } catch (err) {
      console.error("Purchase error:", err);
      return {
        success: false,
        message: "Er is een fout opgetreden. Probeer het opnieuw.",
      };
    }
  };

  return (
    <StoreContext.Provider
      value={{
        userPoints,
        purchasedItems,
        purchaseItem,
        canAfford,
        refreshPoints,
        loading,
        themes: STORE_THEMES,
        coupons: STORE_COUPONS,
        isItemPurchased,
        getPurchasedCoupons,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
