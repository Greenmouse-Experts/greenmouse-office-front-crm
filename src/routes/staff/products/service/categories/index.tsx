import { createFileRoute } from "@tanstack/react-router";
import CategoryPage from "../../categories/-components/CategoryPage";

export const Route = createFileRoute("/staff/products/service/categories/")({
  component: () => <CategoryPage type="service" />,
});
