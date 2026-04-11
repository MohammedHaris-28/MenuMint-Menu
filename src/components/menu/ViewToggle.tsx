import { LayoutGrid, List } from "lucide-react";

interface ViewToggleProps {
  view: "grid" | "list";
  onChange: (v: "grid" | "list") => void;
}

const ViewToggle = ({ view, onChange }: ViewToggleProps) => {
  return (
    <div className="relative flex items-center bg-zinc-100 p-1.5 rounded-[1.25rem] w-fit shadow-inner">
      {/* Sliding Background Pill */}
      <div
        className={`absolute h-[calc(100%-12px)] w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          view === "grid" ? "translate-x-0" : "translate-x-full"
        }`}
      />

      {/* Grid Button */}
      <button
        onClick={() => onChange("grid")}
        className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors duration-200 ${
          view === "grid" ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
        }`}
        aria-label="Grid view"
      >
        <LayoutGrid className={`w-4 h-4 transition-transform duration-300 ${view === 'grid' ? 'scale-110' : 'scale-100'}`} />
        <span className="hidden sm:inline-block">Grid</span>
      </button>

      {/* List Button */}
      <button
        onClick={() => onChange("list")}
        className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors duration-200 ${
          view === "list" ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
        }`}
        aria-label="List view"
      >
        <List className={`w-4 h-4 transition-transform duration-300 ${view === 'list' ? 'scale-110' : 'scale-100'}`} />
        <span className="hidden sm:inline-block">List</span>
      </button>
    </div>
  );
};

export default ViewToggle;