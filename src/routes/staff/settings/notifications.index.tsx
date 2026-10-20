import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { Clock3 } from "lucide-react";
import { toast } from "sonner";
import PageLoader from "@/components/layout/PageLoader";
import SimpleInput from "@/components/inputs/SimpleInput";
import {
  useReminderPreferences,
  useUpdateReminderPreferences,
  type ReminderPreferences,
} from "@/api/remindersApi";

export const Route = createFileRoute("/staff/settings/notifications/")({
  component: ReminderPreferencesPage,
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

function ReminderPreferencesPage() {
  const preferencesQuery = useReminderPreferences();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Notification preferences</h1>
        <p className="mt-1 text-sm text-base-content/60">
          Choose which reminders you receive and when they are sent.
        </p>
      </div>
      <section className="space-y-4" aria-labelledby="reminder-heading">
        <div className="flex items-center gap-2">
          <Clock3 className="size-5 text-primary" aria-hidden="true" />
          <h2 id="reminder-heading" className="text-lg font-semibold">
            Reminder schedule
          </h2>
        </div>
        <PageLoader query={preferencesQuery} loadingText="Loading reminder preferences...">
          {(preferences) => <ReminderPreferencesForm preferences={preferences} />}
        </PageLoader>
      </section>
      <Link to="/staff/notifications" className="link link-primary text-sm">
        View notification inbox
      </Link>
    </div>
  );
}
