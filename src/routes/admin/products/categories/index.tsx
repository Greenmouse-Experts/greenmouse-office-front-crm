import { useState, useRef, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import SimpleContainer from "@/components/SimpleContainer";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import { RefreshCw, Tag, Package, Wrench } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import ProductNav from "../-components/ProductNav";
import { useAdminCrossCategories } from "@/api/adminApi";

export const Route = createFileRoute("/admin/products/categories/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const searchProps = useSearch();
  const categoriesQuery = useAdminCrossCategories();

  const detailsModalRef = useRef<ModalHandle>(null);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);

  const rawCategories = (categoriesQuery.data || []) as any[];

  const stats = useMemo(() => {
    const total = rawCategories.length;
    const products = rawCategories.filter(
      (c) => (c.type || "").toLowerCase() !== "service",
    ).length;
    const services = rawCategories.filter(
      (c) => (c.type || "").toLowerCase() === "service",
    ).length;
    return { total, products, services };
  }, [rawCategories]);

  const filteredCategories = useMemo(() => {
    return rawCategories.filter((c) => {
      if (searchProps.search) {
        const query = searchProps.search.toLowerCase();
        const matchesName = c.name?.toLowerCase().includes(query);
        const matchesDesc = c.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }
      if (typeFilter === "product") {
        return (c.type || "").toLowerCase() !== "service";
      }
      if (typeFilter === "service") {
        return (c.type || "").toLowerCase() === "service";
      }
      return true;
    });
  }, [rawCategories, typeFilter, searchProps.search]);

  const handleOpenDetails = (category: any) => {
    setSelectedCategory(category);
    detailsModalRef.current?.open();
  };

  const actions: Actions<any>[] = [
    {
      key: "view_details",
      label: "View Details",
      action: (cat) => handleOpenDetails(cat),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Categories Catalog"
        description="Monitor, audit, and organize item classifications across all platform tenants"
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => categoriesQuery.refetch()}
            className="btn btn-outline btn-sm gap-2"
            disabled={categoriesQuery.isFetching}
          >
            <RefreshCw
              size={15}
              className={categoriesQuery.isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </PageHeader>

      <ProductNav />

      <PageLoader query={categoriesQuery}>
        {() => (
          <div className="space-y-6">
            {/* KPI Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-base-100 rounded-box border border-base-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-lg">
                    <Tag size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-base-content">
                      {stats.total}
                    </div>
                    <div className="text-sm text-base-content/60">
                      Total Categories
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-base-100 rounded-box border border-base-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-info/10 text-info p-2.5 rounded-lg">
                    <Package size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-info">
                      {stats.products}
                    </div>
                    <div className="text-sm text-base-content/60">
                      Product Categories
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-base-100 rounded-box border border-base-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/10 text-secondary p-2.5 rounded-lg">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-secondary">
                      {stats.services}
                    </div>
                    <div className="text-sm text-base-content/60">
                      Service Categories
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <SimpleContainer>
              <ContainerRow
                showSearch
                searchProps={searchProps}
                searchPlaceholder="Search categories..."
              >
                {/* Type Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { label: "All Categories", key: "all" },
                    { label: "Products", key: "product" },
                    { label: "Services", key: "service" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setTypeFilter(tab.key)}
                      className={`btn btn-sm rounded-full text-sm ${
                        typeFilter === tab.key
                          ? "btn-primary text-primary-content"
                          : "btn-ghost text-base-content/70"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </ContainerRow>

              <CustomTable
                actions={actions}
                columns={[
                  {
                    label: "Category Name",
                    key: "name",
                    render: (c: any) => (
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-base-200 text-base-content/70 rounded-lg w-10 h-10 flex items-center justify-center">
                            <Tag size={18} />
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-base-content text-sm">
                            {c.name}
                          </div>
                          {c.description && (
                            <div className="text-sm text-base-content/60 truncate max-w-sm">
                              {c.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  },
                  {
                    label: "Type",
                    key: "type",
                    render: (c: any) => {
                      const isService =
                        (c.type || "").toLowerCase() === "service";
                      return (
                        <span
                          className={`badge badge-md font-medium text-sm ${
                            isService
                              ? "badge-secondary badge-outline"
                              : "badge-info badge-outline"
                          }`}
                        >
                          {isService ? "Service" : "Product"}
                        </span>
                      );
                    },
                  },
                  {
                    label: "Tenant ID",
                    key: "tenantId",
                    render: (c: any) => (
                      <span className="text-sm font-mono text-base-content/60 truncate max-w-[140px] block">
                        {c.tenantId || "Global / System"}
                      </span>
                    ),
                  },
                  {
                    label: "Created Date",
                    key: "createdAt",
                    render: (c: any) => (
                      <span className="text-sm text-base-content/60">
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleDateString()
                          : "—"}
                      </span>
                    ),
                  },
                ]}
                data={filteredCategories}
              />
            </SimpleContainer>

            {/* Category Details Modal */}
            <Modal ref={detailsModalRef}>
              {selectedCategory && (
                <div className="p-6 space-y-6">
                  <div className="flex items-start justify-between border-b border-base-200 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-3 rounded-xl">
                        <Tag size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-base-content">
                          {selectedCategory.name}
                        </h3>
                        <p className="text-sm text-base-content/60">
                          Category ID: {selectedCategory.id}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`badge badge-md text-sm ${
                        (selectedCategory.type || "").toLowerCase() ===
                        "service"
                          ? "badge-secondary"
                          : "badge-info"
                      }`}
                    >
                      {(selectedCategory.type || "Product").toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Tenant Scope
                      </span>
                      <span className="text-sm font-mono text-base-content break-all">
                        {selectedCategory.tenantId || "Global / System"}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Created At
                      </span>
                      <span className="text-sm font-semibold text-base-content">
                        {selectedCategory.createdAt
                          ? new Date(
                              selectedCategory.createdAt,
                            ).toLocaleString()
                          : "—"}
                      </span>
                    </div>
                  </div>

                  {selectedCategory.description && (
                    <div className="bg-base-200/30 p-4 rounded-lg">
                      <span className="text-sm font-semibold text-base-content/70 block mb-1">
                        Description
                      </span>
                      <p className="text-sm text-base-content/80 whitespace-pre-wrap">
                        {selectedCategory.description}
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
