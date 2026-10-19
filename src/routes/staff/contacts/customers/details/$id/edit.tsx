import { useState, useMemo, useEffect } from "react";
import { createFileRoute, useParams, useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { Country, State } from "country-state-city";
import { ArrowLeft, UserCheck } from "lucide-react";
import SimpleInput from "@/components/inputs/SimpleInput";
import ActionButton from "@/components/buttons/ActionButton";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import FormWrapper from "@/components/forms/FormWrapper";
import LocalSelect from "@/components/inputs/LocalSelect";
import { useContact, useUpdateContact, useCompanies, type Contact } from "@/api/crmApi";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/contacts/customers/details/$id/edit")({
  component: RouteComponent,
});

interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: string;
  companyName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  source: string;
  status: string;
}

function RouteComponent() {
  const { id } = useParams({ strict: false });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const query = useContact(id);
  const updateContact = useUpdateContact();
  const { data: companies = [] } = useCompanies();

  const allCountries = useMemo(() => Country.getAllCountries(), []);

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("NG");

  const availableStates = useMemo(() => {
    return selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : [];
  }, [selectedCountryCode]);

  const methods = useForm<CustomerFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      type: "individual",
      companyName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Nigeria",
      source: "Referral",
      status: "customer",
    },
  });

  // Populate form with contact data once loaded
  useEffect(() => {
    if (!query.data) return;
    const c = query.data;

    // Detect country code
    const countryName = c.country || "Nigeria";
    const foundCountry = allCountries.find(
      (item) =>
        item.name.toLowerCase() === countryName.toLowerCase() ||
        item.isoCode.toLowerCase() === countryName.toLowerCase(),
    );
    const countryCode = foundCountry?.isoCode || "NG";
    setSelectedCountryCode(countryCode);

    methods.reset({
      firstName: c.firstName || "",
      lastName: c.lastName || "",
      email: c.email || "",
      phone: c.phone || c.workPhone || c.cellPhone || "",
      type: c.type || "individual",
      companyName: c.companyName || c.company?.name || "",
      address: c.address || c.addressLine1 || "",
      city: c.city || "",
      state: c.state || "",
      zipCode: c.zipCode || "",
      country: foundCountry?.name || countryName,
      source: c.source || "Referral",
      status: c.status || "customer",
    });
  }, [query.data, allCountries, methods]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedCountryCode(code);
    const countryObj = allCountries.find((c) => c.isoCode === code);
    methods.setValue("country", countryObj ? countryObj.name : "");
    methods.setValue("state", "");
  };

  const onSubmit = async (data: CustomerFormData) => {
    if (!id) return;
    try {
      const countryName =
        allCountries.find((c) => c.isoCode === selectedCountryCode)?.name ||
        data.country ||
        "Nigeria";

      await updateContact.mutateAsync({
        id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        type: data.type,
        companyName: data.companyName,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: countryName,
        source: data.source,
        status: data.status,
      });

      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      await queryClient.invalidateQueries({ queryKey: ["contacts", id] });

      toast.success(
        `Customer "${data.firstName} ${data.lastName}" updated successfully!`,
      );
      navigate({
        to: "/staff/contacts/customers/details/$id",
        params: { id },
      });
    } catch (err: any) {
      const message = err.response?.data?.message;
      toast.error(
        (Array.isArray(message) ? message.join(". ") : message) ||
          "Failed to update customer. Please try again.",
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 space-y-6">
      <PageHeader
        title="Edit Customer"
        description="Update client details, contact information, company affiliation, and address"
      >
        <Link
          to="/staff/contacts/customers/details/$id"
          params={{ id: id || "" }}
          className="btn btn-outline btn-sm gap-2"
        >
          <ArrowLeft className="size-4" /> Back to Profile
        </Link>
      </PageHeader>

      <PageLoader
        query={query}
        emptyState={{
          title: "Customer Not Found",
          description: "Cannot edit: customer profile could not be loaded.",
        }}
      >
        {(_contact: Contact) => (
          <section className="p-6 bg-base-100 shadow-sm border border-base-200 rounded-2xl">
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Contact Identity */}
                  <FormWrapper title="Customer Identity">
                    <div className="grid grid-cols-2 gap-3">
                      <SimpleInput
                        label="First Name"
                        placeholder="Jane"
                        {...methods.register("firstName", {
                          required: "First Name is required",
                        })}
                      />
                      <SimpleInput
                        label="Last Name"
                        placeholder="Doe"
                        {...methods.register("lastName", {
                          required: "Last Name is required",
                        })}
                      />
                    </div>
                    <SimpleInput
                      label="Email Address"
                      type="email"
                      placeholder="jane.doe@example.com"
                      {...methods.register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                          message: "Invalid email address",
                        },
                      })}
                    />
                    <SimpleInput
                      label="Phone Number"
                      type="tel"
                      placeholder="+234 800 000 0000"
                      {...methods.register("phone", {
                        required: "Phone number is required",
                      })}
                    />
                    <LocalSelect label="Customer Type" {...methods.register("type")}>
                      <option value="individual">Individual</option>
                      <option value="business">Business / Commercial</option>
                      <option value="partner">Partner</option>
                    </LocalSelect>
                  </FormWrapper>

                  {/* Company & Organization */}
                  <FormWrapper title="Company Affiliation">
                    <div className="space-y-4">
                      <LocalSelect
                        label="Assign Company (Optional)"
                        {...methods.register("companyName")}
                      >
                        <option value="">None / Independent</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </LocalSelect>
                      <LocalSelect label="Status" {...methods.register("status")}>
                        <option value="active">Active Customer</option>
                        <option value="customer">Customer</option>
                        <option value="lead">Lead / Prospect</option>
                        <option value="inactive">Inactive</option>
                      </LocalSelect>
                      <LocalSelect label="Lead Source" {...methods.register("source")}>
                        <option value="Referral">Referral</option>
                        <option value="Website">Website Form</option>
                        <option value="Organic Search">Organic Search</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Direct Call">Direct Call</option>
                        <option value="Other">Other</option>
                      </LocalSelect>
                    </div>
                  </FormWrapper>
                </div>

                {/* Address Information */}
                <FormWrapper title="Physical & Billing Address">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <SimpleInput
                        label="Street Address"
                        placeholder="123 Market Street"
                        {...methods.register("address")}
                      />
                    </div>

                    <LocalSelect
                      label="Country"
                      value={selectedCountryCode}
                      onChange={handleCountryChange}
                    >
                      <option value="" disabled>
                        Select Country
                      </option>
                      {allCountries.map((c) => (
                        <option key={c.isoCode} value={c.isoCode}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </LocalSelect>

                    {availableStates.length > 0 ? (
                      <LocalSelect
                        label="State / Province / Region"
                        {...methods.register("state")}
                      >
                        <option value="">Select State / Province</option>
                        {availableStates.map((s) => (
                          <option key={s.isoCode || s.name} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </LocalSelect>
                    ) : (
                      <SimpleInput
                        label="State / Province / Region"
                        placeholder="State or Province"
                        {...methods.register("state")}
                      />
                    )}

                    <SimpleInput
                      label="City"
                      placeholder="City / Town"
                      {...methods.register("city")}
                    />
                    <SimpleInput
                      label="ZIP / Postal Code"
                      placeholder="100001"
                      {...methods.register("zipCode")}
                    />
                  </div>
                </FormWrapper>

                <div className="flex justify-end gap-3 pt-4 border-t border-base-200">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() =>
                      navigate({
                        to: "/staff/contacts/customers/details/$id",
                        params: { id: id || "" },
                      })
                    }
                  >
                    Cancel
                  </button>
                  <ActionButton
                    type="submit"
                    className="btn btn-primary"
                    disabled={updateContact.isPending}
                  >
                    <UserCheck className="size-4" />
                    {updateContact.isPending ? "Updating..." : "Update Customer"}
                  </ActionButton>
                </div>
              </form>
            </FormProvider>
          </section>
        )}
      </PageLoader>
    </div>
  );
}
