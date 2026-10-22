import { useState, useRef } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import { CalendarCheck2, Pencil, PlusCircleIcon, User } from "lucide-react";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import PhoneNumberInput, {
  validatePhoneNumber,
} from "@/components/inputs/PhoneNumberInput";
import SelectImage from "@/components/images/SelectImage";
import { useSelectImage } from "@/helpers/images";
import { useUploadImage } from "@/api/imageApi";
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
  useUpdateStaff,
  type Role,
  type StaffMember,
} from "@/api/tenantApi";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/users/")({
  component: RouteComponent,
});

interface EditStaffFields {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roleId: string;
  status: string;
}

function EditStaffForm({
  staff,
  roles,
  onClose,
}: {
  staff: StaffMember;
  roles: Role[];
  onClose: () => void;
}) {
  const updateStaff = useUpdateStaff();
  const uploadImage = useUploadImage();
  const { image, setImage, image_link } = useSelectImage();
  const methods = useForm<EditStaffFields>({
    defaultValues: {
      firstName: staff.firstName || "",
      lastName: staff.lastName || "",
      email: staff.email || "",
      phoneNumber: staff.phoneNumber || "",
      roleId: staff.roleId || staff.role?.id || "",
      status: staff.status || "active",
    },
  });

  const handleSave = async (values: EditStaffFields) => {
    try {
      const uploaded = image ? await uploadImage.mutateAsync(image) : null;
      if (image && !uploaded?.url) {
        throw new Error("The profile photo upload did not return a URL.");
      }
      await updateStaff.mutateAsync({
        id: staff.id,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phoneNumber: values.phoneNumber,
        ...(values.roleId ? { roleId: values.roleId } : {}),
        status: values.status,
        ...(uploaded?.url ? { profilePic: uploaded.url } : {}),
      });
      toast.success("Staff member updated.");
      onClose();
    } catch (error) {
      const response = error as { response?: { data?: { message?: string | string[] } }; message?: string };
      const message = response.response?.data?.message;
      toast.error(
        (Array.isArray(message) ? message.join(". ") : message) ||
          response.message ||
          "Failed to update staff member.",
      );
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSave)} className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          {staff.profilePic && !image && (
            <img
              src={staff.profilePic}
              alt={`${staff.firstName} ${staff.lastName}`}
              className="size-16 rounded-full object-cover"
            />
          )}
          <SelectImage
            image={image}
            setImage={setImage}
            image_link={image_link}
            title={staff.profilePic ? "Replace profile photo" : "Profile photo"}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SimpleInput
            label="First name"
            autoComplete="given-name"
            {...methods.register("firstName", {
              validate: (value) => !!value.trim() || "First name is required",
            })}
          />
          <SimpleInput
            label="Last name"
            autoComplete="family-name"
            {...methods.register("lastName", {
              validate: (value) => !!value.trim() || "Last name is required",
            })}
          />
        </div>
        <SimpleInput
          label="Email address"
          type="email"
          autoComplete="email"
          {...methods.register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          })}
        />
        <Controller
          name="phoneNumber"
          control={methods.control}
          rules={{ validate: validatePhoneNumber }}
          render={({ field, fieldState }) => (
            <PhoneNumberInput
              label="Phone number"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <LocalSelect label="Assigned role" {...methods.register("roleId")}>
            <option value="" disabled={!!(staff.roleId || staff.role?.id)}>
              No role assigned
            </option>
            {(staff.roleId || staff.role?.id) &&
              !roles.some((role) => role.id === (staff.roleId || staff.role?.id)) && (
                <option value={staff.roleId || staff.role?.id}>
                  {staff.role?.name || "Current role"}
                </option>
              )}
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </LocalSelect>
          <LocalSelect label="Status" {...methods.register("status")}>
            {staff.status && !["active", "inactive"].includes(staff.status) && (
              <option value={staff.status}>{staff.status}</option>
            )}
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </LocalSelect>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={updateStaff.isPending || uploadImage.isPending}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={updateStaff.isPending || uploadImage.isPending}>
            {updateStaff.isPending || uploadImage.isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

function RouteComponent() {
  const query = useStaffs();
  const rolesQuery = useRoles();
  const createStaff = useCreateStaff();
  const deleteStaff = useDeleteStaff();

  const props = useSearch();
  const addModalRef = useRef<ModalHandle>(null);
  const editModalRef = useRef<ModalHandle>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

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
          to: "/staff/users/details/" + (item.id || "details"),
        });
      },
    },
    {
      key: "attendance",
      label: "View Attendance",
      render: () => (
        <span className="flex items-center gap-2">
          <CalendarCheck2 className="size-4" /> View Attendance
        </span>
      ),
      action: (item: StaffMember, nav) => {
        nav({ to: "/staff/attendance", search: { staffId: item.id } });
      },
    },
    {
      key: "edit",
      label: "Edit Staff",
      render: () => (
        <span className="flex items-center gap-2">
          <Pencil className="size-4" /> Edit Staff
        </span>
      ),
      action: (item: StaffMember) => {
        setEditingStaff(item);
        editModalRef.current?.open();
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
          <Link to="/staff/users/roles" className="btn btn-outline btn-sm">
            Roles & Permissions
          </Link>
          <Link to="/staff/users/add" className="btn btn-outline btn-sm">
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
      <Modal ref={editModalRef} title="Edit Staff Member">
        {editingStaff && (
          <EditStaffForm
            key={editingStaff.id}
            staff={editingStaff}
            roles={rolesQuery.data || []}
            onClose={() => editModalRef.current?.close()}
          />
        )}
      </Modal>
    </div>
  );
}
