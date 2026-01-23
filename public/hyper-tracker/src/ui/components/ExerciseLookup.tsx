import { useState, useEffect, useRef } from "react";
import { searchExercises, ExerciseSuggestion, getCategories } from "@/data/exerciseDatabase";

interface ExerciseLookupProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (exercise: ExerciseSuggestion) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export default function ExerciseLookup({
  value,
  onChange,
  onSelect,
  placeholder = "Search exercises...",
  className = "",
  id,
}: ExerciseLookupProps) {
  const [suggestions, setSuggestions] = useState<ExerciseSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (value.trim().length >= 2) {
      const results = searchExercises(value, 8);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [value]);

  function handleSelect(exercise: ExerciseSuggestion) {
    onChange(exercise.name);
    setIsOpen(false);
    setSuggestions([]);
    onSelect?.(exercise);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[selectedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        onBlur={() => {
          // Delay to allow click on suggestion
          setTimeout(() => setIsOpen(false), 150);
        }}
        placeholder={placeholder}
        className={`${className}`}
        autoComplete="off"
      />

      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto rounded-md bg-[rgb(var(--card-rgb))] border border-white/20 shadow-lg"
        >
          {suggestions.map((exercise, i) => (
            <li
              key={exercise.name}
              className={`px-3 py-2 cursor-pointer flex items-center justify-between gap-2 ${
                i === selectedIndex
                  ? "bg-[rgb(var(--accent-rgb))] text-[rgb(var(--ink))]"
                  : "hover:bg-white/10"
              }`}
              onMouseDown={() => handleSelect(exercise)}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{exercise.name}</div>
                {exercise.defaultSets && (
                  <div className={`text-xs ${i === selectedIndex ? "opacity-70" : "text-subtle"}`}>
                    {exercise.defaultSets}
                  </div>
                )}
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded shrink-0 ${
                  i === selectedIndex
                    ? "bg-[rgb(var(--ink))]/20"
                    : "bg-white/10"
                }`}
              >
                {exercise.category}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Quick category hints when empty */}
      {!value && isOpen && (
        <div className="absolute z-50 w-full mt-1 p-3 rounded-md bg-[rgb(var(--card-rgb))] border border-white/20 shadow-lg">
          <div className="text-xs text-subtle mb-2">Try searching:</div>
          <div className="flex flex-wrap gap-1">
            {getCategories().slice(0, 8).map((cat) => (
              <button
                key={cat}
                type="button"
                className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                onMouseDown={() => {
                  onChange(cat);
                  inputRef.current?.focus();
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
