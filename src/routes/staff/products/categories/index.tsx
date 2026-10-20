import { createFileRoute } from "@tanstack/react-router";
import CategoryPage from "./-components/CategoryPage";

export const Route = createFileRoute("/staff/products/categories/")({
  component: () => <CategoryPage type="product" />,
});
