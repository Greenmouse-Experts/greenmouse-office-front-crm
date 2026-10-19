import { useEffect } from "react";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, Building2, Mail, MapPin } from "lucide-react";
import { useCompany, useUpdateCompany, type Company } from "@/api/crmApi";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import FormWrapper from "@/components/forms/FormWrapper";
import SimpleInput from "@/components/inputs/SimpleInput";

export const Route = createFileRoute("/staff/contacts/companies/details/$id/edit")({
  component: EditCompanyPage,
});

type CompanyFormValues = {
  name: string;
  industry: string;
  federalIdNumber: string;
  groupName: string;
  workPhone: string;
  email: string;
  website: string;
  dateJoined: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

const companyToForm = (company: Company): CompanyFormValues => ({
  name: company.name ?? "",
  industry: company.industry ?? "",
  federalIdNumber: company.federalIdNumber ?? "",
  groupName: company.groupName ?? "",
  workPhone: company.workPhone ?? "",
  email: company.email ?? "",
  website: company.website ?? "",
  dateJoined: company.dateJoined?.slice(0, 10) ?? "",
  addressLine1: company.addressLine1 ?? "",
  addressLine2: company.addressLine2 ?? "",
  city: company.city ?? "",
  state: company.state ?? "",
  zipCode: company.zipCode ?? "",
  country: company.country ?? "",
});

function EditCompanyPage() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const query = useCompany(id);
  const updateCompany = useUpdateCompany();
  const methods = useForm<CompanyFormValues>();

  useEffect(() => {
    if (query.data) methods.reset(companyToForm(query.data));
  }, [query.data, methods]);

  const onSubmit = async (values: CompanyFormValues) => {
    if (!id) return;
    try {
      await updateCompany.mutateAsync({
        id,
        name: values.name.trim(),
        industry: values.industry.trim(),
        federalIdNumber: values.federalIdNumber.trim(),
        groupName: values.groupName.trim(),
        workPhone: values.workPhone.trim(),
        email: values.email.trim(),
        website: values.website.trim(),
        dateJoined: values.dateJoined || undefined,
        addressLine1: values.addressLine1.trim(),
        addressLine2: values.addressLine2.trim(),
        city: values.city.trim(),
        state: values.state.trim(),
        zipCode: values.zipCode.trim(),
        country: values.country.trim(),
      });
      toast.success(`Company "${values.name.trim()}" updated.`);
      navigate({ to: "/staff/contacts/companies" });
    } catch (error) {
      const response = error as { response?: { data?: { message?: string | string[] } } };
      const message = response.response?.data?.message;
      toast.error(
        (Array.isArray(message) ? message.join(". ") : message) ||
          "Could not update company. Please try again.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <PageHeader title="Edit company" description="Update company details, contact information, and address.">
        <Link to="/staff/contacts/companies" className="btn btn-outline btn-sm gap-2">
          <ArrowLeft className="size-4" /> Back to companies
        </Link>
      </PageHeader>

      <PageLoader query={query} loadingText="Loading company...">
        {() => (
          <section className="rounded-xl bg-base-100 p-5 shadow-sm sm:p-6">
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                <FormWrapper title="Company information">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SimpleInput
                      label="Company name"
                      icon={<Building2 className="size-4" aria-hidden="true" />}
                      {...methods.register("name", {
                        validate: (value) => !!value.trim() || "Company name is required",
                      })}
                    />
                    <SimpleInput label="Industry" {...methods.register("industry")} />
                    <SimpleInput label="Federal ID / Tax number" {...methods.register("federalIdNumber")} />
                    <SimpleInput label="Group name" {...methods.register("groupName")} />
                    <SimpleInput label="Date joined" type="date" {...methods.register("dateJoined")} />
                  </div>
                </FormWrapper>

                <FormWrapper title="Contact details">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SimpleInput label="Work phone" type="tel" {...methods.register("workPhone")} />
                    <SimpleInput
                      label="Email address"
                      type="email"
                      icon={<Mail className="size-4" aria-hidden="true" />}
                      {...methods.register("email")}
                    />
                    <SimpleInput label="Website" placeholder="https://www.company.com" {...methods.register("website")} />
                  </div>
                </FormWrapper>

                <FormWrapper title="Location">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SimpleInput
                      label="Address line 1"
                      icon={<MapPin className="size-4" aria-hidden="true" />}
                      {...methods.register("addressLine1")}
                    />
                    <SimpleInput label="Address line 2" {...methods.register("addressLine2")} />
                    <SimpleInput label="City" {...methods.register("city")} />
                    <SimpleInput label="State / Province" {...methods.register("state")} />
                    <SimpleInput label="ZIP / Postal code" {...methods.register("zipCode")} />
                    <SimpleInput label="Country" {...methods.register("country")} />
                  </div>
                </FormWrapper>

                <div className="flex justify-end gap-3 border-t border-base-200 pt-5">
                  <Link to="/staff/contacts/companies" className="btn btn-ghost">Cancel</Link>
                  <button type="submit" className="btn btn-primary" disabled={updateCompany.isPending}>
                    {updateCompany.isPending ? "Saving..." : "Save company"}
                  </button>
                </div>
              </form>
            </FormProvider>
          </section>
        )}
      </PageLoader>
    </div>
  );
}
