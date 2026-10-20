import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import PageLoader from "@/components/layout/PageLoader";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  type Notification,
} from "@/api/notifications-api";

export const Route = createFileRoute("/staff/notifications/")({
  component: NotificationsPage,
});

const errorMessage = (error: unknown, fallback: string) => {
  const response = error as {
    response?: { data?: { message?: string | string[] } };
  };
  const message = response.response?.data?.message;
  return (Array.isArray(message) ? message.join(". ") : message) || fallback;
};

function NotificationItem({
  notification,
  onMarkRead,
  isMarking,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  isMarking: boolean;
}) {
  const date = new Date(notification.createdAt);
  const type = notification.type?.replace(/[_-]/g, " ");
  return (
    <li
      className={`flex items-start gap-3 border-b border-base-200 p-4 last:border-b-0 ${notification.isRead ? "" : "bg-primary/5"}`}
    >
      <span
        className={`mt-1 flex size-9 shrink-0 items-center justify-center rounded-full ${notification.isRead ? "bg-base-200 text-base-content/60" : "bg-primary/10 text-primary"}`}
      >
        <Bell className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <div>
            <h3 className="font-medium">{notification.title}</h3>
            {type && (
              <span className="text-xs capitalize text-base-content/50">
                {type}
              </span>
            )}
          </div>
          {Number.isFinite(date.getTime()) && (
            <time
              dateTime={notification.createdAt}
              className="text-xs text-base-content/60"
            >
              {date.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </time>
          )}
        </div>
        <p className="mt-1 text-sm text-base-content/70 whitespace-pre-wrap break-words">
          {notification.message}
        </p>
        {!notification.isRead && (
          <button
            type="button"
            className="btn btn-ghost btn-xs mt-3 text-primary"
            onClick={() => onMarkRead(notification.id)}
            disabled={isMarking}
          >
            Mark as read
          </button>
        )}
      </div>
    </li>
  );
}

function NotificationsPage() {
  const unreadCountQuery = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;
  const notificationsQuery = useNotifications({ page, limit, unreadOnly });

  const markOne = async (id: string) => {
    try {
      await markRead.mutateAsync(id);
      toast.success("Notification marked as read.");
      if (unreadOnly && notificationsQuery.data?.length === 1 && page > 1)
        setPage(page - 1);
    } catch (error) {
      toast.error(errorMessage(error, "Could not mark notification as read."));
    }
  };

  const markAll = async () => {
    try {
      await markAllRead.mutateAsync();
      setPage(1);
      toast.success("All notifications marked as read.");
    } catch (error) {
      toast.error(
        errorMessage(error, "Could not mark all notifications as read."),
      );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Notifications</h1>
        <p className="mt-1 text-sm text-base-content/60">
          Review and manage recent notifications.
        </p>
        <Link to="/staff/settings/notifications" className="link link-primary mt-2 inline-block text-sm">
          Reminder preferences
        </Link>
      </div>

      <section className="space-y-4" aria-labelledby="inbox-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-primary" aria-hidden="true" />
            <h2 id="inbox-heading" className="text-lg font-semibold">
              Inbox
            </h2>
            {typeof unreadCountQuery.data === "number" && (
              <span className="badge badge-primary badge-sm">
                {unreadCountQuery.data} unread
              </span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm gap-2"
            onClick={markAll}
            disabled={markAllRead.isPending || unreadCountQuery.data === 0}
          >
            <CheckCheck className="size-4" aria-hidden="true" /> Mark all read
          </button>
        </div>
        <div className="flex gap-2" aria-label="Filter notifications">
          <button
            type="button"
            className={`btn btn-sm ${unreadOnly ? "btn-ghost" : "btn-primary"}`}
            aria-pressed={!unreadOnly}
            onClick={() => {
              setUnreadOnly(false);
              setPage(1);
            }}
          >
            All
          </button>
          <button
            type="button"
            className={`btn btn-sm ${unreadOnly ? "btn-primary" : "btn-ghost"}`}
            aria-pressed={unreadOnly}
            onClick={() => {
              setUnreadOnly(true);
              setPage(1);
            }}
          >
            Unread
          </button>
        </div>
        <PageLoader
          query={notificationsQuery}
          loadingText="Loading notifications..."
          emptyState={{
            title: unreadOnly ? "All caught up" : "No notifications yet",
            description: unreadOnly
              ? "You have no unread notifications."
              : "New notifications will appear here.",
          }}
        >
          {(notifications) => (
            <>
              <ul className="overflow-hidden rounded-xl border border-base-200 bg-base-100">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={markOne}
                    isMarking={
                      markRead.isPending &&
                      markRead.variables === notification.id
                    }
                  />
                ))}
              </ul>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={page === 1 || notificationsQuery.isFetching}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </button>
                <span className="text-sm text-base-content/60">
                  Page {page}
                </span>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={
                    notifications.length < limit ||
                    notificationsQuery.isFetching
                  }
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </PageLoader>
      </section>
    </div>
  );
}
