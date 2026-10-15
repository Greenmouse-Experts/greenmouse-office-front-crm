import { useState, useRef, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import SimpleContainer from "@/components/SimpleContainer";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import { RefreshCw, Wrench } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import ProductNav from "../-components/ProductNav";
import type { Product } from "@/api/catalogApi";
import { useAdminCrossProducts, useAdminCrossCategories } from "@/api/adminApi";

export const Route = createFileRoute("/admin/products/service/")({
  component: RouteComponent,
});

type ServiceItem = Product;

function RouteComponent() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const searchProps = useSearch();
  const productsQuery = useAdminCrossProducts({
    search: searchProps.search || undefined,
  });
  const categoriesQuery = useAdminCrossCategories();

  const detailsModalRef = useRef<ModalHandle>(null);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null,
  );

  const rawServices: ServiceItem[] = useMemo(() => {
    const list = (productsQuery.data || []) as Product[];
    return list.filter((p: any) => p.type === "service" || p.isService);
  }, [productsQuery.data]);

  const stats = useMemo(() => {
    const total = rawServices.length;
    const active = rawServices.filter((s) => s.isActive !== false).length;
    const inactive = total - active;
    const avgPrice =
      total > 0
        ? Math.round(
            rawServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0) /
              total,
          )
        : 0;
    return { total, active, inactive, avgPrice };
  }, [rawServices]);

  const filteredServices = useMemo(() => {
    return rawServices.filter((service) => {
      if (categoryFilter && service.categoryId !== categoryFilter) {
        return false;
      }
      if (statusFilter === "active") {
        return service.isActive !== false;
      }
      if (statusFilter === "inactive") {
        return service.isActive === false;
      }
      return true;
    });
  }, [rawServices, statusFilter, categoryFilter]);

  const handleOpenDetails = (service: ServiceItem) => {
    setSelectedService(service);
    detailsModalRef.current?.open();
  };

  const actions: Actions<ServiceItem>[] = [
    {
      key: "view_details",
      label: "View Details",
      action: (service) => handleOpenDetails(service),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Services Catalog"
        description="Monitor and inspect billable professional services across all platform tenants"
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => productsQuery.refetch()}
            className="btn btn-outline btn-sm gap-2"
            disabled={productsQuery.isFetching}
          >
            <RefreshCw
              size={15}
              className={productsQuery.isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </PageHeader>

      <ProductNav />

      <PageLoader query={productsQuery}>
        {() => (
          <div className="space-y-6">
            {/* KPI Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-base-100 rounded-box border border-base-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-lg">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-base-content">
                      {stats.total}
                    </div>
                    <div className="text-sm text-base-content/60">
                      Total Services
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-base-100 rounded-box border border-base-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-success/10 text-success p-2.5 rounded-lg">
                    <span className="font-semibold text-sm">✓</span>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-base-content">
                      {stats.active}
                    </div>
                    <div className="text-sm text-base-content/60">Active</div>
                  </div>
                </div>
              </div>

              <div className="bg-base-100 rounded-box border border-base-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-base-200 text-base-content/60 p-2.5 rounded-lg">
                    <span className="font-semibold text-sm">—</span>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-base-content">
                      {stats.inactive}
                    </div>
                    <div className="text-sm text-base-content/60">Inactive</div>
                  </div>
                </div>
              </div>

              <div className="bg-base-100 rounded-box border border-base-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-info/10 text-info p-2.5 rounded-lg">
                    <span className="font-semibold text-sm">₦</span>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-base-content">
                      ₦ {stats.avgPrice.toLocaleString()}
                    </div>
                    <div className="text-sm text-base-content/60">
                      Average Rate
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <SimpleContainer>
              <ContainerRow
                showSearch
                searchProps={searchProps}
                searchPlaceholder="Search services..."
              >
                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { label: "All Services", key: "all" },
                    { label: "Active", key: "active" },
                    { label: "Inactive", key: "inactive" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setStatusFilter(tab.key)}
                      className={`btn btn-sm rounded-full text-sm ${
                        statusFilter === tab.key
                          ? "btn-primary text-primary-content"
                          : "btn-ghost text-base-content/70"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="select select-bordered select-sm text-sm"
                  >
                    <option value="">All Categories</option>
                    {(categoriesQuery.data || []).map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </ContainerRow>

              <CustomTable
                actions={actions}
                columns={[
                  {
                    label: "Service Name",
                    key: "name",
                    render: (service: ServiceItem) => (
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-secondary/10 text-secondary rounded-lg w-10 h-10 flex items-center justify-center">
                            <Wrench size={20} />
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-base-content text-sm">
                            {service.name}
                          </div>
                          {service.description && (
                            <div className="text-sm text-base-content/60 truncate max-w-xs">
                              {service.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  },
                  {
                    label: "Category",
                    key: "categoryId",
                    render: (service: ServiceItem) => {
                      const cat = (categoriesQuery.data || []).find(
                        (c: any) => c.id === service.categoryId,
                      );
                      return (
                        <span className="badge badge-ghost badge-md font-medium text-sm">
                          {cat?.name || service.category?.name || "General"}
                        </span>
                      );
                    },
                  },
                  {
                    label: "Service Rate / Price",
                    key: "price",
                    render: (service: ServiceItem) => (
                      <div className="font-semibold text-base-content text-sm">
                        ₦ {Number(service.price).toLocaleString()}
                      </div>
                    ),
                  },
                  {
                    label: "Status",
                    key: "isActive",
                    render: (service: ServiceItem) => (
                      <span
                        className={`badge badge-md text-sm ${
                          service.isActive !== false
                            ? "badge-success badge-outline"
                            : "badge-ghost"
                        }`}
                      >
                        {service.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    ),
                  },
                ]}
                data={filteredServices}
              />
            </SimpleContainer>

            {/* Service Details Modal */}
            <Modal ref={detailsModalRef}>
              {selectedService && (
                <div className="p-6 space-y-6">
                  <div className="flex items-start justify-between border-b border-base-200 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-secondary/10 text-secondary p-3 rounded-xl">
                        <Wrench size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-base-content">
                          {selectedService.name}
                        </h3>
                        <p className="text-sm text-base-content/60">
                          Service ID: {selectedService.id}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`badge badge-md ${
                        selectedService.isActive !== false
                          ? "badge-success"
                          : "badge-ghost"
                      }`}
                    >
                      {selectedService.isActive !== false
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Billing Rate
                      </span>
                      <span className="text-xl font-semibold text-base-content">
                        ₦ {Number(selectedService.price).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Category
                      </span>
                      <span className="text-base font-semibold text-base-content">
                        {(categoriesQuery.data || []).find(
                          (c: any) => c.id === selectedService.categoryId,
                        )?.name || "General"}
                      </span>
                    </div>
                  </div>

                  {selectedService.description && (
                    <div className="bg-base-200/30 p-4 rounded-lg">
                      <span className="text-sm font-semibold text-base-content/70 block mb-1">
                        Service Scope / Description
                      </span>
                      <p className="text-sm text-base-content/80 whitespace-pre-wrap">
                        {selectedService.description}
                      </p>
                    </div>
                  )}

                  <div className="modal-action">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => detailsModalRef.current?.close()}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </Modal>
          </div>
        )}
      </PageLoader>
    </div>
  );
}
