import { useState, useMemo, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import { Country, State } from "country-state-city";
import SimpleInput from "@/components/inputs/SimpleInput";
import ActionButton from "@/components/buttons/ActionButton";
import SimpleTitle from "@/components/SimpleTitle";
import FormWrapper from "@/components/forms/FormWrapper";
import LocalSelect from "@/components/inputs/LocalSelect";
import { useCreateContact, useCompanies } from "@/api/crmApi";
import { toast } from "sonner";

export const Route = createFileRoute("/tenant/contacts/customers/add/")({
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
  const navigate = useNavigate();
  const createContact = useCreateContact();
  const { data: companies = [] } = useCompanies();

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

  const onSubmit = async (data: CustomerFormData) => {
    try {
      const countryName =
        allCountries.find((c) => c.isoCode === selectedCountryCode)?.name ||
        data.country ||
        "Nigeria";

      await createContact.mutateAsync({
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
      toast.success(
        `Customer "${data.firstName} ${data.lastName}" added successfully!`,
      );
      navigate({ to: "/tenant/contacts/customers" });
    } catch (err: any) {
      const message = err.response?.data?.message;
      toast.error(
        (Array.isArray(message) ? message.join(". ") : message) ||
          "Failed to create customer. Please try again.",
      );
    }
  };

  return (
    <div className="p-2 space-y-6">
      <SimpleTitle title="Add New Customer" />
      <section className="p-6 bg-base-100 shadow rounded-box">
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
                      value:
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: "Invalid email address",
                    },
                  })}
                />
                <SimpleInput
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  {...methods.register("phone", {
                    required: "Phone number is required",
                  })}
                />
                <LocalSelect
                  label="Customer Type"
                  {...methods.register("type")}
                >
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
                    <option value="lead">Lead / Prospect</option>
                    <option value="inactive">Inactive</option>
                  </LocalSelect>
                  <LocalSelect
                    label="Lead Source"
                    {...methods.register("source")}
                  >
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
                  placeholder="94103"
                  {...methods.register("zipCode")}
                />
              </div>
            </FormWrapper>

            <div className="flex justify-end gap-3 pt-4 border-t border-base-200">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate({ to: "/tenant/contacts/customers" })}
              >
                Cancel
              </button>
              <ActionButton
                type="submit"
                title={
                  createContact.isPending ? "Creating..." : "Save Customer"
                }
                className="btn btn-primary"
                disabled={createContact.isPending}
              />
            </div>
          </form>
        </FormProvider>
      </section>
    </div>
  );
}
