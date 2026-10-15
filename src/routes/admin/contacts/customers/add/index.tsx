import { createFileRoute, Navigate } from "@tanstack/react-router";

// Endpoint does not exist for admin: POST /v1/admins/contacts is not supported by backend.
// Customers are created by tenants within their individual tenant portal.
// Route commented out / redirected to customers directory.
export const Route = createFileRoute("/admin/contacts/customers/add/")({
  component: () => <Navigate to="/admin/contacts/customers" replace />,
});

/*
Original form commented out because backend does not provide POST /v1/admins/contacts:

import { useForm, FormProvider } from "react-hook-form";
import SimpleInput from "@/components/inputs/SimpleInput";
import ActionButton from "@/components/buttons/ActionButton";
import SimpleTitle from "@/components/SimpleTitle";
import SelectImage from "@/components/images/SelectImage";
import { useSelectImage } from "@/helpers/images";
import FormWrapper from "@/components/forms/FormWrapper";
import LocalSelect from "@/components/inputs/LocalSelect";

function RouteComponent() {
  const methods = useForm();
  const onSubmit = (data: any) => console.log(data);
  const props = useSelectImage();
  ...
}
*/
