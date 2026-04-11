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
  category_name?: string; // 🔥 ADD THIS
  created_at?: string;
}

/* =========================
   FETCHERS (OPTIMIZED)
========================= */

// 🔥 SINGLE CALL (BEST)
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
      )
    `)
    .eq("restaurant_id", restaurantId);

  if (error) throw error;

  // 🔥 FLATTEN DATA
  const categories: Category[] = data.map((c: any) => ({
    id: c.id,
    name: c.name,
    restaurant_id: restaurantId,
  }));

  const items: MenuItem[] = data.flatMap((c: any) =>
    (c.menu_items || []).map((item: any) => ({
      ...item,
      category_name: c.name,
    }))
  );

  return { categories, items };
};

/* =========================
   LEGACY (OPTIONAL)
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
    .eq("is_available", true); // 🔥 FILTER AT DB

  if (error) throw error;
  return data as MenuItem[];
};

/* =========================
   IMAGE HANDLER (FIXED)
========================= */

export const getMenuImageUrl = (path?: string | null) => {
  if (!path) return "/placeholder.png"; // 🔥 fallback image

  // already full URL
  if (path.startsWith("http")) return path;

  // storage path
  const { data } = supabase.storage
    .from("menu-images")
    .getPublicUrl(path);

  return data.publicUrl;
};