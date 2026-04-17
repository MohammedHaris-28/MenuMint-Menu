import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import MenuHeader from "@/components/menu/MenuHeader";
import CategoryTabs from "@/components/menu/CategoryTabs";
import MenuCard from "@/components/menu/MenuCard";
import ComboCard from "@/components/menu/ComboCard";
import ViewToggle from "@/components/menu/ViewToggle";
import CartDrawer from "@/components/menu/CartDrawer";
import FloatingActions from "@/components/menu/FloatingActions";
import ReviewModal from "@/components/menu/ReviewModal";
import { useCart } from "@/hooks/useCart";
import { Loader2, ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { MenuItem, MenuCombo, Category } from "@/data/menuData";

const Index = () => {
  const { tableId } = useParams();

  // Data State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [combos, setCombos] = useState<MenuCombo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [table, setTable] = useState<any>(null);
  
  // UI State
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
      if (!tableId) {
        setInvalidTable(true);
        return;
      }

      setLoading(true);

      try {
        // 1. Validate Table & Get Restaurant ID
        const { data: tableData, error: tableError } = await supabase
          .from("tables")
          .select("*")
          .eq("id", tableId)
          .single();

        if (tableError || !tableData) {
          setInvalidTable(true);
          return;
        }

        setTable(tableData);
        const restaurantId = tableData.restaurant_id;

        // 2. Parallel Fetch: Categories, Restaurant, and Combos with Junction Join
        const [menuRes, restRes, comboRes] = await Promise.all([
          supabase
            .from("menu_categories")
            .select(`*, menu_items(*)`)
            .eq("restaurant_id", restaurantId),
          
          supabase
            .from("restaurants")
            .select("*")
            .eq("id", restaurantId)
            .single(),

          supabase
            .from("menu_combos")
            .select(`
              *,
              menu_combo_items (
                quantity,
                menu_items ( name )
              )
            `)
            .eq("restaurant_id", restaurantId)
            .eq("is_available", true)
        ]);

        if (menuRes.error) throw menuRes.error;
        if (comboRes.error) throw comboRes.error;

        // 3. Process Menu Items
        const allItems = menuRes.data?.flatMap((cat: any) =>
          (cat.menu_items || []).map((item: any) => ({
            ...item,
            category_id: cat.id,
            category_name: cat.name,
          }))
        ) || [];

        // 4. Process Combos (Mapping nested junction items to simple included_items array)
        const allCombos = (comboRes.data || []).map((c: any) => ({
          ...c,
          included_items: (c.menu_combo_items || []).map((j: any) => ({
            name: j.menu_items?.name || "Unknown Item",
            quantity: j.quantity || 1
          })),
        }));

        setCategories(menuRes.data || []);
        setMenuItems(allItems);
        setCombos(allCombos);
        setRestaurant(restRes.data);

      } catch (err: any) {
        console.error("Fetch Error:", err);
        toast.error(err.message || "Failed to load menu");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tableId]);

  // 🔥 FILTERING LOGIC (Updated to isolate Combos)
  const displayContent = useMemo(() => {
    const query = searchQuery.toLowerCase();

    // Filter Items: Show in All or specific categories, NEVER show if "Combos" tab is active
    const filteredItems = menuItems.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category_id === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(query);
      return matchesCategory && matchesSearch && activeCategory !== "Combos" && item.is_available;
    });

    // Filter Combos: ONLY show if "Combos" tab is active
    const filteredCombos = combos.filter((combo) => {
      const matchesSearch = combo.name.toLowerCase().includes(query);
      const isCombosTab = activeCategory === "Combos";
      return isCombosTab && matchesSearch && combo.is_available;
    });

    return { filteredItems, filteredCombos };
  }, [activeCategory, searchQuery, menuItems, combos]);

  // ERROR & LOADING STATES
  if (invalidTable) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 rotate-45" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Invalid QR Code</h2>
        <p className="text-zinc-500 mt-2">This table does not exist or the link is broken.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-800" />
        <p className="text-zinc-400 font-medium animate-pulse tracking-widest uppercase text-xs">
          Setting up your menu
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 pb-32">
      <MenuHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cart.totalItems}
        onCartClick={() => setCartOpen(true)}
        restaurant={restaurant}
        table={table}
      />

      <main className="container max-w-6xl mx-auto px-4">
        <div className="sticky top-[72px] z-30 -mx-4 px-4 bg-[#fafafa]/80 dark:bg-zinc-950/80 backdrop-blur-lg">
          <CategoryTabs
            active={activeCategory}
            onChange={setActiveCategory}
            categories={categories}
          />
        </div>

        <div className="flex justify-end items-center mt-6 mb-2">
           <span className="mr-auto text-xs font-bold text-zinc-400 uppercase tracking-widest">
            {activeCategory === "Combos" ? "Exclusive Bundles" : "Our Menu"}
           </span>
          <ViewToggle view={view} onChange={setView} />
        </div>

        <div className={view === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4" : "flex flex-col gap-4 mt-4"}>
          {/* 1. RENDER COMBOS (Only visible in Combos tab now) */}
          {displayContent.filteredCombos.map((combo) => (
            <ComboCard
              key={combo.id}
              item={combo as any}
              onAdd={(item: any) => cart.addItem({
                ...item,
                price: item.discount_price,
                is_veg: false
              })}
              view={view}
            />
          ))}

          {/* 2. RENDER STANDARD ITEMS */}
          {displayContent.filteredItems.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onAdd={cart.addItem}
              view={view}
            />
          ))}
        </div>

        {displayContent.filteredItems.length === 0 && 
         displayContent.filteredCombos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <ShoppingBag className="w-8 h-8 text-zinc-300 mb-4" />
            <h3 className="text-zinc-900 font-bold">No items found</h3>
          </div>
        )}
      </main>

      {cart.totalItems > 0 && !cartOpen && (
        <div className="fixed bottom-8 left-0 right-0 px-4 z-40 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full max-w-md mx-auto flex justify-between items-center py-4 px-6 rounded-2xl bg-[#1a4d3e] text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5" />
              <div className="flex flex-col items-start">
                <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Your Order</span>
                <span className="font-bold">{cart.totalItems} Items</span>
              </div>
            </div>
            <span className="text-xl font-black">₹{cart.totalPrice}</span>
          </button>
        </div>
      )}

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