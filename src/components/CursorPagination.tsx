export interface CursorPaginationProps {
  hasMore: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  isFetching?: boolean;
  page?: number;
  totalCount?: number;
  limit?: number;
}

export default function CursorPagination({
  hasMore,
  hasPrev,
  onNext,
  onPrev,
  isFetching,
  page = 1,
  totalCount,
  limit = 10,
}: CursorPaginationProps) {
  if (!hasMore && !hasPrev && !totalCount) return null;

  const totalPages =
    totalCount !== undefined && totalCount > 0
      ? Math.max(1, Math.ceil(Number(totalCount) / limit))
      : null;

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-base-200 bg-base-100">
      <div className="text-xs text-base-content/60">
        {totalCount !== undefined ? (
          <span>
            Total results:{" "}
            <strong className="font-semibold text-base-content">
              {totalCount}
            </strong>
          </span>
        ) : null}
      </div>

      <div className="join">
        <button
          className="join-item btn btn-sm"
          disabled={!hasPrev || isFetching}
          onClick={onPrev}
          title="Previous page"
        >
          «
        </button>
        <button className="join-item btn btn-sm btn-disabled text-base-content font-medium">
          {isFetching ? (
            <span className="loading loading-spinner loading-xs" />
          ) : totalPages ? (
            `Page ${page} of ${totalPages}`
          ) : (
            `Page ${page}`
          )}
        </button>
        <button
          className="join-item btn btn-sm"
          disabled={!hasMore || isFetching}
          onClick={onNext}
          title="Next page"
        >
          »
        </button>
      </div>
    </div>
  );
}
