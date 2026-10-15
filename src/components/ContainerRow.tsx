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

  if (!showSearch && !children) {
    return null;
  }
  return (
    <div
      className={`px-4 py-3 bg-base-100 border-t border-b  fade flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between ${className}`}
    >
      {showSearch && (
        <div className="w-fit  sm:w-72 sm:max-w-xs shrink-0">
          <SearchBar
            value={search || ""}
            onChange={handleSearch}
            onSubmit={handleSearch}
            placeholder={searchPlaceholder}
            className="w-full"
          />
        </div>
      )}

      {children && (
        <div className="flex items-center gap-2.5 flex-1 sm:w-auto flex-wrap sm:flex-nowrap justify-start sm:justify-end ml-auto  ">
          {children}
        </div>
      )}
    </div>
  );
}
