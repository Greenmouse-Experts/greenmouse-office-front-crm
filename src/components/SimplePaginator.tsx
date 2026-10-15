interface PaginationProps {
  page: number;
  setPage: (page: number) => void;
  incrementPage: () => void;
  decrementPage: () => void;
  hasMore?: boolean;
}

export default function SimplePaginator({
  page,
  setPage: _setPage,
  incrementPage,
  decrementPage,
  hasMore = true,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        className="btn btn-outline"
        onClick={decrementPage}
        disabled={page === 1}
      >
        Previous
      </button>
      <span className="text-lg font-semibold">Page {page}</span>
      <button
        className="btn btn-outline"
        onClick={incrementPage}
        disabled={!hasMore}
      >
        Next
      </button>
    </div>
  );
}
