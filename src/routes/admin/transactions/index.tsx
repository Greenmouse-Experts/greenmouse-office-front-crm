import { createFileRoute, Navigate } from "@tanstack/react-router";

// Endpoint does not exist for admin: GET /v1/admins/transactions does not exist on backend.
// Route commented out / redirected to income & expenses audit.
export const Route = createFileRoute("/admin/transactions/")({
  component: () => <Navigate to="/admin/accounts/income-expenses" replace />,
});

/*
Original route content commented out because backend does not provide /admins/transactions:

import { useState, useRef } from "react";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import PageHeader from "@/components/Headers/PageHeader";
import { useSearch } from "@/stores/data";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageLoader from "@/components/layout/PageLoader";
import { useTransactions, type Transaction } from "@/api/financeApi";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

function RouteComponent() {
  ...
}
*/
