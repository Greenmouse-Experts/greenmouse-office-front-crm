import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { Bell, CheckCheck, Clock3 } from "lucide-react";
import { toast } from "sonner";
import PageLoader from "@/components/layout/PageLoader";
import SimpleInput from "@/components/inputs/SimpleInput";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  type Notification,
} from "@/api/notifications-api";
import {
  useReminderPreferences,
  useUpdateReminderPreferences,
  type ReminderPreferences,
} from "@/api/remindersApi";

export const Route = createFileRoute("/staff/settings/notifications/")({
  component: NotificationsPage,
});

type PreferenceFields = Pick<
  ReminderPreferences,
  | "invoiceDueEnabled"
  | "invoiceOverdueEnabled"
  | "dealCloseEnabled"
  | "quoteExpiryEnabled"
  | "leadDaysBefore"
  | "sendHour"
  | "timezone"
>;

const preferenceDefaults: PreferenceFields = {
  invoiceDueEnabled: true,
  invoiceOverdueEnabled: true,
  dealCloseEnabled: true,
  quoteExpiryEnabled: true,
  leadDaysBefore: 3,
  sendHour: 8,
  timezone: "Africa/Lagos",
};

const getPreferenceFields = (data: ReminderPreferences): PreferenceFields => ({
  invoiceDueEnabled:
    data.invoiceDueEnabled ?? preferenceDefaults.invoiceDueEnabled,
  invoiceOverdueEnabled:
    data.invoiceOverdueEnabled ?? preferenceDefaults.invoiceOverdueEnabled,
  dealCloseEnabled:
    data.dealCloseEnabled ?? preferenceDefaults.dealCloseEnabled,
  quoteExpiryEnabled:
    data.quoteExpiryEnabled ?? preferenceDefaults.quoteExpiryEnabled,
  leadDaysBefore: data.leadDaysBefore ?? preferenceDefaults.leadDaysBefore,
  sendHour: data.sendHour ?? preferenceDefaults.sendHour,
  timezone: data.timezone || preferenceDefaults.timezone,
});

const errorMessage = (error: unknown, fallback: string) => {
  const response = error as {
    response?: { data?: { message?: string | string[] } };
  };
  const message = response.response?.data?.message;
  return (Array.isArray(message) ? message.join(". ") : message) || fallback;
};

function ReminderPreferencesForm({
  preferences,
}: {
  preferences: ReminderPreferences;
}) {
  const updatePreferences = useUpdateReminderPreferences();
  const form = useForm<PreferenceFields>({
    defaultValues: getPreferenceFields(preferences),
  });

  useEffect(() => {
    form.reset(getPreferenceFields(preferences));
  }, [preferences, form.reset]);

  const save = async (values: PreferenceFields) => {
    try {
      await updatePreferences.mutateAsync(values);
      form.reset(values);
      toast.success("Notification preferences saved.");
    } catch (error) {
      toast.error(
        errorMessage(error, "Could not save notification preferences."),
      );
    }
  };

  const options: {
    name: keyof Pick<
      PreferenceFields,
      | "invoiceDueEnabled"
      | "invoiceOverdueEnabled"
      | "dealCloseEnabled"
      | "quoteExpiryEnabled"
    >;
    label: string;
    description: string;
  }[] = [
    {
      name: "invoiceDueEnabled",
      label: "Invoices due soon",
      description: "Remind me before an invoice is due.",
    },
    {
      name: "invoiceOverdueEnabled",
      label: "Overdue invoices",
      description: "Notify me when an invoice passes its due date.",
    },
    {
      name: "dealCloseEnabled",
      label: "Deals closing soon",
      description: "Remind me about upcoming deal close dates.",
    },
    {
      name: "quoteExpiryEnabled",
      label: "Quotes expiring soon",
      description: "Notify me before a quote expires.",
    },
  ];

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(save)} className="space-y-5">
        <div className="divide-y divide-base-200 border-y border-base-200">
          {options.map((option) => (
            <label
              key={option.name}
              className="flex cursor-pointer items-center justify-between gap-4 py-4"
            >
              <span className="min-w-0">
                <span className="block font-medium">{option.label}</span>
                <span className="block text-sm text-base-content/60">
                  {option.description}
                </span>
              </span>
              <input
                type="checkbox"
                className="toggle toggle-primary shrink-0"
                {...form.register(option.name)}
              />
            </label>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <SimpleInput
            label="Lead reminder days before"
            type="number"
            required
            min={0}
            max={365}
            {...form.register("leadDaysBefore", {
              valueAsNumber: true,
              required: "Enter a lead reminder interval.",
              min: { value: 0, message: "Use 0 or more days." },
              max: { value: 365, message: "Use 365 days or fewer." },
            })}
          />
          <SimpleInput
            label="Send hour (0–23)"
            type="number"
            required
            min={0}
            max={23}
            {...form.register("sendHour", {
              valueAsNumber: true,
              required: "Enter a send hour.",
              min: { value: 0, message: "Use an hour from 0 to 23." },
              max: { value: 23, message: "Use an hour from 0 to 23." },
            })}
          />
          <SimpleInput
            label="Timezone"
            required
            placeholder="Africa/Lagos"
            {...form.register("timezone", {
              required: "Timezone is required.",
            })}
          />
        </div>
        <p className="text-xs text-base-content/60">
          The send hour uses the timezone above.
        </p>
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!form.formState.isDirty || updatePreferences.isPending}
          >
            {updatePreferences.isPending ? "Saving..." : "Save preferences"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

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
  const preferencesQuery = useReminderPreferences();
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
          Choose your reminders and review recent notifications.
        </p>
      </div>

      <section className="space-y-4" aria-labelledby="reminder-heading">
        <div className="flex items-center gap-2">
          <Clock3 className="size-5 text-primary" aria-hidden="true" />
          <h2 id="reminder-heading" className="text-lg font-semibold">
            Reminder preferences
          </h2>
        </div>
        <PageLoader
          query={preferencesQuery}
          loadingText="Loading reminder preferences..."
        >
          {(preferences) => (
            <ReminderPreferencesForm preferences={preferences} />
          )}
        </PageLoader>
      </section>

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
