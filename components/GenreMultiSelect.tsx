"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type Genre = { id: number; name: string };

type GenreMultiSelectProps = {
  options: Genre[];
  value: string[];
  onChange: (names: string[]) => void;
  onCreateGenre: (name: string) => Promise<Genre>;
  placeholder?: string;
};

export function GenreMultiSelect({
  options,
  value,
  onChange,
  onCreateGenre,
  placeholder = "Genres",
}: GenreMultiSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const trimmedQuery = query.trim();

  const filteredOptions = useMemo(() => {
    if (!trimmedQuery) return options;
    const lower = trimmedQuery.toLowerCase();
    return options.filter((o) => o.name.toLowerCase().includes(lower));
  }, [options, trimmedQuery]);

  const hasExactMatch = useMemo(
    () =>
      options.some((o) => o.name.toLowerCase() === trimmedQuery.toLowerCase()),
    [options, trimmedQuery]
  );

  const showAddNew = trimmedQuery.length > 0 && !hasExactMatch;

  function toggleGenre(name: string) {
    if (value.includes(name)) {
      onChange(value.filter((n) => n !== name));
    } else {
      onChange([...value, name]);
    }
  }

  function removeGenre(name: string) {
    onChange(value.filter((n) => n !== name));
  }

  async function handleAddNew() {
    if (!trimmedQuery || creating) return;
    setCreating(true);
    try {
      const genre = await onCreateGenre(trimmedQuery);
      if (!value.includes(genre.name)) {
        onChange([...value, genre.name]);
      }
      setQuery("");
      setOpen(false);
    } finally {
      setCreating(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "Enter" && showAddNew) {
      e.preventDefault();
      void handleAddNew();
    }
  }

  const inputClassName =
    "border m-2 border-gray-300 rounded-md px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div ref={containerRef} className="relative max-w-xs m-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {value.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 text-sm px-2 py-0.5 rounded"
            >
              {name}
              <button
                type="button"
                className="hover:text-blue-700 font-bold leading-none"
                aria-label={`Remove ${name}`}
                onClick={() => removeGenre(name)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        className={inputClassName}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />

      {open && (filteredOptions.length > 0 || showAddNew) && (
        <ul className="absolute z-10 left-2 right-2 mt-0 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.map((option) => {
            const selected = value.includes(option.name);
            return (
              <li key={option.id}>
                <button
                  type="button"
                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                    selected ? "bg-blue-50 font-medium" : ""
                  }`}
                  onClick={() => toggleGenre(option.name)}
                >
                  {selected ? "✓ " : ""}
                  {option.name}
                </button>
              </li>
            );
          })}
          {showAddNew && (
            <li>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-blue-700 hover:bg-blue-50 font-medium disabled:opacity-50"
                disabled={creating}
                onClick={() => void handleAddNew()}
              >
                Add a new genre
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
