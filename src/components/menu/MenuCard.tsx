import { Plus, Check, Flame, Star } from "lucide-react";
import { type MenuItem, getMenuImageUrl } from "@/data/menuData";
import { useState } from "react";

interface MenuCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  view: "grid" | "list";
  isCombo?: boolean; //
}

const MenuCard = ({ item, onAdd, view }: MenuCardProps) => {
  const [justAdded, setJustAdded] = useState(false);

  const imageUrl = getMenuImageUrl(item.image_url);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.is_available) return;
    onAdd(item);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 800);
  };

  const DietBadge = () => (
    <div className="flex items-center justify-center bg-white/80 backdrop-blur-md p-1 rounded-md shadow-sm border border-white/20">
      <div className={`w-3 h-3 border flex items-center justify-center ${
        item.is_veg ? "border-green-600" : "border-red-600"
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${
          item.is_veg ? "bg-green-600" : "bg-red-600"
        }`} />
      </div>
    </div>
  );

  // ================= LIST VIEW (Premium Slim) =================
  if (view === "list") {
    return (
      <div
        className={`group relative flex gap-4 p-3 bg-white rounded-[1.5rem] border border-zinc-100 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/50 hover:border-orange-200 ${
          !item.is_available ? "opacity-60 grayscale-[0.5]" : ""
        }`}
      >
        <div className="relative shrink-0">
          <img
            src={imageUrl}
            alt={item.name}
            className="w-24 h-24 rounded-2xl object-cover shadow-md transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute -top-1 -left-1">
            <DietBadge />
          </div>
        </div>

        <div className="flex-1 flex flex-col py-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="font-extrabold text-zinc-900 text-base leading-tight">
                  {item.name}
                </h3>
                
              </div>
              <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed font-medium italic">
                {item.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Price</span>
              <span className="font-black text-zinc-900">₹{item.price.toFixed(2)}</span>
            </div>

            <button
              onClick={handleAdd}
              disabled={!item.is_available}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black transition-all duration-300 overflow-hidden ${
                justAdded 
                  ? "bg-green-600 text-white" 
                  : "bg-zinc-900 text-white hover:bg-orange-600 active:scale-95 shadow-lg shadow-zinc-200"
              } ${!item.is_available ? "bg-zinc-100 text-zinc-400 shadow-none pointer-events-none" : ""}`}
            >
              {justAdded ? (
                <><Check className="w-3.5 h-3.5 animate-in zoom-in" /> Added</>
              ) : (
                <><Plus className="w-3.5 h-3.5" /> ADD</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= GRID VIEW (Premium Card) =================
  return (
    <div
      className={`group relative bg-white rounded-[2rem] border border-zinc-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-zinc-300/50 hover:-translate-y-1 ${
        !item.is_available ? "opacity-80" : ""
      }`}
    >
      <div className="relative aspect-[1/1] overflow-hidden">
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
           <DietBadge />
           
        </div>

        {!item.is_available && (
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-zinc-900 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em]">
              Gone for today
            </span>
          </div>
        )}
        
        {/* Bottom Image Overlay Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-4 pt-3">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-zinc-900 text-sm leading-tight group-hover:text-orange-600 transition-colors">
            {item.name}
          </h3>
        </div>

        <p className="text-[11px] text-zinc-400 line-clamp-1 mb-4 font-medium italic">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-col leading-none">
            <span className="text-[10px] text-zinc-400 font-bold uppercase mb-0.5">Price</span>
            <span className="font-black text-zinc-900 text-base">₹{item.price.toFixed(0)}</span>
          </div>

          <button
            onClick={handleAdd}
            disabled={!item.is_available}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 shadow-lg ${
              justAdded 
                ? "bg-green-600 text-white w-20 rounded-2xl" 
                : "bg-zinc-900 text-white hover:bg-orange-600 hover:rotate-90 active:scale-90 shadow-zinc-200"
            } ${!item.is_available ? "bg-zinc-100 text-zinc-300 shadow-none" : ""}`}
          >
            {justAdded ? (
              <span className="flex items-center gap-1 text-[10px] font-black animate-in fade-in duration-300">
                <Check className="w-3.5 h-3.5" /> DONE
              </span>
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;