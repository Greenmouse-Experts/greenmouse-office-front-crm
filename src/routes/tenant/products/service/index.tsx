import { useState, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import SimpleContainer from "@/components/SimpleContainer";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import {
  PlusCircleIcon,
  Wrench,
  CheckCircle,
  DollarSign,
  Layers,
} from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageLoader from "@/components/layout/PageLoader";
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useToggleServiceActive,
  type ServiceItem,
} from "@/api/catalogApi";
import { useCategories } from "@/api/crmApi";
import { toast } from "sonner";

export const Route = createFileRoute("/tenant/products/service/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useServices();
  const categoriesQuery = useCategories();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const toggleActive = useToggleServiceActive();
  const searchProps = useSearch();

  const addModalRef = useRef<ModalHandle>(null);
  const editModalRef = useRef<ModalHandle>(null);
  const detailsModalRef = useRef<ModalHandle>(null);

  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null,
  );
  const [form, setForm] = useState({
    name: "",
    price: 0,
    categoryId: "",
    description: "",
    isActive: true,
  });

  const handleOpenAdd = () => {
    setForm({
      name: "",
      price: 0,
      categoryId: "",
      description: "",
      isActive: true,
    });
    addModalRef.current?.open();
  };

  const handleOpenEdit = (service: ServiceItem) => {
    setSelectedService(service);
    setForm({
      name: service.name || "",
      price: Number(service.price) || 0,
      categoryId: service.categoryId || "",
      description: service.description || "",
      isActive: service.isActive ?? true,
    });
    editModalRef.current?.open();
  };

  const handleOpenDetails = (service: ServiceItem) => {
    setSelectedService(service);
    detailsModalRef.current?.open();
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Service name is required");
      return;
    }
    try {
      await createService.mutateAsync(form);
      toast.success("Service created successfully");
      addModalRef.current?.close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create service");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    try {
      await updateService.mutateAsync({
        id: selectedService.id,
        ...form,
      });
      toast.success("Service updated successfully");
      editModalRef.current?.close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update service");
    }
  };

  const handleToggleStatus = async (service: ServiceItem) => {
    try {
      await toggleActive.mutateAsync(service.id);
      toast.success("Status updated");
    } catch {
      // Fallback: update with inverted active status
      try {
        await updateService.mutateAsync({
          id: service.id,
          isActive: !service.isActive,
        });
        toast.success("Status updated");
      } catch {
        toast.error("Failed to update status");
      }
    }
  };

  const handleDelete = async (service: ServiceItem) => {
    if (!confirm(`Are you sure you want to delete "${service.name}"?`)) return;
    try {
      await deleteService.mutateAsync(service.id);
      toast.success("Service deleted successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete service");
    }
  };

  const servicesList = query.data || [];
  const searchTerm = searchProps.search?.toLowerCase() || "";
  const filteredServices = servicesList.filter((s) => {
    if (!searchTerm) return true;
    return (
      s.name?.toLowerCase().includes(searchTerm) ||
      s.description?.toLowerCase().includes(searchTerm) ||
      s.category?.name?.toLowerCase().includes(searchTerm)
    );
  });

  const totalServices = servicesList.length;
  const activeServices = servicesList.filter(
    (s) => s.isActive !== false,
  ).length;
  const avgRate =
    totalServices > 0
      ? servicesList.reduce((sum, s) => sum + (Number(s.price) || 0), 0) /
        totalServices
      : 0;

  const columns = [
    {
      key: "name",
      label: "Service",
      render: (_: any, item: ServiceItem) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary font-semibold">
            <Wrench className="size-4" />
          </div>
          <div>
            <div className="font-semibold text-base-content">{item.name}</div>
            <div className="text-xs text-base-content/60 line-clamp-1 max-w-[200px]">
              {item.description || "No description"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price Rate",
      render: (val: any) => (
        <span className="font-medium text-base-content">
          ₦{Number(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (_: any, item: ServiceItem) => (
        <span className="badge badge-sm badge-ghost">
          {item.category?.name || "General Service"}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (val: any) => (
        <span
          className={`badge badge-sm ${
            val !== false ? "badge-success text-white" : "badge-ghost"
          }`}
        >
          {val !== false ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const actions: Actions<ServiceItem>[] = [
    {
      key: "view",
      label: "View Details",
      action: (item) => handleOpenDetails(item),
    },
    {
      key: "toggle",
      label: "Toggle Status",
      action: (item) => handleToggleStatus(item),
    },
    {
      key: "edit",
      label: "Edit Service",
      action: (item) => handleOpenEdit(item),
    },
    {
      key: "delete",
      label: "Delete",
      action: (item) => handleDelete(item),
    },
  ];

  return (
    <>
      <PageHeader
        title="Services Catalog"
        description="Manage service offerings, consulting rates, and subscriptions"
      >
        <div className="flex items-center gap-2">
          <Link
            to="/tenant/products/categories"
            className="btn btn-outline btn-sm"
          >
            <Layers className="size-4" /> Categories
          </Link>
          <Link
            to="/tenant/products/service/add"
            className="btn btn-outline btn-sm"
          >
            <PlusCircleIcon className="size-4" /> Full Add Form
          </Link>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <PlusCircleIcon className="size-4" /> Quick Add
          </button>
        </div>
      </PageHeader>

      <PageLoader
        query={query}
        showSuccessState={true}
        emptyState={{
          title: "No Services Found",
          description: "Get started by adding your first service offering.",
          actionText: "Add Service",
          onAction: handleOpenAdd,
        }}
      >
        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card bg-base-100/70 backdrop-blur-md border border-base-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-base-content/60 uppercase">
                  Total Services
                </p>
                <h3 className="text-2xl font-semibold text-base-content mt-1">
                  {totalServices}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Wrench className="size-6" />
              </div>
            </div>
          </div>
          <div className="card bg-base-100/70 backdrop-blur-md border border-base-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-base-content/60 uppercase">
                  Active Services
                </p>
                <h3 className="text-2xl font-semibold text-base-content mt-1">
                  {activeServices}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle className="size-6" />
              </div>
            </div>
          </div>
          <div className="card bg-base-100/70 backdrop-blur-md border border-base-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-base-content/60 uppercase">
                  Average Service Rate
                </p>
                <h3 className="text-2xl font-semibold text-base-content mt-1">
                  ₦{Math.round(avgRate).toLocaleString()}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <DollarSign className="size-6" />
              </div>
            </div>
          </div>
        </div>

        <SimpleContainer title="Services List">
          <ContainerRow searchProps={searchProps} showSearch={true} />
          <CustomTable
            data={filteredServices}
            columns={columns}
            actions={actions}
          />
        </SimpleContainer>
      </PageLoader>

      {/* Add Service Modal */}
      <Modal ref={addModalRef} title="Create New Service">
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Service Name *
            </label>
            <input
              type="text"
              required
              className="input input-bordered w-full mt-1"
              placeholder="e.g. Website Maintenance & Support"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Rate / Price (₦) *
              </label>
              <input
                type="number"
                required
                min="0"
                className="input input-bordered w-full mt-1"
                placeholder="0.00"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Category
              </label>
              <select
                className="select select-bordered w-full mt-1"
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
              >
                <option value="">Select a category</option>
                {categoriesQuery.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Description
            </label>
            <textarea
              className="textarea textarea-bordered w-full mt-1"
              rows={3}
              placeholder="Detail what is included in this service..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => addModalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createService.isPending}
            >
              {createService.isPending ? "Creating..." : "Create Service"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Service Modal */}
      <Modal ref={editModalRef} title="Edit Service">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Service Name *
            </label>
            <input
              type="text"
              required
              className="input input-bordered w-full mt-1"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Rate / Price (₦) *
              </label>
              <input
                type="number"
                required
                min="0"
                className="input input-bordered w-full mt-1"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Category
              </label>
              <select
                className="select select-bordered w-full mt-1"
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
              >
                <option value="">Select a category</option>
                {categoriesQuery.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Description
            </label>
            <textarea
              className="textarea textarea-bordered w-full mt-1"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => editModalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateService.isPending}
            >
              {updateService.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal ref={detailsModalRef} title="Service Details">
        {selectedService && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-xl">
              <div className="size-14 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                <Wrench className="size-7" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-base-content">
                  {selectedService.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge badge-sm badge-ghost">
                    {selectedService.category?.name || "General Service"}
                  </span>
                  <span
                    className={`badge badge-sm ${
                      selectedService.isActive !== false
                        ? "badge-success text-white"
                        : "badge-ghost"
                    }`}
                  >
                    {selectedService.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">
                  Service Rate
                </span>
                <span className="font-semibold text-base-content text-base">
                  ₦{Number(selectedService.price || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">
                  Service ID
                </span>
                <span className="font-mono text-xs text-base-content/70">
                  {selectedService.id}
                </span>
              </div>
            </div>

            {selectedService.description && (
              <div>
                <span className="text-xs font-semibold text-base-content/70 block mb-1">
                  Description
                </span>
                <p className="text-sm text-base-content/80 p-3 bg-base-200/30 rounded-lg">
                  {selectedService.description}
                </p>
              </div>
            )}

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => detailsModalRef.current?.close()}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
