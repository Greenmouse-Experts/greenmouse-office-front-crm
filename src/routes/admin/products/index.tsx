import { useState, useRef, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import SimpleContainer from "@/components/SimpleContainer";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import { RefreshCw, Package } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import ProductSummary from "./-components/ProductSummary";
import ProductNav from "./-components/ProductNav";
import type { Product } from "@/api/catalogApi";
import { useAdminCrossProducts, useAdminCrossCategories } from "@/api/adminApi";

export const Route = createFileRoute("/admin/products/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const searchProps = useSearch();
  const productsQuery = useAdminCrossProducts({
    search: searchProps.search || undefined,
  });
  const categoriesQuery = useAdminCrossCategories();

  const detailsModalRef = useRef<ModalHandle>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const rawProducts: Product[] = (productsQuery.data || []) as Product[];

  const handleOpenDetails = (product: Product) => {
    setSelectedProduct(product);
    detailsModalRef.current?.open();
  };

  // Filter products by stock status and category
  const filteredProducts = useMemo(() => {
    return rawProducts.filter((product) => {
      // Category filter
      if (categoryFilter && product.categoryId !== categoryFilter) {
        return false;
      }
      // Stock filter
      const qty = product.stock ?? product.quantity ?? 0;
      if (stockFilter === "in_stock") {
        return qty > 0 && product.isActive !== false;
      }
      if (stockFilter === "low_stock") {
        return qty > 0 && qty <= 5;
      }
      if (stockFilter === "out_of_stock") {
        return qty === 0;
      }
      if (stockFilter === "inactive") {
        return product.isActive === false;
      }
      return true;
    });
  }, [rawProducts, stockFilter, categoryFilter]);

  const actions: Actions<Product>[] = [
    {
      key: "view_details",
      label: "View Details",
      action: (product) => handleOpenDetails(product),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Products Catalog"
        description="Monitor, audit, and inspect tenant catalog products across the entire platform"
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
            {/* Summary Cards with quick filter toggles */}
            <ProductSummary
              products={rawProducts}
              activeFilter={stockFilter}
              onFilterChange={(filter: string) => setStockFilter(filter)}
            />

            <SimpleContainer>
              <ContainerRow
                showSearch
                searchProps={searchProps}
                searchPlaceholder="Search products by name..."
              >
                {/* Stock filter pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { label: "All Items", key: "all" },
                    { label: "In Stock", key: "in_stock" },
                    { label: "Low Stock (≤5)", key: "low_stock" },
                    { label: "Out of Stock", key: "out_of_stock" },
                    { label: "Inactive", key: "inactive" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setStockFilter(tab.key)}
                      className={`btn btn-sm rounded-full text-sm ${
                        stockFilter === tab.key
                          ? "btn-primary text-primary-content"
                          : "btn-ghost text-base-content/70"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Category filter dropdown */}
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
                    label: "Product Name",
                    key: "name",
                    render: (product: Product) => (
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary/10 text-primary rounded-lg w-10 h-10 flex items-center justify-center">
                            {product.images && product.images[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Package size={20} />
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-base-content text-sm">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="text-sm text-base-content/60 truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  },
                  {
                    label: "Category",
                    key: "categoryId",
                    render: (product: Product) => {
                      const cat = (categoriesQuery.data || []).find(
                        (c: any) => c.id === product.categoryId,
                      );
                      return (
                        <span className="badge badge-ghost badge-md font-medium text-sm">
                          {cat?.name || product.category?.name || "General"}
                        </span>
                      );
                    },
                  },
                  {
                    label: "Selling Price",
                    key: "price",
                    render: (product: Product) => {
                      const cur = product.currency || "NGN";
                      return (
                        <div className="font-semibold text-base-content text-sm">
                          {cur} {Number(product.price).toLocaleString()}
                        </div>
                      );
                    },
                  },
                  {
                    label: "Cost & Margin",
                    key: "cost",
                    render: (product: Product) => {
                      const cost = Number(product.cost) || 0;
                      const price = Number(product.price) || 0;
                      if (!cost) {
                        return (
                          <span className="text-sm text-base-content/50">
                            —
                          </span>
                        );
                      }
                      const cur = product.currency || "NGN";
                      const margin =
                        price > 0
                          ? (((price - cost) / price) * 100).toFixed(1)
                          : 0;
                      return (
                        <div className="text-sm">
                          <span className="text-base-content/70">
                            {cur} {cost.toLocaleString()}
                          </span>
                          <span
                            className={`ml-1.5 font-semibold ${
                              Number(margin) >= 20
                                ? "text-success"
                                : Number(margin) > 0
                                  ? "text-warning"
                                  : "text-error"
                            }`}
                          >
                            ({margin}%)
                          </span>
                        </div>
                      );
                    },
                  },
                  {
                    label: "Stock Level",
                    key: "stock",
                    render: (product: Product) => {
                      const qty = product.stock ?? product.quantity ?? 0;
                      let badgeClass = "badge-success text-success-content";
                      let label = `${qty} in stock`;
                      if (qty === 0) {
                        badgeClass = "badge-error text-error-content";
                        label = "Out of stock";
                      } else if (qty <= 5) {
                        badgeClass = "badge-warning text-warning-content";
                        label = `Low: ${qty}`;
                      }
                      return (
                        <span
                          className={`badge badge-md font-medium text-sm ${badgeClass}`}
                        >
                          {label}
                        </span>
                      );
                    },
                  },
                  {
                    label: "Status",
                    key: "isActive",
                    render: (product: Product) => (
                      <span
                        className={`badge badge-md text-sm ${
                          product.isActive !== false
                            ? "badge-success badge-outline"
                            : "badge-ghost"
                        }`}
                      >
                        {product.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    ),
                  },
                ]}
                data={filteredProducts}
              />
            </SimpleContainer>

            {/* Product Details Modal */}
            <Modal ref={detailsModalRef}>
              {selectedProduct && (
                <div className="p-6 space-y-6">
                  <div className="flex items-start justify-between border-b border-base-200 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-3 rounded-xl">
                        <Package size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-base-content">
                          {selectedProduct.name}
                        </h3>
                        <p className="text-sm text-base-content/60">
                          Product ID: {selectedProduct.id}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`badge badge-md ${
                        selectedProduct.isActive !== false
                          ? "badge-success"
                          : "badge-ghost"
                      }`}
                    >
                      {selectedProduct.isActive !== false
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Selling Price
                      </span>
                      <span className="text-base font-semibold text-base-content">
                        {selectedProduct.currency || "NGN"}{" "}
                        {Number(selectedProduct.price).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Cost Price
                      </span>
                      <span className="text-base font-semibold text-base-content">
                        {selectedProduct.currency || "NGN"}{" "}
                        {Number(selectedProduct.cost || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Profit Margin
                      </span>
                      <span className="text-base font-semibold text-success">
                        {selectedProduct.price && selectedProduct.cost
                          ? (
                              ((Number(selectedProduct.price) -
                                Number(selectedProduct.cost)) /
                                Number(selectedProduct.price)) *
                              100
                            ).toFixed(1) + "%"
                          : "N/A"}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Stock Count
                      </span>
                      <span className="text-base font-semibold text-base-content">
                        {selectedProduct.stock ?? selectedProduct.quantity ?? 0}
                      </span>
                    </div>
                  </div>

                  {selectedProduct.description && (
                    <div className="bg-base-200/30 p-4 rounded-lg">
                      <span className="text-sm font-semibold text-base-content/70 block mb-1">
                        Description
                      </span>
                      <p className="text-sm text-base-content/80 whitespace-pre-wrap">
                        {selectedProduct.description}
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
