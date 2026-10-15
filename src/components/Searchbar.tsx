import { SearchIcon, X } from "lucide-react";
import { useState, useEffect } from "react";

interface SearchBarProps {
  value?: string;
  onChange?: (val: string) => void;
  onSubmit?: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value = "",
  onChange,
  onSubmit,
  placeholder = "Search...",
  className = "",
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(value);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    onChange?.(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm("");
    onChange?.("");
    onSubmit?.("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center ${className}`}
    >
      <SearchIcon className="absolute left-3 size-4 text-base-content/40 pointer-events-none" />
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder={placeholder}
        className="input input-sm input-bordered w-full pl-9 pr-8 bg-base-100/60 focus:bg-base-100 transition-colors"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 text-base-content/40 hover:text-base-content/70 p-0.5 rounded-full"
        >
          <X className="size-3.5" />
        </button>
      )}
    </form>
  );
}
