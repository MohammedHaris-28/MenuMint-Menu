import { supabase } from "@/lib/supabase";

/* =========================
   TYPES
========================= */

export type FoodType = "veg" | "non-veg" | "egg";

export interface Category {
  id: string;
  name: string;
  restaurant_id: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  is_veg: boolean;
  is_available: boolean;
  category_name?: string;
  created_at?: string;
}

// Support for the specific items inside a combo linked via junction table
export interface ComboItem {
  name: string;
  quantity: number;
}

export interface MenuCombo {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  total_price: number;
  discount_price: number;
  image_url: string;
  is_available: boolean;
  category_id: string;
  category_name?: string;
  included_items: ComboItem[]; 
  created_at: string;
}

/* =========================
   FETCHERS (OPTIMIZED)
========================= */

/**
 * Fetches Categories, Menu Items, AND Combos with their joined item names.
 */
export const fetchMenuWithCategories = async (restaurantId: string) => {
  const { data, error } = await supabase
    .from("menu_categories")
    .select(`
      id,
      name,
      menu_items (
        id,
        name,
        description,
        price,
        image_url,
        category_id,
        is_veg,
        is_available
      ),
      menu_combos (
        id,
        restaurant_id,
        name,
        description,
        total_price,
        discount_price,
        image_url,
        is_available,
        category_id,
        created_at,
        menu_combo_items (
          quantity,
          menu_items (
            name
          )
        )
      )
    `)
    .eq("restaurant_id", restaurantId);

  if (error) {
    console.error("Error fetching full menu:", error);
    throw error;
  }

  // 1. Extract Categories
  const categories: Category[] = data.map((c: any) => ({
    id: c.id,
    name: c.name,
    restaurant_id: restaurantId,
  }));

  // 2. Extract and Flatten Items
  const items: MenuItem[] = data.flatMap((c: any) =>
    (c.menu_items || []).map((item: any) => ({
      ...item,
      category_name: c.name,
    }))
  );

  // 3. Extract and Flatten Combos with Junction Table Data
  const combos: MenuCombo[] = data.flatMap((c: any) =>
    (c.menu_combos || []).map((combo: any) => ({
      ...combo,
      category_name: c.name,
      // Transform the nested junction query into the ComboItem[] format
      included_items: (combo.menu_combo_items || []).map((junction: any) => ({
        name: junction.menu_items?.name || "Unknown Item",
        quantity: junction.quantity || 1
      }))
    }))
  );

  return { categories, items, combos };
};

/* =========================
   SPECIFIC FETCHERS
========================= */

export const fetchCategories = async (restaurantId: string) => {
  const { data, error } = await supabase
    .from("menu_categories")
    .select("*")
    .eq("restaurant_id", restaurantId);

  if (error) throw error;
  return data as Category[];
};

export const fetchMenuItems = async (restaurantId: string) => {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("is_available", true);

  if (error) throw error;
  return data as MenuItem[];
};

export const fetchMenuCombos = async (restaurantId: string) => {
  // Updated to include junction join for the specific combo list view
  const { data, error } = await supabase
    .from("menu_combos")
    .select(`
      *,
      menu_combo_items (
        quantity,
        menu_items ( name )
      )
    `)
    .eq("restaurant_id", restaurantId)
    .eq("is_available", true);

  if (error) throw error;

  return (data || []).map(combo => ({
    ...combo,
    included_items: (combo.menu_combo_items || []).map((j: any) => ({
      name: j.menu_items?.name || "Unknown Item",
      quantity: j.quantity || 1
    }))
  })) as MenuCombo[];
};

/* =========================
   IMAGE HANDLER
========================= */

export const getMenuImageUrl = (path?: string | null) => {
  if (!path || path.trim() === "") return "/placeholder.png";

  if (path.startsWith("http")) return path;

  try {
    const { data } = supabase.storage
      .from("menu-images")
      .getPublicUrl(path);

    return data?.publicUrl || "/placeholder.png";
  } catch (err) {
    return "/placeholder.png";
  }
};