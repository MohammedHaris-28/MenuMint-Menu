import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import MenuHeader from "@/components/menu/MenuHeader";
import CategoryTabs from "@/components/menu/CategoryTabs";
import MenuCard from "@/components/menu/MenuCard";
import ViewToggle from "@/components/menu/ViewToggle";
import CartDrawer from "@/components/menu/CartDrawer";
import FloatingActions from "@/components/menu/FloatingActions";
import ReviewModal from "@/components/menu/ReviewModal";
import { useCart } from "@/hooks/useCart";
import { ShoppingBag, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Index = () => {
  // TEMP TEST MODE
const tableId = "95db3f51-7747-4d1f-868b-5727219bf89a";

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [invalidTable, setInvalidTable] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [cartOpen, setCartOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const cart = useCart();

  // 🔥 LOAD EVERYTHING
  useEffect(() => {
    const loadData = async () => {
      if (!tableId) return;

      setLoading(true);

      try {
        // 1️⃣ Validate table
        const { data: table, error: tableError } = await supabase
          .from("tables")
          .select("*")
          .eq("id", tableId)
          .single();

        if (tableError || !table) {
          setInvalidTable(true);
          return;
        }

        const restaurantId = table.restaurant_id;

        // 2️⃣ Fetch everything in parallel
        const [menuRes, restRes] = await Promise.all([
          supabase
            .from("menu_categories")
            .select(`
              *,
              menu_items(*)
            `)
            .eq("restaurant_id", restaurantId),

          supabase
            .from("restaurants")
            .select("*")
            .eq("id", restaurantId)
            .single()
        ]);

        if (menuRes.error) throw menuRes.error;

        // Flatten items
        const allItems =
          menuRes.data?.flatMap((cat: any) =>
            cat.menu_items.map((item: any) => ({
              ...item,
              category_id: cat.id,
              category_name: cat.name,
            }))
          ) || [];

        setCategories(menuRes.data || []);
        setMenuItems(allItems);
        setRestaurant(restRes.data);

      } catch (err: any) {
        toast.error(err.message || "Failed to load menu");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tableId]);

  // 🔥 FILTER
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category_id === activeCategory;

      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch && item.is_available;
    });
  }, [activeCategory, searchQuery, menuItems]);

  // 🔴 INVALID QR
  if (invalidTable) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">Invalid QR Code</p>
      </div>
    );
  }

  // 🔴 LOADING
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        <p className="text-muted-foreground animate-pulse">
          Loading menu...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">

      {/* 🔥 HEADER WITH RESTAURANT */}
      <MenuHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cart.totalItems}
        onCartClick={() => setCartOpen(true)}
        restaurant={restaurant}
      />

      <main className="container max-w-6xl mx-auto px-4">

        {/* CATEGORY */}
        <CategoryTabs
          active={activeCategory}
          onChange={setActiveCategory}
          categories={categories}
        />

        <div className="flex justify-end mt-2">
          <ViewToggle view={view} onChange={setView} />
        </div>

        {/* MENU LIST */}
        <div
          className={
            view === "grid"
              ? "grid grid-cols-2 gap-3 mt-4"
              : "flex flex-col gap-3 mt-4"
          }
        >
          {filteredItems.map((item, i) => (
            <MenuCard
              key={item.id}
              item={item}
              onAdd={cart.addItem}
              view={view}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            No items found
          </div>
        )}
      </main>

      {/* CART BUTTON */}
      {cart.totalItems > 0 && !cartOpen && (
        <div className="fixed bottom-0 left-0 right-0 p-4">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full max-w-md mx-auto flex justify-between py-3 px-5 rounded-xl bg-orange-600 text-white"
          >
            <span>View Cart ({cart.totalItems})</span>
            <span>₹{cart.totalPrice}</span>
          </button>
        </div>
      )}

      {/* COMPONENTS */}
      <FloatingActions onReviewClick={() => setReviewOpen(true)} />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart.items}
        totalPrice={cart.totalPrice}
        onAdd={cart.addItem}
        onRemove={cart.removeItem}
        onClear={cart.clearCart}
        restaurantId={restaurant?.id}
        tableId={tableId}
      />

      <ReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} />
    </div>
  );
};

export default Index;