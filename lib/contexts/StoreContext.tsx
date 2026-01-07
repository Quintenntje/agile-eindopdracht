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
    name: "Eco Nature",
    description: "The default green theme",
    price: 0,
    type: "theme",
    color: "#1a4d2e",
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    description: "Cool ocean vibes",
    price: 500,
    type: "theme",
    color: "#0e7490",
  },
  {
    id: "sunset",
    name: "Sunset Orange",
    description: "Warm sunset colors",
    price: 500,
    type: "theme",
    color: "#c2410c",
  },
  {
    id: "forest",
    name: "Forest Green",
    description: "Deep forest aesthetics",
    price: 500,
    type: "theme",
    color: "#15803d",
  },
];

export const STORE_COUPONS: StoreItem[] = [
  {
    id: "coupon_delhaize_5",
    name: "Delhaize €5 Voucher",
    description: "€5 off your next purchase at Delhaize",
    price: 1000,
    type: "coupon",
    discount: "€5",
  },
  {
    id: "coupon_colruyt_10",
    name: "Colruyt €10 Voucher",
    description: "€10 off your next purchase at Colruyt",
    price: 2000,
    type: "coupon",
    discount: "€10",
  },
  {
    id: "coupon_ah_15",
    name: "Albert Heijn €15 Voucher",
    description: "€15 off your next purchase at Albert Heijn",
    price: 3000,
    type: "coupon",
    discount: "€15",
  },
  {
    id: "coupon_cinema_ticket",
    name: "Kinepolis Movie Ticket",
    description: "Free movie ticket at any Kinepolis cinema",
    price: 5000,
    type: "coupon",
    discount: "Free Ticket",
  },
];

type PurchasedItem = {
  itemId: string;
  purchaseDate: string;
  type: StoreItemType;
};

type StoreContextType = {
  userPoints: number;
  purchasedItems: PurchasedItem[];
  purchaseItem: (
    item: StoreItem
  ) => Promise<{ success: boolean; message: string }>;
  canAfford: (price: number) => boolean;
  refreshPoints: () => Promise<void>;
  loading: boolean;
  themes: StoreItem[];
  coupons: StoreItem[];
  isItemPurchased: (itemId: string) => boolean;
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

  const purchaseItem = async (
    item: StoreItem
  ): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return {
        success: false,
        message: "You must be logged in to make purchases",
      };
    }

    // Check if already purchased (only for themes, coupons can be bought multiple times)
    if (item.type === "theme" && isItemPurchased(item.id)) {
      return { success: false, message: "You already own this item" };
    }

    // Check if user has enough points
    if (!canAfford(item.price)) {
      return {
        success: false,
        message: `Not enough points! You need ${item.price} points but only have ${userPoints} points.`,
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
          message: "Failed to process purchase. Please try again.",
        };
      }

      // Update local state
      setUserPoints(newPoints);

      // Add to purchased items
      const newPurchase: PurchasedItem = {
        itemId: item.id,
        purchaseDate: new Date().toISOString(),
        type: item.type,
      };

      const updatedPurchases = [...purchasedItems, newPurchase];
      setPurchasedItems(updatedPurchases);
      await savePurchasedItems(updatedPurchases);

      return {
        success: true,
        message:
          item.type === "coupon"
            ? `Successfully redeemed ${item.name}! Check your email for the voucher code.`
            : `Successfully purchased ${item.name}!`,
      };
    } catch (err) {
      console.error("Purchase error:", err);
      return {
        success: false,
        message: "An error occurred. Please try again.",
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
