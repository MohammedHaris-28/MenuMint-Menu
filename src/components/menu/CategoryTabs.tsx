import { Category } from "@/data/menuData";
import { 
  Sparkles, Utensils, ChefHat, IceCream, 
  GlassWater, Flame, LayoutGrid, Package 
} from "lucide-react";

// ✅ Icon mapping (Combos added)
const categoryIcons: Record<string, React.ReactNode> = {
  All: <Sparkles className="w-4 h-4" />,
  Combos: <Package className="w-4 h-4" />, // New Icon for Combos
  Starters: <Utensils className="w-4 h-4" />,
  "Main Course": <ChefHat className="w-4 h-4" />,
  Desserts: <IceCream className="w-4 h-4" />,
  Juices: <GlassWater className="w-4 h-4" />,
  Specials: <Flame className="w-4 h-4" />,
  Drinks: <GlassWater className="w-4 h-4" />,
};

interface CategoryTabsProps {
  active: string; // Accepts "All", "Combos", or a UUID string
  onChange: (id: string) => void;
  categories: Category[];
}

const CategoryTabs = ({ active, onChange, categories }: CategoryTabsProps) => {
  
  // Reusable Button Styles to keep the JSX clean
  const getBtnStyles = (isActive: boolean) => `
    relative flex items-center gap-2 px-5 py-2.5 rounded-2xl whitespace-nowrap
    text-sm font-semibold transition-all duration-300 ease-out active:scale-95 select-none
    ${isActive 
      ? "bg-[#1a4d3e] text-white shadow-lg shadow-emerald-900/20 translate-y-[-1px]" 
      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200"
    }
  `;

  return (
    <div className="w-full bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="flex gap-3 overflow-x-auto py-4 px-4 scrollbar-hide items-center">
        
        {/* 1. Static "All" Button */}
        <button
          onClick={() => onChange("All")}
          className={getBtnStyles(active === "All")}
        >
          <Sparkles className={`w-4 h-4 ${active === "All" ? "scale-110" : ""}`} />
          <span>All</span>
        </button>

        {/* 2. Static "Combos" Button - Added this section */}
        <button
          onClick={() => onChange("Combos")}
          className={getBtnStyles(active === "Combos")}
        >
          <Package className={`w-4 h-4 text-orange-400 ${active === "Combos" ? "scale-110" : ""}`} />
          <span className="tracking-tight">Combos</span>
          {active === "Combos" && (
             <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
             </span>
          )}
        </button>

        {/* 3. Dynamic Category Buttons from Supabase */}
        {categories.map((cat) => {
          const isActive = active === cat.id;
          const Icon = categoryIcons[cat.name] || <LayoutGrid className="w-4 h-4" />;
          
          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className={getBtnStyles(isActive)}
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