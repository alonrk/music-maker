import { GENRES } from "@/utils/genres";

export default function GenreSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {GENRES.map((genre) => {
        const isSelected = selected === genre.id;
        return (
          <button
            key={genre.id}
            onClick={() => onSelect(isSelected ? null : genre.id)}
            className={`
              relative flex flex-col items-center gap-1.5 p-4 rounded-xl border transition-all duration-200
              ${isSelected
                ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20"
                : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
              }
            `}
          >
            <span className="text-2xl">{genre.icon}</span>
            <span className={`text-sm font-medium ${isSelected ? "text-emerald-400" : "text-white/80"}`}>
              {genre.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
