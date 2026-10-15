import { createFileRoute, Navigate } from "@tanstack/react-router";

// Endpoint does not exist for admin: POST /v1/admins/invoices is not supported by backend.
// Invoices are created by tenants within their individual tenant workspace.
// Route commented out / redirected to invoices directory.
export const Route = createFileRoute("/admin/accounts/Invoices/add/")({
  component: () => <Navigate to="/admin/accounts/Invoices" replace />,
});

/*
Original form commented out because backend does not provide POST /v1/admins/invoices:

import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTitle from "@/components/SimpleTitle";
import FormWrapper from "@/components/forms/FormWrapper";
import LocalSelect from "@/components/inputs/LocalSelect";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

function RouteComponent() {
  ...
}
*/
