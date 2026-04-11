import { useState, useRef, useEffect } from "react";
import { Search, ShoppingBag, UtensilsCrossed, X } from "lucide-react";

interface MenuHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  onCartClick: () => void;
  tableNumber?: string;
  restaurant?: any;
}

const MenuHeader = ({ 
  searchQuery, 
  onSearchChange, 
  cartCount, 
  onCartClick, 
  tableNumber = "07" 
}: MenuHeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) inputRef.current?.focus();
  }, [isSearchOpen]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        
        {/* Left: Branding & Table Info */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 rounded-xl bg-[#1a4d3e] flex items-center justify-center shadow-sm">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          
          <div className={`flex flex-col transition-opacity duration-300 ${isSearchOpen ? 'hidden xs:flex' : 'flex'}`}>
            <span className="text-[17px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
              Saveur
            </span>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Table {tableNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Search Anchor & Cart */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          
          {/* Expanding Search Component */}
          <div className={`relative flex items-center transition-all duration-500 ease-in-out ${isSearchOpen ? 'w-full max-w-md' : 'w-10'}`}>
            <div className={`flex items-center w-full h-10 rounded-full transition-all duration-300 ${isSearchOpen ? 'bg-zinc-100 dark:bg-zinc-900 px-3 border border-zinc-200 dark:border-zinc-800' : 'bg-transparent'}`}>
              
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${!isSearchOpen ? 'bg-zinc-100 dark:bg-zinc-900 hover:scale-105 active:scale-95' : 'text-zinc-400'}`}
              >
                <Search className="h-[18px] w-[18px]" />
              </button>

              <input
                ref={inputRef}
                type="text"
                placeholder="Search delicacies..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`w-full bg-transparent text-sm font-medium focus:outline-none transition-all duration-300 ${isSearchOpen ? 'opacity-100 ml-2 mr-1' : 'opacity-0 w-0 pointer-events-none'}`}
              />

              {isSearchOpen && (
                <button 
                  onClick={() => {
                    setIsSearchOpen(false);
                    onSearchChange("");
                  }}
                  className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-zinc-500" />
                </button>
              )}
            </div>
          </div>

          {/* Cart Button */}
          {!isSearchOpen && (
            <button
              onClick={onCartClick}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 transition-all hover:scale-105 active:scale-95 border border-transparent"
            >
              <ShoppingBag className="h-[18px] w-[18px] text-zinc-900 dark:text-zinc-100" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-950">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

export default MenuHeader;