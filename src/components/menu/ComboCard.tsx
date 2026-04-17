import { Plus, Check, Tag, Package, ChevronDown } from "lucide-react";
import { getMenuImageUrl, type MenuCombo } from "@/data/menuData";
import { useState } from "react";

// Define the structure for items inside the combo
export interface ComboItem {
  name: string;
  quantity: number;
}

// The complete interface for the Combo
export interface ComboWithItems extends MenuCombo {
  included_items: ComboItem[];
}

interface ComboCardProps {
  item: ComboWithItems;
  onAdd: (item: any) => void;
  view: "grid" | "list";
}

const ComboCard = ({ item, onAdd, view }: ComboCardProps) => {
  const [justAdded, setJustAdded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const imageUrl = getMenuImageUrl(item.image_url);
  const displayPrice = item.discount_price;
  const originalPrice = item.total_price;
  const savingAmount = originalPrice - displayPrice;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.is_available) return;
    onAdd(item);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 800);
  };

  const ComboBadge = () => (
    <div className="flex items-center gap-1.5 bg-zinc-900 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
      <Package className="w-3.5 h-3.5 text-orange-400" />
      Bundle Offer
    </div>
  );

  const ComboItemsList = ({ items }: { items: ComboItem[] }) => {
    if (!items || items.length === 0) return null;

    const maxVisible = isExpanded || view === "list" ? items.length : 3;
    const visibleItems = items.slice(0, maxVisible);
    const remainingCount = items.length - visibleItems.length;

    return (
      <div className="space-y-2 mt-4 mb-3 border-t border-zinc-100 pt-4">
        {visibleItems.map((ci, idx) => (
          <div key={idx} className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Check className="w-4 h-4" />
            </div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
              {ci.name}
              {ci.quantity > 1 && <span className="text-zinc-400 font-medium ml-1.5">x{ci.quantity}</span>}
            </p>
          </div>
        ))}
        {remainingCount > 0 && (
          <p className="text-xs text-zinc-400 font-semibold pl-12">
            + {remainingCount} more item{remainingCount > 1 ? 's' : ''}...
          </p>
        )}
      </div>
    );
  };

  // ================= LIST VIEW =================
  if (view === "list") {
    return (
      <div className={`group relative flex gap-4 p-4 bg-white rounded-[1.5rem] border border-zinc-100 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/50 ${!item.is_available ? "opacity-60 grayscale-[0.5]" : ""}`}>
        <div className="relative shrink-0">
          <img src={imageUrl} alt={item.name} className="w-28 h-28 rounded-2xl object-cover shadow-md transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute top-2 left-2"><ComboBadge /></div>
        </div>

        <div className="flex-1 flex flex-col py-1">
          <h3 className="font-extrabold text-zinc-900 text-base leading-tight capitalize mb-1">{item.name}</h3>
          <p className="text-xs text-zinc-500 line-clamp-1 font-medium italic mb-2">{item.description}</p>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl text-zinc-900">₹{displayPrice.toFixed(0)}</span>
                <span className="text-sm text-zinc-400 line-through font-bold">₹{originalPrice.toFixed(0)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
               {savingAmount > 0 && (
                  <div className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full">Save ₹{savingAmount}</div>
               )}
               <button onClick={handleAdd} className={`p-2.5 rounded-xl transition-all ${justAdded ? "bg-green-600 text-white" : "bg-zinc-900 text-white"}`}>
                  {justAdded ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= GRID VIEW =================
  return (
    <div className={`group relative bg-white rounded-[2rem] border border-zinc-100 overflow-hidden transition-all duration-500 hover:shadow-2xl ${!item.is_available ? "opacity-80" : ""}`}>
      <div className="relative aspect-square overflow-hidden">
        <img src={imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute top-4 left-4"><ComboBadge /></div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-extrabold text-zinc-900 text-lg leading-tight capitalize">{item.name}</h3>
          {item.included_items.length > 3 && (
             <button onClick={() => setIsExpanded(!isExpanded)} className={`text-zinc-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5" />
             </button>
          )}
        </div>
        <p className="text-[11px] text-zinc-400 line-clamp-1 mb-4 italic">{item.description}</p>

        <ComboItemsList items={item.included_items} />

        <div className="flex items-center justify-between border-t border-zinc-100 pt-5 mt-4">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-black text-zinc-900 text-2xl">₹{displayPrice.toFixed(0)}</span>
              <span className="text-xs text-zinc-400 line-through font-bold">₹{originalPrice.toFixed(0)}</span>
            </div>
          </div>
          <button onClick={handleAdd} className={`flex items-center justify-center rounded-full transition-all ${justAdded ? "bg-green-600 text-white w-20 h-10 rounded-2xl" : "bg-zinc-900 text-white w-10 h-10"}`}>
            {justAdded ? <span className="text-[10px] font-black">DONE</span> : <Plus className="w-6 h-6" />}
          </button>
        </div>
        {savingAmount > 0 && (
          <div className="mt-3 bg-emerald-500 text-white text-[10px] font-black py-1 px-3 rounded-full inline-flex items-center gap-1">
            <Tag className="w-3 h-3" /> SAVE ₹{savingAmount}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComboCard;