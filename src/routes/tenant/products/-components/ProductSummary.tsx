import React from "react";
import { Package, CheckCircle2, AlertTriangle, DollarSign } from "lucide-react";
import type { Product } from "@/api/catalogApi";

interface ProductSummaryProps {
  products: Product[];
}

const ProductSummary: React.FC<ProductSummaryProps> = ({ products }) => {
  const totalProducts = products.length;
  const inStockProducts = products.filter(
    (p) =>
      (p.stock !== undefined && p.stock > 0) ||
      (p.quantity !== undefined && p.quantity > 0) ||
      p.inStock === true
  ).length;
  const outOfStockProducts = totalProducts - inStockProducts;
  const totalValue = products.reduce((sum, p) => {
    const qty = p.stock ?? p.quantity ?? 0;
    return sum + (Number(p.price) || 0) * (qty > 0 ? qty : 1);
  }, 0);

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: <Package className="size-6 text-primary" />,
      description: "Active catalog items",
      color: "bg-primary/10 text-primary border-primary/20",
    },
    {
      title: "In Stock",
      value: inStockProducts,
      icon: <CheckCircle2 className="size-6 text-emerald-500" />,
      description: "Available for sale",
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    {
      title: "Out of Stock / Low",
      value: outOfStockProducts,
      icon: <AlertTriangle className="size-6 text-amber-500" />,
      description: "Needs restocking",
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    {
      title: "Estimated Inventory Value",
      value: `₦${totalValue.toLocaleString()}`,
      icon: <DollarSign className="size-6 text-blue-500" />,
      description: "Total stock valuation",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="card bg-base-100/70 backdrop-blur-md border border-base-200 shadow-sm p-4 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-base-content/60 uppercase tracking-wider">
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
      ))}
    </div>
  );
};

export default ProductSummary;
