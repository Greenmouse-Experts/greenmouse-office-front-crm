import { useState, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import { PlusCircleIcon, User } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import UserSummary from "./-components/UsersSummary";
import DropDownBtn from "@/components/buttons/DropdownBtn";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import {
  useStaffs,
  useRoles,
  useCreateStaff,
  useDeleteStaff,
  type StaffMember,
} from "@/api/tenantApi";
import { toast } from "sonner";

export const Route = createFileRoute("/tenant/users/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useStaffs();
  const rolesQuery = useRoles();
  const createStaff = useCreateStaff();
  const deleteStaff = useDeleteStaff();

  const props = useSearch();
  const addModalRef = useRef<ModalHandle>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    roleId: "",
  });

  const handleOpenAdd = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      roleId: "",
    });
    addModalRef.current?.open();
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error("Please fill in first name, last name, and email.");
      return;
    }

    try {
      await createStaff.mutateAsync({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber || undefined,
        roleId: form.roleId || undefined,
      });
      toast.success(`Staff member "${form.firstName} ${form.lastName}" added.`);
      addModalRef.current?.close();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add staff member.");
    }
  };

  const handleDeleteStaff = async (staff: StaffMember) => {
    if (
      !window.confirm(
        `Are you sure you want to remove staff member "${staff.firstName} ${staff.lastName}"?`,
      )
    ) {
      return;
    }

    try {
      await deleteStaff.mutateAsync(staff.id);
      toast.success("Staff member removed.");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to delete staff member.",
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
        <span className="badge badge-sm badge-ghost">
          {item.role?.name || "Staff"}
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
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={`badge badge-sm ${
            value === "active"
              ? "badge-success text-success-content"
              : "badge-ghost"
          }`}
        >
          {value || "active"}
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
          to: "/tenant/users/details/" + (item.id || "details"),
        });
      },
    },
    {
      key: "delete",
      label: "Remove Staff",
      render: () => (
        <span className="text-error font-medium">Remove Staff</span>
      ),
      action: (item: StaffMember) => {
        handleDeleteStaff(item);
      },
    },
  ];

  return (
    <div className="space-y-4 pb-12">
      <PageHeader
        title="Staff Members"
        description="Manage your team, invite employees, and control roles & access"
      >
        <div className="flex items-center gap-2">
          <Link to="/tenant/users/roles" className="btn btn-outline btn-sm">
            Roles & Permissions
          </Link>
          <Link to="/tenant/users/add" className="btn btn-outline btn-sm">
            <PlusCircleIcon className="size-4" /> Add via Form
          </Link>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <PlusCircleIcon className="size-4" /> Quick Invite
          </button>
        </div>
      </PageHeader>

      <UserSummary />

      <SimpleContainer
        title={
          <>
            Staff Directory{" "}
            {query.data && (
              <span className="opacity-80 text-sm">({query.data.length})</span>
            )}
          </>
        }
      >
        <ContainerRow showSearch searchProps={props}>
          <DropDownBtn
            title="Export"
            items={[
              {
                name: "CSV",
                action: () => {},
              },
            ]}
          />
        </ContainerRow>

        <PageLoader
          query={query}
          emptyState={{
            title: "No Staff Members",
            description: "Build your team by inviting your first team member.",
            actionText: "Invite Staff",
            onAction: handleOpenAdd,
          }}
        >
          {(staffs) => {
            const filtered = staffs.filter((s) => {
              if (!props.search) return true;
              const term = props.search.toLowerCase();
              return (
                s.firstName?.toLowerCase().includes(term) ||
                s.lastName?.toLowerCase().includes(term) ||
                s.email?.toLowerCase().includes(term)
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

      {/* Add Staff Quick Modal */}
      <Modal ref={addModalRef} title="Invite Staff Member">
        <form onSubmit={handleCreateStaff} className="space-y-4 p-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-sm font-semibold">
                First Name *
              </label>
              <input
                type="text"
                required
                className="input input-bordered w-full"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="label text-sm font-semibold">Last Name *</label>
              <input
                type="text"
                required
                className="input input-bordered w-full"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="label text-sm font-semibold">Email *</label>
            <input
              type="email"
              required
              className="input input-bordered w-full"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jane@company.com"
            />
          </div>

          <div>
            <label className="label text-sm font-semibold">Phone Number</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={form.phoneNumber}
              onChange={(e) =>
                setForm({ ...form, phoneNumber: e.target.value })
              }
              placeholder="+234..."
            />
          </div>

          <div>
            <label className="label text-sm font-semibold">Assign Role</label>
            <select
              className="select select-bordered w-full"
              value={form.roleId}
              onChange={(e) => setForm({ ...form, roleId: e.target.value })}
            >
              <option value="">No Role / Default Staff</option>
              {rolesQuery.data?.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => addModalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createStaff.isPending}
              className="btn btn-primary"
            >
              {createStaff.isPending ? "Inviting..." : "Send Invite"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
