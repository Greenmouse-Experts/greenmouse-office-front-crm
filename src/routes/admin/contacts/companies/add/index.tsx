import { createFileRoute, Navigate } from "@tanstack/react-router";

// Endpoint does not exist for admin: POST /v1/admins/companies is not supported by backend.
// Companies are created by tenants within their individual tenant portal.
// Route commented out / redirected to companies directory.
export const Route = createFileRoute("/admin/contacts/companies/add/")({
  component: () => <Navigate to="/admin/contacts/companies" replace />,
});

/*
Original form commented out because backend does not provide POST /v1/admins/companies:

import { useForm, FormProvider } from "react-hook-form";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import ActionButton from "@/components/buttons/ActionButton";
import SimpleTitle from "@/components/SimpleTitle";
import { Building2, Mail, MapPin } from "lucide-react";

function RouteComponent() {
  const methods = useForm();
  const onSubmit = (data: any) => console.log(data);

  return (
    <div className="p-4">
      <SimpleTitle title={"Add New Company"} />
      <section className="p-4 bg-base-100 shadow rounded-box py-8">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
            ...
          </form>
        </FormProvider>
      </section>
    </div>
  );
}
*/
