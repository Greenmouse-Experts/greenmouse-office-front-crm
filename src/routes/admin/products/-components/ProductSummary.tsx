import React from "react";
import { Package, CheckCircle2, AlertTriangle, DollarSign } from "lucide-react";
import type { Product } from "@/api/catalogApi";

interface ProductSummaryProps {
  products: Product[];
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

const ProductSummary: React.FC<ProductSummaryProps> = ({
  products,
  activeFilter = "all",
  onFilterChange,
}) => {
  const totalProducts = products.length;
  const inStockProducts = products.filter(
    (p) =>
      (p.stock !== undefined && p.stock > 5) ||
      (p.quantity !== undefined && p.quantity > 5) ||
      p.inStock === true,
  ).length;
  const lowOrOutOfStockProducts = products.filter((p) => {
    const qty = p.stock ?? p.quantity ?? 0;
    return qty <= 5;
  }).length;

  const totalValue = products.reduce((sum, p) => {
    const qty = p.stock ?? p.quantity ?? 0;
    return sum + (Number(p.price) || 0) * (qty > 0 ? qty : 1);
  }, 0);

  const stats = [
    {
      id: "all",
      title: "Total Products",
      value: totalProducts,
      icon: <Package className="size-6 text-primary" />,
      description: "Active catalog items",
      color: "bg-primary/10 text-primary border-primary/20",
      clickable: true,
    },
    {
      id: "in_stock",
      title: "In Stock (>5)",
      value: inStockProducts,
      icon: <CheckCircle2 className="size-6 text-emerald-500" />,
      description: "Healthy inventory levels",
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      clickable: true,
    },
    {
      id: "low_stock",
      title: "Low / Out of Stock (≤5)",
      value: lowOrOutOfStockProducts,
      icon: <AlertTriangle className="size-6 text-amber-500" />,
      description: "Needs restocking attention",
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      clickable: true,
    },
    {
      id: "value",
      title: "Inventory Valuation",
      value: `₦${totalValue.toLocaleString()}`,
      icon: <DollarSign className="size-6 text-blue-500" />,
      description: "Total estimated stock value",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      clickable: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const isSelected = activeFilter === stat.id;
        return (
          <div
            key={stat.id}
            onClick={() => {
              if (stat.clickable && onFilterChange) {
                onFilterChange(isSelected ? "all" : stat.id);
              }
            }}
            className={`card bg-base-100/70 backdrop-blur-md border shadow-sm p-4 transition-all duration-200 ${
              stat.clickable
                ? "cursor-pointer hover:shadow-md hover:border-primary/50"
                : ""
            } ${
              isSelected
                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                : "border-base-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-semibold text-base-content mt-1">
                  {stat.value}
                </h3>
                <p className="text-xs text-base-content/50 mt-0.5">
                  {stat.description}
                </p>
              </div>
              <div className={`p-3 rounded-xl border ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductSummary;
