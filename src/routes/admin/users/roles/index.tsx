import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import { PlusCircleIcon, Shield } from "lucide-react";
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
  useAdminPermissions,
  type Role,
} from "@/api/adminApi";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/roles/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useRoles();
  const permissionsQuery = useAdminPermissions();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const searchProps = useSearch();
  const roleModalRef = useRef<ModalHandle>(null);

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handleOpenCreate = () => {
    setEditingRole(null);
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions([]);
    roleModalRef.current?.open();
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || "");
    setSelectedPermissions(role.permissions || []);
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
    if (selectedPermissions.includes(key)) {
      setSelectedPermissions(selectedPermissions.filter((k) => k !== key));
    } else {
      setSelectedPermissions([...selectedPermissions, key]);
    }
  };

  const handleSelectAllPermissions = () => {
    if (!permissionsQuery.data) return;
    if (selectedPermissions.length === permissionsQuery.data.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(permissionsQuery.data.map((p) => p.key));
    }
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
            <div className="text-sm text-base-content/60 max-w-sm truncate">
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
            <span className="text-sm text-base-content/40">No permissions</span>
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
        <span className="text-sm text-base-content/60">
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
        description="Define platform and operational roles and configure access privileges."
      >
        <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
          <PlusCircleIcon className="size-4" /> Add Role
        </button>
      </PageHeader>

      <SimpleContainer
        title={
          <>
            System Roles{" "}
            {query.data && (
              <span className="opacity-80 text-sm">({query.data.length})</span>
            )}
          </>
        }
      >
        <ContainerRow showSearch searchProps={searchProps} />

        <PageLoader query={query}>
          {(rolesList) => {
            const filtered = rolesList.filter((r) => {
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
          editingRole ? `Edit Role: ${editingRole.name}` : "Create System Role"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold">Role Name *</span>
            </label>
            <input
              type="text"
              required
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Operations Manager, Support Lead"
              className="input input-sm input-bordered w-full"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold">Description</span>
            </label>
            <textarea
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              placeholder="Brief description of the role responsibilities"
              className="textarea textarea-bordered textarea-sm w-full"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="label-text font-semibold">
                Assigned Permissions ({selectedPermissions.length})
              </label>
              <button
                type="button"
                onClick={handleSelectAllPermissions}
                className="btn btn-xs btn-ghost text-primary"
              >
                {permissionsQuery.data &&
                selectedPermissions.length === permissionsQuery.data.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="border border-base-200 rounded-xl p-3 max-h-64 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 bg-base-200/30">
              {permissionsQuery.data ? (
                permissionsQuery.data.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm.key);
                  return (
                    <label
                      key={perm.key}
                      className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer border transition-colors ${
                        isChecked
                          ? "bg-primary/5 border-primary/30"
                          : "bg-base-100 border-base-200 hover:border-base-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePermission(perm.key)}
                        className="checkbox checkbox-primary checkbox-xs mt-0.5"
                      />
                      <div className="space-y-0.5">
                        <span className="font-mono text-sm font-semibold block leading-tight">
                          {perm.key}
                        </span>
                        <span className="text-[11px] text-base-content/60 block leading-tight">
                          {perm.description}
                        </span>
                      </div>
                    </label>
                  );
                })
              ) : (
                <div className="col-span-2 text-center py-4 text-sm text-base-content/50">
                  Loading permissions...
                </div>
              )}
            </div>
          </div>

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
