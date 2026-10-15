import { useState, useMemo, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import { Country, State } from "country-state-city";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import ActionButton from "@/components/buttons/ActionButton";
import SimpleTitle from "@/components/SimpleTitle";
import { Building2, Mail, MapPin } from "lucide-react";
import { useCreateCompany } from "@/api/crmApi";
import { toast } from "sonner";

export const Route = createFileRoute("/tenant/contacts/companies/add/")({
  component: RouteComponent,
});

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Real Estate",
  "Hospitality",
  "Transportation",
  "Media & Entertainment",
  "Agriculture",
  "Construction",
  "Energy",
  "Legal",
  "Consulting",
  "Other",
] as const;

interface CompanyFormData {
  companyName: string;
  industry: (typeof INDUSTRIES)[number];
  federalId: string;
  groupName: string;
  workPhone: string;
  email: string;
  website: string;
  dateJoined: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

function RouteComponent() {
  const navigate = useNavigate();
  const createCompany = useCreateCompany();

  const allCountries = useMemo(() => Country.getAllCountries(), []);

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(() => {
    const defaultCountry = "Nigeria";
    const found = allCountries.find(
      (c) =>
        c.name.toLowerCase() === defaultCountry.toLowerCase() ||
        c.isoCode.toLowerCase() === defaultCountry.toLowerCase(),
    );
    return found?.isoCode || "NG";
  });

  const availableStates = useMemo(() => {
    return selectedCountryCode
      ? State.getStatesOfCountry(selectedCountryCode)
      : [];
  }, [selectedCountryCode]);

  const methods = useForm<CompanyFormData>({
    defaultValues: {
      companyName: "",
      industry: "Technology",
      federalId: "",
      groupName: "",
      workPhone: "",
      email: "",
      website: "",
      dateJoined: new Date().toISOString().split("T")[0],
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
      country: "Nigeria",
    },
  });

  useEffect(() => {
    const countryObj = allCountries.find(
      (c) => c.isoCode === selectedCountryCode,
    );
    if (countryObj) {
      methods.setValue("country", countryObj.name);
    }
  }, [selectedCountryCode, allCountries, methods]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedCountryCode(code);
    const countryObj = allCountries.find((c) => c.isoCode === code);
    methods.setValue("country", countryObj ? countryObj.name : "");
    methods.setValue("state", "");
  };

  const onSubmit = async (data: CompanyFormData) => {
    try {
      const countryName =
        allCountries.find((c) => c.isoCode === selectedCountryCode)?.name ||
        data.country ||
        "Nigeria";

      await createCompany.mutateAsync({
        name: data.companyName,
        industry: data.industry,
        federalIdNumber: data.federalId,
        groupName: data.groupName,
        workPhone: data.workPhone,
        email: data.email,
        website: data.website,
        dateJoined: data.dateJoined,
        addressLine1: data.address1,
        addressLine2: data.address2,
        city: data.city,
        state: data.state,
        zipCode: data.zip,
        country: countryName,
      });
      toast.success(`Company "${data.companyName}" created successfully!`);
      navigate({ to: "/tenant/contacts/companies" });
    } catch (err: any) {
      const message = err.response?.data?.message;
      toast.error(
        (Array.isArray(message) ? message.join(". ") : message) ||
          "Failed to create company. Please try again.",
      );
    }
  };

  return (
    <div className="p-4 space-y-6">
      <SimpleTitle title="Add New Company" />
      <section className="p-6 bg-base-100 shadow rounded-box">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Building2 size={20} className="text-primary" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SimpleInput
                  label="Company Name"
                  placeholder="e.g. Acme Corporation"
                  {...methods.register("companyName", { required: "Required" })}
                />
                <LocalSelect label="Industry" {...methods.register("industry")}>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </LocalSelect>
                <SimpleInput
                  label="Federal ID / Tax Number"
                  placeholder="XX-XXXXXXX"
                  {...methods.register("federalId")}
                />
                <SimpleInput
                  label="Group Name"
                  placeholder="Corporate, Subsidiary, etc."
                  {...methods.register("groupName")}
                />
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4 border-t border-base-200 pt-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Mail size={20} className="text-primary" />
                Contact Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SimpleInput
                  label="Work Phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  {...methods.register("workPhone")}
                />
                <SimpleInput
                  label="Email Address"
                  type="email"
                  placeholder="contact@company.com"
                  {...methods.register("email")}
                />
                <SimpleInput
                  label="Website"
                  placeholder="https://www.company.com"
                  {...methods.register("website")}
                />
                <SimpleInput
                  label="Date Joined"
                  type="date"
                  {...methods.register("dateJoined")}
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4 border-t border-base-200 pt-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MapPin size={20} className="text-primary" />
                Location
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <SimpleInput
                  label="Address Line 1"
                  placeholder="123 Main Street"
                  {...methods.register("address1")}
                />
                <SimpleInput
                  label="Address Line 2"
                  placeholder="Suite, Floor, etc."
                  {...methods.register("address2")}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      label="State / Province"
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
                      label="State / Province"
                      placeholder="State or Province"
                      {...methods.register("state")}
                    />
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SimpleInput
                    label="City"
                    placeholder="City / Town"
                    {...methods.register("city")}
                  />
                  <SimpleInput
                    label="ZIP / Postal Code"
                    placeholder="90210"
                    {...methods.register("zip")}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-base-200">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate({ to: "/tenant/contacts/companies" })}
              >
                Cancel
              </button>
              <ActionButton
                type="submit"
                title={createCompany.isPending ? "Saving..." : "Create Company"}
                className="btn btn-primary"
                disabled={createCompany.isPending}
              />
            </div>
          </form>
        </FormProvider>
      </section>
    </div>
  );
}
