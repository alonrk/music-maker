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
                ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10"
                : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm"
              }
            `}
          >
            <span className="text-2xl">{genre.icon}</span>
            <span className={`text-sm font-medium ${isSelected ? "text-blue-600" : "text-slate-600"}`}>
              {genre.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
