import { createFileRoute, Link } from "@tanstack/react-router";
import { useStaffs, useRoles } from "@/api/adminApi";

export const Route = createFileRoute("/admin/")({ component: RouteComponent });

function RouteComponent() {
  const accounts = useStaffs();
  const roles = useRoles();
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-semibold">Platform administration</h1>
        <p className="text-base-content/70 mt-1">Manage administrator access and the knowledge base.</p>
      </div>
      <div className="bg-base-100 rounded-box p-6 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-lg font-semibold">Administrators</h2><Link to="/admin/users" className="link link-primary">Manage accounts</Link></div>
        {accounts.isLoading ? <p>Loading accounts...</p> : accounts.isError ? <p role="alert" className="text-error">Could not load accounts. <button className="link" onClick={() => accounts.refetch()}>Retry</button></p> : <p>{accounts.data?.length ?? 0} accounts</p>}
      </div>
      <div className="bg-base-100 rounded-box p-6 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-lg font-semibold">Roles</h2><Link to="/admin/users/roles" className="link link-primary">Manage roles</Link></div>
        {roles.isLoading ? <p>Loading roles...</p> : roles.isError ? <p role="alert" className="text-error">Could not load roles. <button className="link" onClick={() => roles.refetch()}>Retry</button></p> : <p>{roles.data?.length ?? 0} roles</p>}
      </div>
      <div className="bg-base-100 rounded-box p-6 flex flex-wrap items-baseline justify-between gap-3"><div><h2 className="text-lg font-semibold">Knowledge base</h2><p className="text-base-content/70">Edit help categories and articles.</p></div><Link to="/admin/knowledge-base" className="link link-primary">Manage content</Link></div>
    </div>
  );
}
