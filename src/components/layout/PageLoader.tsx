import { extract_message } from "@/helpers/auth";
import type { QueryObserverResult } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/api/simpleApi";
import {
  Loader2,
  AlertCircle,
  RefreshCcw,
  ShieldOff,
  Inbox,
} from "lucide-react";

interface EmptyStateConfig {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

interface PageLoaderProps<TData> {
  children?: React.ReactNode | ((data: TData) => React.ReactNode);
  query: QueryObserverResult<TData>;
  customLoading?: React.ReactNode;
  loadingText?: string;
  showSuccessState?: boolean;
  emptyState?: EmptyStateConfig;
}

export default function PageLoader<TData>(props: PageLoaderProps<TData>) {
  const {
    query,
    customLoading,
    children,
    loadingText = "Loading...",
    emptyState,
  } = props;

  if (query.isLoading) {
    if (customLoading) {
      return customLoading;
    }
    return (
      <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
        <div className="relative flex items-center justify-center mb-8">
          {/* Animated Rings */}
          <div className="absolute h-24 w-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin duration-[2000ms]" />
          <div className="absolute h-20 w-20 rounded-full border-4 border-primary/5 border-b-primary/40 animate-spin-reverse duration-[3000ms]" />

          {/* Center Icon */}
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-lg font-semibold tracking-tight text-base-content/80">
            {loadingText}
          </h3>
        </div>
      </div>
    );
  }

  if (query.isError) {
    const is403 =
      (query.error as AxiosError<ApiResponse>)?.response?.status === 403;

    if (is403) {
      return (
        <div className="min-h-[40vh] w-full flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300">
          <div className="mb-4 rounded-full bg-error/10 p-3 text-error">
            <ShieldOff className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-base-content">Access Denied</h3>
          <p className="mt-1 text-sm text-base-content/60 max-w-xs">
            You don't have permission to view this resource. Contact support or
            a Super Admin to request access.
          </p>
        </div>
      );
    }

    return (
      <div className="min-h-[40vh] w-full flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300">
        <div className="mb-4 rounded-full bg-error/10 p-3 text-error">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-base-content">
          Something went wrong
        </h3>
        <p className="mt-1 text-sm text-base-content/60 max-w-xs">
          {extract_message(query.error as AxiosError<ApiResponse>)}
        </p>
        <button
          onClick={() => query.refetch()}
          className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-content hover:opacity-90 transition-all active:scale-95"
        >
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (!query.data) return null;

  if (Array.isArray(query.data) && query.data.length === 0 && emptyState) {
    return (
      <div className="min-h-[40vh] w-full flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300 bg-base-100 rounded-2xl border border-base-200">
        <div className="mb-4 rounded-full bg-base-200 p-4 text-base-content/40">
          <Inbox className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-base-content">
          {emptyState.title ?? "No Records Found"}
        </h3>
        <p className="mt-1 text-sm text-base-content/60 max-w-sm">
          {emptyState.description ??
            "There are currently no items available in this view."}
        </p>
        {emptyState.actionText && emptyState.onAction && (
          <button
            onClick={emptyState.onAction}
            className="mt-5 btn btn-primary btn-sm"
          >
            {emptyState.actionText}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      {typeof children === "function" ? children(query.data) : children}
    </div>
  );
}
