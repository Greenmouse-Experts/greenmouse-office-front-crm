import type { useSearch } from "@/stores/data";
import type { PropsWithChildren } from "react";
import SearchBar from "./Searchbar";

interface ContainerRowProps extends PropsWithChildren {
  searchProps?: ReturnType<typeof useSearch>;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (val: string) => void;
  className?: string;
}

export default function ContainerRow({
  children,
  searchProps,
  showSearch = false,
  searchPlaceholder = "Search...",
  onSearchChange,
  className = "",
}: ContainerRowProps) {
  const { search, setSearch } = searchProps || {};

  const handleSearch = (term: string) => {
    if (setSearch) {
      setSearch(term);
    }
    onSearchChange?.(term);
  };

  return (
    <div
      className={`p-3 sm:px-4 sm:py-3 bg-base-100 border border-base-200 border-b-0 ring ring-current/20 flex flex-col border-l border-r bg  sm:flex-row gap-3 items-center justify-between ${className}`}
    >
      {showSearch && (
        <SearchBar
          value={search || ""}
          onChange={handleSearch}
          onSubmit={handleSearch}
          placeholder={searchPlaceholder}
        />
      )}

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end ml-auto">
        {children}
      </div>
    </div>
  );
}
