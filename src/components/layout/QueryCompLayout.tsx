import type { ApiResponse } from "@/client/api";
import { extract_message } from "@/helpers/auth";
import type { UseQueryResult } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { AlertCircle, RefreshCcw, ShieldOff } from "lucide-react";
import type { ReactNode } from "react";

interface QueryCompLayoutProps<T> {
  query: UseQueryResult<T>;
  children: ReactNode | ((data: T) => ReactNode);
}

export default function QueryCompLayout<T>({
  query,
  children,
}: QueryCompLayoutProps<T>) {
  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="loading loading-spinner loading-md" />
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
          <h3 className="text-lg font-semibold text-base-content">
            Access Denied
          </h3>
          <p className="mt-1 text-sm text-base-content/60 max-w-xs">
            {extract_message(query.error as AxiosError<ApiResponse>)}
          </p>
        </div>
      );
    }

    return (
      <div className="min-h-32 w-full flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300">
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

  // if (query.isError) {
  //   return (
  //     <div className="text-center py-8 text-error text-sm">
  //       Failed to load data.
  //     </div>
  //   );
  // }
  if (!query.data) return null;
  return (
    <>{typeof children === "function" ? children(query.data) : children}</>
  );
}
