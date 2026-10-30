import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import SimpleContainer from "@/components/SimpleContainer";
import { PlusCircleIcon, User } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import UserSummary from "./-components/UsersSummary";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import ConfirmModal, {
  type ConfirmModalHandle,
} from "@/components/ConfirmModal";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import {
  useStaffs,
  useRoles,
  useCreateStaff,
  useDeleteStaff,
  type StaffMember,
} from "@/api/adminApi";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useStaffs();
  const rolesQuery = useRoles();
  const createStaff = useCreateStaff();
  const deleteStaff = useDeleteStaff();
  const addModalRef = useRef<ModalHandle>(null);
  const confirmRef = useRef<ConfirmModalHandle>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    roleId: "",
  });

  const handleOpenAdd = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phoneNumber: "",
      roleId: "",
    });
    addModalRef.current?.open();
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.password ||
      !form.roleId
    ) {
      toast.error(
        "First name, last name, email, password, and role are required.",
      );
      return;
    }

    try {
      await createStaff.mutateAsync({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber || undefined,
        roleId: form.roleId,
      });
      toast.success(
        `Administrator "${form.firstName} ${form.lastName}" added.`,
      );
      addModalRef.current?.close();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to add administrator.",
      );
    }
  };

  const handleDeleteStaff = async (staff: StaffMember) => {
    const confirmed = await confirmRef.current?.confirm({
      title: "Delete administrator",
      message: `Delete administrator "${staff.firstName} ${staff.lastName}"? This cannot be undone.`,
      confirmLabel: "Delete",
    });
    if (!confirmed) return;

    try {
      await deleteStaff.mutateAsync(staff.id);
      toast.success("Administrator deleted.");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to delete administrator.",
      );
    }
  };

  const columns = [
    {
      key: "profilePic",
      label: "Avatar",
      render: (value: string, item: StaffMember) => (
        <div className="avatar">
          <div className="mask mask-squircle w-10 h-10 bg-primary/10 text-primary flex items-center justify-center font-semibold">
            {value ? (
              <img src={value} alt={`${item.firstName} ${item.lastName}`} />
            ) : (
              <User className="size-5" />
            )}
          </div>
        </div>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (_value: any, item: StaffMember) => (
        <span className="font-semibold text-base-content">
          {item.firstName} {item.lastName}
        </span>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (_value: any, item: StaffMember) => (
        <span className="badge badge-md badge-ghost">
          {item.role?.name ||
            rolesQuery.data?.find((role) => role.id === item.roleId)?.name ||
            "—"}
        </span>
      ),
    },
    { key: "email", label: "Email" },
    {
      key: "phoneNumber",
      label: "Phone",
      render: (value: string) => value || "—",
    },
    {
      key: "isActive",
      label: "Status",
      render: (value: boolean | undefined) => (
        <span
          className={`badge badge-md ${
            value === true
              ? "badge-success text-success-content"
              : "badge-ghost"
          }`}
        >
          {value === undefined ? "—" : value ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const actions: Actions<StaffMember>[] = [
    {
      key: "view",
      label: "View Details",
      action: (item: StaffMember, nav) => {
        nav({
          to: "/admin/users/details/" + (item.id || "details"),
        });
      },
    },
    {
      key: "delete",
      label: "Delete administrator",
      render: () => (
        <span className="text-error font-medium">Delete administrator</span>
      ),
      action: (item: StaffMember) => {
        handleDeleteStaff(item);
      },
    },
  ];

  return (
    <div className="space-y-4 pb-12">
      <PageHeader title="Administrators">
        <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
          <PlusCircleIcon className="size-4" /> Add administrator
        </button>
      </PageHeader>

      <UserSummary />

      <SimpleContainer
        title={
          <>
            Administrator accounts{" "}
            {query.data && (
              <span className="opacity-80 text-sm">({query.data.length})</span>
            )}
          </>
        }
      >
        <PageLoader query={query}>
          {(staffs) => {
            return (
              <CustomTable
                ring={false}
                data={staffs}
                columns={columns}
                actions={actions}
              />
            );
          }}
        </PageLoader>
      </SimpleContainer>

      <Modal ref={addModalRef} title="Add administrator">
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">
                <span className="label-text font-semibold">First Name *</span>
              </label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                placeholder="Jane"
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Last Name *</span>
              </label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Doe"
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">
                  Email Address *
                </span>
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@greenmouse.com"
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">
                  Temporary password *
                </span>
              </label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">Phone Number</span>
              </label>
              <input
                type="text"
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm({ ...form, phoneNumber: e.target.value })
                }
                placeholder="+2348012345678"
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">
                  Assigned Role *
                </span>
              </label>
              <select
                value={form.roleId}
                required
                onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                className="select select-sm select-bordered w-full"
              >
                <option value="">Select a role</option>
                {rolesQuery.data?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-base-200">
            <button
              type="button"
              onClick={() => addModalRef.current?.close()}
              className="btn btn-sm btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createStaff.isPending}
              className="btn btn-sm btn-primary"
            >
              {createStaff.isPending ? "Adding..." : "Add administrator"}
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmModal ref={confirmRef} />
    </div>
  );
}
