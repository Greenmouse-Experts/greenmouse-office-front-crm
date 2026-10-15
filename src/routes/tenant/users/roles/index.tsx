import { useState, useRef, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import { PlusCircleIcon, Shield, Search, X } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useRolePermissions,
  type Role,
  type RolePermission,
} from "@/api/tenantApi";
import { toast } from "sonner";

export const Route = createFileRoute("/tenant/users/roles/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useRoles();
  const permissionsQuery = useRolePermissions();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const searchProps = useSearch();
  const roleModalRef = useRef<ModalHandle>(null);

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permissionFilter, setPermissionFilter] = useState("");

  const handleOpenCreate = () => {
    setEditingRole(null);
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions([]);
    setPermissionFilter("");
    roleModalRef.current?.open();
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || "");
    setSelectedPermissions(role.permissions || []);
    setPermissionFilter("");
    roleModalRef.current?.open();
  };

  const handleDelete = async (role: Role) => {
    if (
      !window.confirm(`Are you sure you want to delete role "${role.name}"?`)
    ) {
      return;
    }
    try {
      await deleteRole.mutateAsync(role.id);
      toast.success(`Role "${role.name}" deleted.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete role.");
    }
  };

  const handleTogglePermission = (key: string) => {
    setSelectedPermissions((current) =>
      current.includes(key)
        ? current.filter((permission) => permission !== key)
        : [...current, key],
    );
  };

  const filteredPermissions = useMemo(() => {
    const permissions = permissionsQuery.data || [];
    return permissions.filter((p) => {
      if (!permissionFilter) return true;
      const q = permissionFilter.trim().toLowerCase();
      return (
        p.key.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    });
  }, [permissionsQuery.data, permissionFilter]);

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, RolePermission[]> = {};
    for (const p of filteredPermissions) {
      const category =
        p.category || (p.key.includes(":") ? p.key.split(":")[0] : "general");
      const normalizedCat =
        category.charAt(0).toUpperCase() + category.slice(1);
      if (!groups[normalizedCat]) groups[normalizedCat] = [];
      groups[normalizedCat].push(p);
    }
    return groups;
  }, [filteredPermissions]);

  const visibleKeys = filteredPermissions.map((permission) => permission.key);
  const selectedVisibleCount = visibleKeys.filter((key) =>
    selectedPermissions.includes(key),
  ).length;
  const allVisibleSelected =
    visibleKeys.length > 0 && selectedVisibleCount === visibleKeys.length;

  const handleSelectAllPermissions = () => {
    if (visibleKeys.length === 0) return;
    setSelectedPermissions((current) =>
      allVisibleSelected
        ? permissionFilter
          ? current.filter((key) => !visibleKeys.includes(key))
          : []
        : Array.from(new Set([...current, ...visibleKeys])),
    );
  };

  const handleToggleCategory = (categoryKeys: string[]) => {
    const allSelected = categoryKeys.every((k) =>
      selectedPermissions.includes(k),
    );
    setSelectedPermissions((current) =>
      allSelected
        ? current.filter((key) => !categoryKeys.includes(key))
        : Array.from(new Set([...current, ...categoryKeys])),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    try {
      if (editingRole) {
        await updateRole.mutateAsync({
          id: editingRole.id,
          name: roleName,
          description: roleDescription,
          permissions: selectedPermissions,
        });
        toast.success(`Role "${roleName}" updated successfully.`);
      } else {
        await createRole.mutateAsync({
          name: roleName,
          description: roleDescription,
          permissions: selectedPermissions,
        });
        toast.success(`Role "${roleName}" created successfully.`);
      }
      roleModalRef.current?.close();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed.");
    }
  };

  const columns = [
    {
      key: "name",
      label: "Role Name",
      render: (_value: any, item: Role) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold">
            <Shield className="size-4" />
          </div>
          <div>
            <div className="font-semibold text-base-content leading-tight">
              {item.name}
            </div>
            <div className="text-xs text-base-content/60 max-w-sm truncate">
              {item.description || "No description provided"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "permissions",
      label: "Permissions",
      render: (permissions: string[]) => (
        <div className="flex flex-wrap gap-1 max-w-md">
          {permissions && permissions.length > 0 ? (
            permissions.slice(0, 4).map((perm, i) => (
              <span key={i} className="badge badge-xs badge-ghost font-mono">
                {perm}
              </span>
            ))
          ) : (
            <span className="text-xs text-base-content/40">No permissions</span>
          )}
          {permissions && permissions.length > 4 && (
            <span className="badge badge-xs badge-primary badge-soft">
              +{permissions.length - 4} more
            </span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value: string) => (
        <span className="text-xs text-base-content/60">
          {value ? new Date(value).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  const actions: Actions<Role>[] = [
    {
      key: "edit",
      label: "Edit Role",
      action: (item: Role) => {
        handleOpenEdit(item);
      },
    },
    {
      key: "delete",
      label: "Delete Role",
      render: () => <span className="text-error font-medium">Delete Role</span>,
      action: (item: Role) => {
        handleDelete(item);
      },
    },
  ];

  return (
    <div className="space-y-4 pb-12">
      <PageHeader
        title="Roles & Permissions"
        description="Configure workspace roles, privileges, and team access levels."
      >
        <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
          <PlusCircleIcon className="size-4" /> Add Role
        </button>
      </PageHeader>

      <SimpleContainer
        title={
          <>
            Workspace Roles{" "}
            {query.data && (
              <span className="opacity-80 text-sm">({query.data.length})</span>
            )}
          </>
        }
      >
        <ContainerRow showSearch searchProps={searchProps} />

        <PageLoader
          query={query}
          emptyState={{
            title: "No Roles Configured",
            description:
              "Create custom roles with fine-grained access control permissions.",
            actionText: "Add Role",
            onAction: handleOpenCreate,
          }}
        >
          {(rolesList) => {
            const list = Array.isArray(rolesList) ? rolesList : [];
            const filtered = list.filter((r) => {
              if (!searchProps.search) return true;
              return (
                r.name
                  .toLowerCase()
                  .includes(searchProps.search.toLowerCase()) ||
                (r.description &&
                  r.description
                    .toLowerCase()
                    .includes(searchProps.search.toLowerCase()))
              );
            });
            return (
              <CustomTable
                ring={false}
                data={filtered}
                columns={columns}
                actions={actions}
              />
            );
          }}
        </PageLoader>
      </SimpleContainer>

      {/* Create / Edit Role Modal */}
      <Modal
        ref={roleModalRef}
        title={
          editingRole
            ? `Edit Role: ${editingRole.name}`
            : "Create Workspace Role"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="role-name"
              className="mb-2 block text-sm font-semibold"
            >
              Role name <span className="text-error">*</span>
            </label>
            <input
              id="role-name"
              type="text"
              required
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Sales Representative, Store Manager"
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label
              htmlFor="role-description"
              className="mb-2 block text-sm font-semibold"
            >
              Description
            </label>
            <textarea
              id="role-description"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              placeholder="Brief description of the role responsibilities"
              className="textarea textarea-bordered w-full"
              rows={2}
            />
          </div>

          <section
            aria-labelledby="role-permissions-heading"
            className="space-y-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h4
                  id="role-permissions-heading"
                  className="text-sm font-semibold"
                >
                  Assigned permissions
                </h4>
                <p className="mt-0.5 text-xs text-base-content/70">
                  Choose what people with this role can access.
                </p>
              </div>
              <span className="badge badge-primary badge-soft badge-sm font-medium">
                {selectedPermissions.length} selected
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-base-300">
              <div className="flex flex-col gap-2 border-b border-base-300 bg-base-200/50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative min-w-0 flex-1">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-base-content/60"
                  />
                  <input
                    type="text"
                    aria-label="Search permissions"
                    value={permissionFilter}
                    onChange={(e) => setPermissionFilter(e.target.value)}
                    placeholder="Search permissions"
                    className="input input-sm input-bordered w-full pl-9 pr-9 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  />
                  {permissionFilter && (
                    <button
                      type="button"
                      aria-label="Clear permission search"
                      onClick={() => setPermissionFilter("")}
                      className="btn btn-ghost btn-xs btn-square absolute right-1 top-1/2 -translate-y-1/2"
                    >
                      <X aria-hidden="true" className="size-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSelectAllPermissions}
                  disabled={visibleKeys.length === 0}
                  className="btn btn-sm btn-ghost text-primary sm:shrink-0"
                >
                  {allVisibleSelected
                    ? permissionFilter
                      ? "Clear matches"
                      : "Clear all"
                    : permissionFilter
                      ? "Select matches"
                      : "Select all"}
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto overscroll-contain">
                {permissionsQuery.isLoading ? (
                  <div
                    className="px-4 py-10 text-center text-sm text-base-content/70"
                    role="status"
                  >
                    Loading permissions…
                  </div>
                ) : permissionsQuery.isError ? (
                  <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
                    <p className="text-sm text-base-content/70">
                      Permissions could not be loaded.
                    </p>
                    <button
                      type="button"
                      onClick={() => permissionsQuery.refetch()}
                      className="btn btn-sm btn-outline"
                    >
                      Try again
                    </button>
                  </div>
                ) : Object.keys(groupedPermissions).length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-base-content/70">
                    {permissionFilter
                      ? "No permissions match your search."
                      : "No permissions available."}
                  </div>
                ) : (
                  Object.entries(groupedPermissions).map(
                    ([category, items]) => {
                      const categoryKeys = items.map((item) => item.key);
                      const selectedInCategory = categoryKeys.filter((key) =>
                        selectedPermissions.includes(key),
                      ).length;
                      const allCatSelected =
                        selectedInCategory === categoryKeys.length;

                      return (
                        <div
                          key={category}
                          className="border-b border-base-200 last:border-b-0"
                        >
                          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-base-200 px-4 py-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <h5 className="truncate text-xs font-semibold text-base-content">
                                {category}
                              </h5>
                              <span className="text-xs tabular-nums text-base-content/70">
                                {selectedInCategory}/{items.length}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleCategory(categoryKeys)}
                              className="rounded px-1 py-0.5 text-xs font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            >
                              {allCatSelected ? "Clear group" : "Select group"}
                            </button>
                          </div>

                          <div className="divide-y divide-base-200">
                            {items.map((perm) => {
                              const isChecked = selectedPermissions.includes(
                                perm.key,
                              );
                              return (
                                <label
                                  key={perm.key}
                                  className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-base-200/60 focus-within:bg-base-200/60 ${
                                    isChecked ? "bg-primary/5" : "bg-base-100"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() =>
                                      handleTogglePermission(perm.key)
                                    }
                                    className="checkbox checkbox-primary checkbox-sm mt-0.5 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                  />
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium leading-5 text-base-content">
                                      {perm.name || perm.key}
                                    </span>
                                    {perm.name && perm.name !== perm.key && (
                                      <span className="block break-all font-mono text-[11px] leading-4 text-base-content/70">
                                        {perm.key}
                                      </span>
                                    )}
                                    {perm.description && (
                                      <span className="mt-0.5 block text-xs leading-5 text-base-content/70">
                                        {perm.description}
                                      </span>
                                    )}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    },
                  )
                )}
              </div>
              {permissionsQuery.data && filteredPermissions.length > 0 && (
                <div className="border-t border-base-300 bg-base-200/50 px-4 py-2 text-xs tabular-nums text-base-content/70">
                  {permissionFilter
                    ? `${selectedVisibleCount} of ${filteredPermissions.length} matches selected`
                    : `${selectedPermissions.length} of ${permissionsQuery.data.length} permissions selected`}
                </div>
              )}
            </div>
          </section>

          <div className="flex justify-end gap-2 pt-4 border-t border-base-200">
            <button
              type="button"
              onClick={() => roleModalRef.current?.close()}
              className="btn btn-sm btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createRole.isPending || updateRole.isPending}
              className="btn btn-sm btn-primary"
            >
              {createRole.isPending || updateRole.isPending
                ? "Saving..."
                : editingRole
                  ? "Update Role"
                  : "Create Role"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
