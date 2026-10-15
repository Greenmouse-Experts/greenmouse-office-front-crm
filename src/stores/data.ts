import { useState } from "react";
export const useSearch = () => {
  const [search, setSearch] = useState<string | null>(null);
  const clear = () => {
    setSearch(null);
  };

  return { search, setSearch, clear };
};
