import { Category } from "@/data/menuData";
import { Sparkles, Utensils, ChefHat, IceCream, GlassWater, Flame, LayoutGrid } from "lucide-react";

// ✅ Updated to map icons by Name string since IDs change per restaurant
const categoryIcons: Record<string, React.ReactNode> = {
  All: <Sparkles className="w-4 h-4" />,
  Starters: <Utensils className="w-4 h-4" />,
  "Main Course": <ChefHat className="w-4 h-4" />,
  Desserts: <IceCream className="w-4 h-4" />,
  Juices: <GlassWater className="w-4 h-4" />,
  Specials: <Flame className="w-4 h-4" />,
  Drinks: <GlassWater className="w-4 h-4" />, // Added to match your DB
};

interface CategoryTabsProps {
  active: string; // Now accepts "All" or a UUID string
  onChange: (id: string) => void;
  categories: Category[]; // Passed from Index.tsx fetch
}

const CategoryTabs = ({ active, onChange, categories }: CategoryTabsProps) => {
  return (
    <div className="w-full bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="flex gap-3 overflow-x-auto py-4 px-4 scrollbar-hide items-center">
        
        {/* 1. Static "All" Button */}
        <button
          onClick={() => onChange("All")}
          className={`
            relative flex items-center gap-2 px-5 py-2.5 rounded-2xl whitespace-nowrap
            text-sm font-semibold transition-all duration-300 ease-out active:scale-95
            ${active === "All" 
              ? "bg-[#1a4d3e] text-white shadow-lg shadow-emerald-900/20 translate-y-[-1px]" 
              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200"
            }
          `}
        >
          <Sparkles className={`w-4 h-4 ${active === "All" ? "scale-110" : ""}`} />
          <span>All</span>
        </button>

        {/* 2. Dynamic Category Buttons from Supabase */}
        {categories.map((cat) => {
          const isActive = active === cat.id;
          // Fallback to a default icon if name doesn't match our map
          const Icon = categoryIcons[cat.name] || <LayoutGrid className="w-4 h-4" />;
          
          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className={`
                relative flex items-center gap-2 px-5 py-2.5 rounded-2xl whitespace-nowrap
                text-sm font-semibold transition-all duration-300 ease-out
                active:scale-95 select-none
                ${isActive 
                  ? "bg-[#1a4d3e] text-white shadow-lg shadow-emerald-900/20 translate-y-[-1px]" 
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200"
                }
              `}
            >
              <span className={`transition-transform duration-300 ${isActive ? "scale-110" : "scale-100"}`}>
                {Icon}
              </span>
              <span className="tracking-tight">{cat.name}</span>
              
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white opacity-50" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTabs;