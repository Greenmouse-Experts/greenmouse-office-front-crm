import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarDays, ClipboardList, Clock3, UserCheck } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import LocalSelect from "@/components/inputs/LocalSelect";
import { get_user_value } from "@/store/authStore";
import { useStaffs } from "@/api/tenantApi";
import {
  useAttendanceList, useCheckIn, useMyAttendance, useSaveAttendanceReport,
  useTodayAttendance, type AttendanceRecord, type DailyReport,
} from "@/api/attendanceApi";

export const Route = createFileRoute("/staff/attendance/")({
  validateSearch: (search: Record<string, unknown>) => ({
    staffId: typeof search.staffId === "string" ? search.staffId : undefined,
  }),
  component: AttendancePage,
});

const localDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const today = localDate(new Date());
const monthStart = `${today.slice(0, 7)}-01`;
const recordDate = (record: AttendanceRecord) =>
  (record.date || record.attendanceDate || record.checkedInAt || record.checkInAt || record.createdAt || "").slice(0, 10);
const formatDate = (value: string) => {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { dateStyle: "medium" });
};
const formatTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};
const reportFor = (record?: AttendanceRecord): DailyReport => ({
  summary: record?.report?.summary ?? record?.summary ?? "",
  completedTasks: record?.report?.completedTasks ?? record?.completedTasks ?? [],
  blockers: record?.report?.blockers ?? record?.blockers ?? "",
  nextSteps: record?.report?.nextSteps ?? record?.nextSteps ?? "",
});
const errorMessage = (error: unknown, fallback: string) => {
  const value = error as { response?: { data?: { message?: string | string[] } }; message?: string };
  const message = value.response?.data?.message;
  return (Array.isArray(message) ? message.join(". ") : message) || value.message || fallback;
};

function ReportEditor({ date, record }: { date: string; record?: AttendanceRecord }) {
  const saveReport = useSaveAttendanceReport();
  const [summary, setSummary] = useState("");
  const [completedTasks, setCompletedTasks] = useState("");
  const [blockers, setBlockers] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (dirty) return;
    const report = reportFor(record);
    setSummary(report.summary || "");
    setCompletedTasks((report.completedTasks || []).join("\n"));
    setBlockers(report.blockers || "");
    setNextSteps(report.nextSteps || "");
  }, [record, dirty]);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!summary.trim()) {
      toast.error("Add a summary before saving the report.");
      return;
    }
    try {
      await saveReport.mutateAsync({
        date,
        summary: summary.trim(),
        completedTasks: completedTasks.split("\n").map((task) => task.trim()).filter(Boolean),
        blockers: blockers.trim(),
        nextSteps: nextSteps.trim(),
      });
      toast.success(`Report saved for ${formatDate(date)}.`);
    } catch (error) {
      toast.error(errorMessage(error, "Could not save the daily report."));
    }
  };

  return (
    <form onSubmit={save} className="space-y-4">
      <SimpleTextArea label="Work summary" rows={3} required value={summary}
        onChange={(event) => { setSummary(event.target.value); setDirty(true); }}
        placeholder="What did you work on?" />
      <SimpleTextArea label="Completed tasks" rows={3} value={completedTasks}
        onChange={(event) => { setCompletedTasks(event.target.value); setDirty(true); }}
        placeholder="One task per line" />
      <div className="grid gap-4 sm:grid-cols-2">
        <SimpleTextArea label="Blockers" rows={3} value={blockers}
          onChange={(event) => { setBlockers(event.target.value); setDirty(true); }}
          placeholder="Anything slowing progress?" />
        <SimpleTextArea label="Next steps" rows={3} value={nextSteps}
          onChange={(event) => { setNextSteps(event.target.value); setDirty(true); }}
          placeholder="What comes next?" />
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={saveReport.isPending}>
          {saveReport.isPending ? "Saving..." : "Save report"}
        </button>
      </div>
    </form>
  );
}

function AttendanceTable({ records, showStaff, staffNames, onReport }: {
  records: AttendanceRecord[];
  showStaff: boolean;
  staffNames: Map<string, string>;
  onReport?: (record: AttendanceRecord) => void;
}) {
  if (records.length === 0) return (
    <div className="px-5 py-12 text-center">
      <p className="font-medium">No attendance records in this range</p>
      <p className="mt-1 text-sm text-base-content/60">Try another date range or staff member.</p>
    </div>
  );
  const sorted = [...records].sort((a, b) => recordDate(b).localeCompare(recordDate(a)));
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead><tr><th>Date</th>{showStaff && <th>Staff member</th>}<th>Check-in</th><th>Status</th><th>Daily report</th></tr></thead>
        <tbody>{sorted.map((record, index) => {
          const date = recordDate(record);
          const name = [record.staff?.firstName, record.staff?.lastName].filter(Boolean).join(" ") ||
            staffNames.get(record.staffId || record.staff?.id || "") || record.staff?.email || "—";
          const report = reportFor(record);
          return (
            <tr key={record.id || `${date}-${record.staffId || index}`}>
              <td className="font-medium whitespace-nowrap">{formatDate(date)}</td>
              {showStaff && <td>{name}</td>}
              <td className="tabular-nums">{formatTime(record.checkedInAt || record.checkInAt || record.checkInTime || record.createdAt)}</td>
              <td><span className="badge badge-ghost badge-sm capitalize">{record.status || "Present"}</span></td>
              <td>{onReport ? (
                <button type="button" className="btn btn-ghost btn-sm text-primary" onClick={() => onReport(record)}>
                  {report.summary ? "Edit report" : "Write report"}
                </button>
              ) : <span className="text-sm text-base-content/70">{report.summary || "—"}</span>}</td>
            </tr>
          );
        })}</tbody>
      </table>
    </div>
  );
}

