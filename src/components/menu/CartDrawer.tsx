import { X, Plus, Minus, ShoppingBag, Loader2, ReceiptText, ChevronRight } from "lucide-react";
import type { CartItem } from "@/hooks/useCart";
import { getMenuImageUrl } from "@/data/menuData";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  totalPrice: number;
  onAdd: (item: any) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  restaurantId: string | null;
  tableId: string | undefined;
}

const CartDrawer = ({ 
  open, 
  onClose, 
  items, 
  totalPrice, 
  onAdd, 
  onRemove, 
  onClear,
  restaurantId,
  tableId 
}: CartDrawerProps) => {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Bill Calculations for UI Display
  const taxPercentage = 5; 
  const subtotal = totalPrice;
  const taxAmount = (subtotal * taxPercentage) / 100;
  const totalAmount = subtotal + taxAmount;
  const cgst = taxAmount / 2;
  const sgst = taxAmount / 2;

  if (!open) return null;

  const handlePlaceOrder = async () => {
    if (!restaurantId || !tableId) {
      toast.error("Session expired. Please scan QR again.");
      return;
    }

    if (items.length === 0) return;

    setIsPlacingOrder(true);

    try {
      const orderTimestamp = new Date().toISOString();

      // 1. Insert Parent Order
      // FIX: We send the raw subtotal as the 'total' because the Admin 
      // Dashboard/Backend will handle tax calculations to avoid double-taxing.
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          restaurant_id: restaurantId,
          table_id: tableId,
          status: "pending",
          subtotal: subtotal,
          cgst: 0, // Set to 0 as dashboard handles it
          sgst: 0, // Set to 0 as dashboard handles it
          total: subtotal, // Sending only item total
          tax_percentage: taxPercentage,
          created_at: orderTimestamp,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Prepare Order Items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      // 3. Insert Order Items
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        await supabase.from("orders").delete().eq("id", order.id);
        throw itemsError;
      }

      toast.success("Order sent to kitchen! 👨‍🍳");
      onClear();
      onClose();

    } catch (error: any) {
      console.error("Order process error:", error);
      toast.error("Order failed: " + (error.message || "Something went wrong"));
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[95vh] flex flex-col border-t border-zinc-100">
        
        {/* Aesthetic Handle */}
        <div className="flex justify-center pt-4 pb-1">
          <div className="w-10 h-1 rounded-full bg-zinc-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-50">
          <div>
            <h2 className="font-extrabold text-2xl text-zinc-900 flex items-center gap-2">
              My Cart <span className="text-sm font-medium bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{items.length} items</span>
            </h2>
            <p className="text-xs text-zinc-400 font-medium mt-0.5 uppercase tracking-widest">
              Table Order
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full bg-zinc-100 text-zinc-500 transition-colors active:bg-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-hide">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-zinc-200" />
              </div>
              <p className="text-zinc-400 font-medium">Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                    <img
                      src={getMenuImageUrl(item.image_url || (item as any).image)}
                      alt={item.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-zinc-100 shadow-sm"
                    />
                    
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-zinc-800 line-clamp-1">{item.name}</h4>
                      <p className="text-sm font-extrabold text-zinc-900 mt-0.5">₹{item.price.toFixed(2)}</p>
                      
                      <div className="flex items-center gap-3 mt-2 bg-zinc-50 w-fit px-2 py-1 rounded-xl border border-zinc-100">
                        <button onClick={() => onRemove(item.id)} className="hover:text-orange-600"><Minus className="w-3 h-3" /></button>
                        <span className="text-xs font-bold min-w-[14px] text-center">{item.quantity}</span>
                        <button onClick={() => onAdd(item)} className="hover:text-orange-600"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-black text-zinc-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill Summary (Displaying taxes to user only) */}
              <div className="bg-zinc-50 rounded-[2rem] p-5 border border-zinc-100">
                <div className="flex items-center gap-2 mb-4 text-zinc-800">
                  <ReceiptText className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold">Bill Summary</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-zinc-500">
                    <span>Item Total</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-zinc-500">
                    <span>Taxes ({taxPercentage}%)</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-dashed border-zinc-200 flex justify-between items-center">
                    <span className="font-bold text-zinc-900">Grand Total</span>
                    <span className="font-black text-xl text-orange-600">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pb-4">
                <p className="text-[10px] text-center text-zinc-400 font-medium leading-relaxed uppercase tracking-wider">
                  Kitchen will begin preparing <br /> 
                  your food immediately.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Action */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-zinc-100 pb-10">
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-zinc-300 shadow-xl shadow-zinc-200"
            >
              {isPlacingOrder ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] opacity-70 uppercase tracking-widest font-medium">Checkout</span>
                    <span className="text-lg">Place Order</span>
                  </div>
                  <div className="h-8 w-[1px] bg-white/20 mx-2" />
                  <div className="flex items-center gap-1">
                    {/* Still showing full amount to user for transparency */}
                    <span className="text-lg">₹{totalAmount.toFixed(2)}</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;