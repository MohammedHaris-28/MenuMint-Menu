import { Bell, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface FloatingActionsProps {
  onReviewClick: () => void;
}

const FloatingActions = ({ onReviewClick }: FloatingActionsProps) => {
  const handleCallWaiter = () => {
    toast.success("Waiter Notified", {
      description: "A server is on their way to your table.",
      icon: <Bell className="w-4 h-4 text-orange-500" />,
      className: "rounded-[1.5rem] border-none shadow-2xl bg-white/90 backdrop-blur-md",
    });
  };

  // Define our custom ring animation as a string
  const ringAnimation = `
    @keyframes ring {
      0% { transform: rotate(0); }
      10% { transform: rotate(15deg); }
      20% { transform: rotate(-15deg); }
      30% { transform: rotate(10deg); }
      40% { transform: rotate(-10deg); }
      50% { transform: rotate(0); }
      100% { transform: rotate(0); }
    }
    .animate-ring {
      animation: ring 1.5s ease infinite;
    }
  `;

  return (
    <div className="fixed bottom-28 right-5 z-40 flex flex-col gap-4">
      {/* Injecting the custom animation style safely */}
      <style dangerouslySetInnerHTML={{ __html: ringAnimation }} />

      {/* Call Waiter Button */}
      <div className="relative group">
        <div className="absolute inset-0 bg-orange-500/20 rounded-2xl animate-pulse blur-xl group-hover:bg-orange-500/30 transition-all" />
        
        <button
          onClick={handleCallWaiter}
          className="relative flex items-center justify-center gap-3 bg-zinc-900 text-white p-4 rounded-2xl shadow-xl shadow-zinc-900/20 transition-all duration-300 active:scale-90 hover:-translate-y-1 hover:bg-black group"
        >
          <div className="relative">
            <Bell className="w-5 h-5 group-hover:animate-ring" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full border-2 border-zinc-900" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest hidden sm:block">
            Call Waiter
          </span>
        </button>
      </div>

      {/* Review Button */}
      <button
        onClick={onReviewClick}
        className="flex items-center justify-center gap-3 bg-white/80 backdrop-blur-xl text-zinc-900 p-4 rounded-2xl border border-white shadow-xl shadow-black/5 transition-all duration-300 active:scale-90 hover:-translate-y-1 hover:bg-white"
      >
        <MessageSquare className="w-5 h-5 text-zinc-500" />
        <span className="text-xs font-black uppercase tracking-widest hidden sm:block">
          Give Feedback
        </span>
        <Sparkles className="w-3.5 h-3.5 text-orange-400 hidden sm:block" />
      </button>

      <div className="text-right pr-1">
        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] pointer-events-none">
          Service
        </span>
      </div>
    </div>
  );
};

export default FloatingActions;