function AttendancePage() {
  const { staffId } = Route.useSearch();
  const navigate = useNavigate();
  const currentUserId = get_user_value()?.user?.id;
  const [view, setView] = useState<"mine" | "team">(staffId ? "team" : "mine");
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [reportDate, setReportDate] = useState(today);
  const todayQuery = useTodayAttendance();
  const myQuery = useMyAttendance({ from, to });
  const reportQuery = useMyAttendance({ from: reportDate, to: reportDate });
  const teamQuery = useAttendanceList({ from, to, staffId }, view === "team");
  const staffQuery = useStaffs();
  const checkIn = useCheckIn();
  const staffNames = new Map((staffQuery.data || []).map((staff) => [staff.id, `${staff.firstName} ${staff.lastName}`.trim()]));
  const todayRecord = todayQuery.data?.records.find((record) =>
    recordDate(record) === today && (!record.staffId || record.staffId === currentUserId),
  ) || myQuery.data?.find((record) => recordDate(record) === today);
  const checkedIn = todayQuery.data?.checkedIn === true ||
    (!!todayRecord && !["absent", "not_checked_in"].includes(todayRecord.status?.toLowerCase() || ""));
  const reportRecord = reportQuery.data?.find((record) => recordDate(record) === reportDate);

  const handleCheckIn = async () => {
    try {
      await checkIn.mutateAsync();
      toast.success("Attendance marked for today.");
    } catch (error) {
      toast.error(errorMessage(error, "Could not check in. Please try again."));
    }
  };

  return (
    <div className="space-y-5 pb-10">
      <PageHeader title="Attendance" description="Check in, review attendance, and keep a daily work report." />

      <section className="rounded-xl border border-base-200 bg-base-100 p-5 sm:p-6" aria-labelledby="today-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="rounded-lg bg-primary/10 p-2.5 text-primary"><UserCheck className="size-5" aria-hidden="true" /></span>
            <div>
              <h2 id="today-heading" className="font-semibold">Today · {formatDate(today)}</h2>
              <p className="mt-1 text-sm text-base-content/70">
                {todayQuery.isLoading ? "Checking attendance..." : todayQuery.isError ? "Could not load today's attendance." :
                  checkedIn ? `Checked in${todayRecord?.checkedInAt || todayRecord?.checkInAt ? ` at ${formatTime(todayRecord.checkedInAt || todayRecord.checkInAt)}` : ""}.` : "You have not checked in today."}
              </p>
            </div>
          </div>
          <button type="button" className="btn btn-primary" onClick={handleCheckIn}
            disabled={checkedIn || todayQuery.isLoading || todayQuery.isError || checkIn.isPending}>
            <Clock3 className="size-4" aria-hidden="true" />
            {checkIn.isPending ? "Checking in..." : checkedIn ? "Checked in" : "Check in"}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-base-200 bg-base-100" aria-labelledby="history-heading">
        <div className="space-y-4 border-b border-base-200 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="history-heading" className="flex items-center gap-2 text-lg font-semibold"><CalendarDays className="size-5 text-primary" aria-hidden="true" /> Attendance history</h2>
              <p className="mt-1 text-sm text-base-content/60">Review check-ins for the selected dates.</p>
            </div>
            <div className="join" aria-label="Attendance view">
              <button type="button" className={`btn btn-sm join-item ${view === "mine" ? "btn-primary" : "btn-outline"}`} aria-pressed={view === "mine"} onClick={() => setView("mine")}>My records</button>
              <button type="button" className={`btn btn-sm join-item ${view === "team" ? "btn-primary" : "btn-outline"}`} aria-pressed={view === "team"} onClick={() => setView("team")}>Team records</button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <SimpleInput label="From" type="date" value={from} max={to} onChange={(event) => {
              if (event.target.value && event.target.value <= to) setFrom(event.target.value);
            }} />
            <SimpleInput label="To" type="date" value={to} min={from} max={today} onChange={(event) => {
              if (event.target.value && event.target.value >= from && event.target.value <= today) setTo(event.target.value);
            }} />
            {view === "team" && (
              <LocalSelect label="Staff member" value={staffId || ""} onChange={(event) =>
                navigate({ to: "/staff/attendance", search: { staffId: event.target.value || undefined } })}>
                <option value="">All staff</option>
                {staffQuery.data?.map((staff) => <option key={staff.id} value={staff.id}>{staff.firstName} {staff.lastName}</option>)}
              </LocalSelect>
            )}
          </div>
        </div>
        {view === "mine" ? (
          <PageLoader query={myQuery} loadingText="Loading your attendance...">
            {(records) => <AttendanceTable records={records} showStaff={false} staffNames={staffNames} onReport={(record) => {
              const date = recordDate(record);
              if (date) {
                setReportDate(date);
                document.getElementById("daily-report-heading")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }} />}
          </PageLoader>
        ) : (
          <PageLoader query={teamQuery} loadingText="Loading team attendance...">
            {(records) => <AttendanceTable records={records} showStaff staffNames={staffNames} />}
          </PageLoader>
        )}
      </section>

      <section className="rounded-xl border border-base-200 bg-base-100 p-5 sm:p-6" aria-labelledby="daily-report-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="daily-report-heading" className="flex items-center gap-2 text-lg font-semibold"><ClipboardList className="size-5 text-primary" aria-hidden="true" /> Daily work report</h2>
            <p className="mt-1 text-sm text-base-content/60">Write or update a report for today or a past date.</p>
          </div>
          <div className="w-full sm:w-44">
            <SimpleInput label="Report date" type="date" value={reportDate} max={today} onChange={(event) => {
              if (event.target.value && event.target.value <= today) setReportDate(event.target.value);
            }} />
          </div>
        </div>
        {reportQuery.isLoading ? <p className="text-sm text-base-content/60">Loading report...</p> :
          reportQuery.isError ? <p className="text-sm text-error">Could not load the report for this date. Try again.</p> :
            <ReportEditor key={reportDate} date={reportDate} record={reportRecord} />}
      </section>
    </div>
  );
}
