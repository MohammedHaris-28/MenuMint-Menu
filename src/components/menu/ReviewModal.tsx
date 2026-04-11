import { useState } from "react";
import { X, Star, Heart, MessageSquare, Quote } from "lucide-react";
import { toast } from "sonner";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
}

const quickTags = [
  "😋 Delicious", 
  "⚡ Super Fast", 
  "💎 Premium Vibes", 
  "🤝 Great Staff", 
  "💰 Value for Money"
];

const ReviewModal = ({ open, onClose }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");

  if (!open) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getRatingMessage = () => {
    const r = hoveredStar || rating;
    if (r === 5) return "Absolutely Loved It!";
    if (r === 4) return "Very Good!";
    if (r === 3) return "It was decent";
    if (r === 2) return "Could be better";
    if (r === 1) return "Disappointing";
    return "How was your experience?";
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please pick a star rating first! ✨");
      return;
    }
    toast.success("Feedback received! You're awesome. 💖");
    setRating(0);
    setSelectedTags([]);
    setComment("");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[3rem] shadow-2xl animate-in slide-in-from-bottom duration-500 ease-out max-h-[90vh] flex flex-col border-t border-zinc-100">
        
        {/* Aesthetic Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-zinc-100" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <h2 className="font-black text-2xl text-zinc-900 tracking-tight">Rate your Meal</h2>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Table Service Review</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 rounded-full bg-zinc-50 text-zinc-400 hover:text-zinc-900 transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-8 no-scrollbar">
          
          {/* Rating Section */}
          <div className="text-center space-y-4">
            <p className="text-sm font-bold text-orange-500 animate-pulse uppercase tracking-tighter">
              {getRatingMessage()}
            </p>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="relative transition-transform duration-300 hover:scale-125 active:scale-90"
                >
                  <Star
                    className={`w-10 h-10 transition-all duration-300 ${
                      star <= (hoveredStar || rating)
                        ? "fill-orange-500 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                        : "text-zinc-200"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Feedback Tags */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Heart className="w-3 h-3 text-red-400" /> What stood out?
            </label>
            <div className="flex flex-wrap gap-2">
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 ${
                    selectedTags.includes(tag)
                      ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200 scale-105"
                      : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100 border border-transparent hover:border-zinc-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea Section */}
          <div className="space-y-3">
             <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Quote className="w-3 h-3 text-zinc-300" /> Share more details
            </label>
            <div className="relative group">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="The pasta was amazing, but the drinks took a while..."
                rows={4}
                className="w-full px-5 py-4 rounded-[2rem] bg-zinc-50 text-zinc-900 text-sm placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 border border-zinc-100 transition-all resize-none group-hover:border-zinc-200"
              />
              <div className="absolute bottom-4 right-5">
                <MessageSquare className="w-4 h-4 text-zinc-200" />
              </div>
            </div>
          </div>

          {/* Bottom Padding for scroll */}
          <div className="h-10" />
        </div>

        {/* Fixed Footer Action */}
        <div className="px-8 py-6 bg-white/80 backdrop-blur-md border-t border-zinc-100">
          <button
            onClick={handleSubmit}
            className="w-full py-5 rounded-[1.8rem] bg-zinc-900 text-white font-black text-sm uppercase tracking-[0.15em] transition-all active:scale-95 hover:bg-black shadow-xl shadow-zinc-200 flex items-center justify-center gap-3"
          >
            Submit Review
          </button>
        </div>
      </div>
    </>
  );
};

export default ReviewModal;