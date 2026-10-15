import React, { useState, useEffect, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Country, State } from "country-state-city";
import LocalSelect from "@/components/inputs/LocalSelect";
import {
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Truck,
  Landmark,
  Laptop2,
  HeartHandshake,
  GraduationCap,
  Factory,
  UtensilsCrossed,
  Zap,
  HelpCircle,
  Home,
  Film,
  Sprout,
  HardHat,
  Scale,
  Users,
  Sun,
  Moon,
} from "lucide-react";
import {
  useOnboardingStore,
  type OnboardingFormData,
} from "@/store/onboarding-store";
import apiClient from "@/client/api";
import { useSelectImage } from "@/helpers/images";
import SelectImage from "@/components/images/SelectImage";
import { uploadImage } from "@/client/fileApi";

export const Route = createFileRoute("/auth/register/on-boarding/")({
  component: OnboardingWizard,
});

const TOTAL_STEPS = 8;

enum Industry {
  TECHNOLOGY = "Technology",
  HEALTHCARE = "Healthcare",
  FINANCE = "Finance",
  EDUCATION = "Education",
  RETAIL = "Retail",
  MANUFACTURING = "Manufacturing",
  REAL_ESTATE = "Real Estate",
  HOSPITALITY = "Hospitality",
  TRANSPORTATION = "Transportation",
  MEDIA_ENTERTAINMENT = "Media & Entertainment",
  AGRICULTURE = "Agriculture",
  CONSTRUCTION = "Construction",
  ENERGY = "Energy",
  LEGAL = "Legal",
  CONSULTING = "Consulting",
  OTHER = "Other",
}

const INDUSTRIES = [
  {
    label: Industry.TECHNOLOGY,
    color: "bg-orange-50 border-orange-200",
    iconColor: "text-orange-500",
    icon: Laptop2,
  },
  {
    label: Industry.HEALTHCARE,
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
    icon: HeartHandshake,
  },
  {
    label: Industry.FINANCE,
    color: "bg-yellow-50 border-yellow-200",
    iconColor: "text-yellow-600",
    icon: Landmark,
  },
  {
    label: Industry.EDUCATION,
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
    icon: GraduationCap,
  },
  {
    label: Industry.RETAIL,
    color: "bg-pink-50 border-pink-200",
    iconColor: "text-pink-500",
    icon: ShoppingBag,
  },
  {
    label: Industry.MANUFACTURING,
    color: "bg-indigo-50 border-indigo-200",
    iconColor: "text-indigo-500",
    icon: Factory,
  },
  {
    label: Industry.REAL_ESTATE,
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-500",
    icon: Home,
  },
  {
    label: Industry.HOSPITALITY,
    color: "bg-red-50 border-red-200",
    iconColor: "text-red-500",
    icon: UtensilsCrossed,
  },
  {
    label: Industry.TRANSPORTATION,
    color: "bg-cyan-50 border-cyan-200",
    iconColor: "text-cyan-500",
    icon: Truck,
  },
  {
    label: Industry.MEDIA_ENTERTAINMENT,
    color: "bg-rose-50 border-rose-200",
    iconColor: "text-rose-500",
    icon: Film,
  },
  {
    label: Industry.AGRICULTURE,
    color: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-600",
    icon: Sprout,
  },
  {
    label: Industry.CONSTRUCTION,
    color: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-600",
    icon: HardHat,
  },
  {
    label: Industry.ENERGY,
    color: "bg-teal-50 border-teal-200",
    iconColor: "text-teal-500",
    icon: Zap,
  },
  {
    label: Industry.LEGAL,
    color: "bg-slate-50 border-slate-200",
    iconColor: "text-slate-600",
    icon: Scale,
  },
  {
    label: Industry.CONSULTING,
    color: "bg-violet-50 border-violet-200",
    iconColor: "text-violet-500",
    icon: Users,
  },
  {
    label: Industry.OTHER,
    color: "bg-base-200 border-base-300",
    iconColor: "text-base-content/50",
    icon: HelpCircle,
  },
];

const TEAM_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

const BUSINESS_TYPES = [
  "Sole Proprietorship",
  "Partnership",
  "Limited Liability Company",
  "Public Limited Company",
  "NGO / Non-Profit",
];

const HEAR_ABOUT_US = [
  "Social Media",
  "Google Search",
  "Friend / Colleague",
  "Advertisement",
  "News / Blog",
  "Other",
];

const THEMES: Array<{
  id: "light" | "dark";
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  {
    id: "light",
    label: "Light",
    description: "Crisp and clear workspace default",
    icon: Sun,
  },
  {
    id: "dark",
    label: "Dark",
    description: "Easy on the eyes in low light",
    icon: Moon,
  },
];

function OnboardingWizard() {
  const nav = useNavigate();
  const { step, formData, nextStep, prevStep, updateFormData, setStep } =
    useOnboardingStore();

  const { data: onboardingData } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: () =>
      apiClient
        .get("/tenant/onboarding")
        .then((res) => res.data?.data ?? res.data),
  });

  useEffect(() => {
    if (onboardingData) {
      updateFormData({
        industry: onboardingData.industry || undefined,
        teamSize: onboardingData.teamSize || undefined,
        logo: onboardingData.logo || null,
        theme: onboardingData.theme === "dark" ? "dark" : "light",
        companyAddress: onboardingData.companyAddress || undefined,
        companyCity: onboardingData.companyCity || undefined,
        companyCountry: onboardingData.companyCountry || "Nigeria",
        companyWebsite: onboardingData.companyWebsite || undefined,
        companyState: onboardingData.companyState || undefined,
        businessType: onboardingData.businessType || undefined,
        isCacRegistered:
          onboardingData.isCacRegistered !== undefined
            ? Boolean(onboardingData.isCacRegistered)
            : false,
        hearAboutUs: onboardingData.hearAboutUs || undefined,
      });
    }
  }, [onboardingData, updateFormData]);

  const patchMutation = useMutation({
    mutationFn: (payload: Partial<OnboardingFormData>) =>
      apiClient.patch("/tenant/onboarding", payload).then((r) => r.data),
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to save progress");
    },
  });

  const completeMutation = useMutation({
    mutationFn: () =>
      apiClient.post("/tenant/onboarding/complete").then((r) => r.data),
    onSuccess: () => {
      toast.success("Onboarding complete! Welcome aboard.");
      nav({ to: "/tenant" });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ?? "Failed to complete onboarding",
      );
    },
  });

  const advance = async (payload: Partial<OnboardingFormData>) => {
    const updated: OnboardingFormData = {
      ...formData,
      ...payload,
      theme:
        payload.theme === "dark"
          ? "dark"
          : payload.theme === "light"
            ? "light"
            : formData.theme,
      teamSize: payload.teamSize || formData.teamSize || "1-20",
    };
    updateFormData(updated);

    const patchPayload: Partial<OnboardingFormData> = {
      ...(updated.industry ? { industry: updated.industry } : {}),
      ...(updated.teamSize ? { teamSize: updated.teamSize } : {}),
      ...(updated.logo !== undefined ? { logo: updated.logo } : {}),
      theme: updated.theme === "dark" ? "dark" : "light",
      ...(updated.companyAddress
        ? { companyAddress: updated.companyAddress }
        : {}),
      ...(updated.companyCity ? { companyCity: updated.companyCity } : {}),
      ...(updated.companyCountry
        ? { companyCountry: updated.companyCountry }
        : {}),
      ...(updated.companyWebsite
        ? { companyWebsite: updated.companyWebsite }
        : {}),
      ...(updated.companyState ? { companyState: updated.companyState } : {}),
      ...(updated.businessType ? { businessType: updated.businessType } : {}),
      ...(updated.isCacRegistered !== undefined
        ? { isCacRegistered: Boolean(updated.isCacRegistered) }
        : {}),
      ...(updated.hearAboutUs ? { hearAboutUs: updated.hearAboutUs } : {}),
    };

    if (step === TOTAL_STEPS) {
      try {
        await patchMutation.mutateAsync(patchPayload);
        completeMutation.mutate();
      } catch {
        // Handled in patchMutation.onError
      }
    } else {
      // Autosave periodically
      if (step % 2 === 0) {
        patchMutation.mutate(patchPayload);
      }
      nextStep();
    }
  };

  const isPending = patchMutation.isPending || completeMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">CRM</h1>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 cursor-pointer ${
                i + 1 === step
                  ? "bg-primary"
                  : i + 1 < step
                    ? "bg-primary/40"
                    : "bg-base-300"
              }`}
              onClick={() => i + 1 < step && setStep(i + 1)}
            />
          ))}
        </div>
        <p className="text-xs text-primary font-medium">
          Step {step} of {TOTAL_STEPS}
        </p>
      </div>

      <StepContent
        step={step}
        formData={formData}
        advance={advance}
        prevStep={prevStep}
        isPending={isPending}
      />
    </div>
  );
}

interface StepProps {
  step: number;
  formData: OnboardingFormData;
  advance: (payload: Partial<OnboardingFormData>) => void;
  prevStep: () => void;
  isPending: boolean;
}

function StepContent({
  step,
  formData,
  advance,
  prevStep,
  isPending,
}: StepProps) {
  switch (step) {
    case 1:
      return <IndustryStep formData={formData} advance={advance} />;
    case 2:
      return (
        <LocationStep
          formData={formData}
          advance={advance}
          prevStep={prevStep}
        />
      );
    case 3:
      return (
        <TeamSizeStep
          formData={formData}
          advance={advance}
          prevStep={prevStep}
        />
      );
    case 4:
      return (
        <CompanyWebsiteStep
          formData={formData}
          advance={advance}
          prevStep={prevStep}
        />
      );
    case 5:
      return <LogoUploadStep advance={advance} prevStep={prevStep} />;
    case 6:
      return (
        <BusinessTypeStep
          formData={formData}
          advance={advance}
          prevStep={prevStep}
        />
      );
    case 7:
      return (
        <ThemeStep formData={formData} advance={advance} prevStep={prevStep} />
      );
    case 8:
      return (
        <HearAboutUsStep
          formData={formData}
          advance={advance}
          prevStep={prevStep}
          isPending={isPending}
        />
      );
    default:
      return null;
  }
}

/* ─────────────────────── Nav helpers ─────────────────────── */

function NextBtn({
  onClick,
  disabled,
  isPending,
  label = "Next",
}: {
  onClick?: () => void;
  disabled?: boolean;
  isPending?: boolean;
  label?: string;
}) {
  return (
    <button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={disabled || isPending}
      className="btn btn-primary gap-2 px-6"
    >
      {isPending ? (
        <span className="loading loading-spinner loading-sm" />
      ) : (
        <>
          {label}
          <ArrowRight size={16} />
        </>
      )}
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn btn-ghost gap-1 px-3"
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );
}

function NavRow({
  onBack,
  isPending,
  label,
  disabled,
}: {
  onBack?: () => void;
  isPending?: boolean;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between pt-4">
      {onBack ? <BackBtn onClick={onBack} /> : <span />}
      <NextBtn isPending={isPending} label={label} disabled={disabled} />
    </div>
  );
}

/* ─────────────────────── Step 1: Industry ─────────────────────── */

function IndustryStep({
  formData,
  advance,
}: Pick<StepProps, "formData" | "advance">) {
  const selected = formData.industry;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold leading-snug">
          What industry best
          <br />
          describes your business?
        </h2>
        <p className="text-sm text-base-content/60">
          This helps us customize your workspace experience
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {INDUSTRIES.map((ind) => {
          const Icon = ind.icon;
          return (
            <button
              key={ind.label}
              type="button"
              onClick={() => advance({ industry: ind.label })}
              className={`flex items-center gap-3 px-4 py-4 rounded-2xl border-2 text-sm font-semibold text-left transition-all hover:scale-[1.02] ${ind.color} ${
                selected === ind.label
                  ? "ring-2 ring-primary ring-offset-1"
                  : ""
              }`}
            >
              <span
                className={`flex items-center justify-center w-10 h-10 rounded-full bg-white/70 shrink-0 ${ind.iconColor}`}
              >
                <Icon size={20} />
              </span>
              {ind.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────── Step 2: Location & Address ─────────────────────── */

function LocationStep({
  formData,
  advance,
  prevStep,
}: Pick<StepProps, "formData" | "advance" | "prevStep">) {
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  const initialCountry = useMemo(() => {
    const raw = formData.companyCountry?.trim() || "Nigeria";
    return (
      allCountries.find(
        (c) =>
          c.name.toLowerCase() === raw.toLowerCase() ||
          c.isoCode.toLowerCase() === raw.toLowerCase(),
      ) || allCountries.find((c) => c.isoCode === "NG")
    );
  }, [allCountries, formData.companyCountry]);

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(
    initialCountry?.isoCode || "NG",
  );

  const availableStates = useMemo(() => {
    return State.getStatesOfCountry(selectedCountryCode);
  }, [selectedCountryCode]);

  const [selectedState, setSelectedState] = useState<string>(() => {
    if (formData.companyState) return formData.companyState;
    return availableStates[0]?.name || "";
  });

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedCountryCode(code);
    const states = State.getStatesOfCountry(code);
    setSelectedState(states[0]?.name || "");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const countryObj = allCountries.find(
      (c) => c.isoCode === selectedCountryCode,
    );
    const countryName = countryObj ? countryObj.name : "Nigeria";

    advance({
      companyAddress: (fd.get("companyAddress") as string).trim(),
      companyState: (
        (fd.get("companyState") as string) || selectedState
      ).trim(),
      companyCity: (fd.get("companyCity") as string).trim(),
      companyCountry: countryName,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold leading-snug">
          Where is your business
          <br />
          located?
        </h2>
        <p className="text-sm text-base-content/60">
          Enter your company address and location details.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold fieldset-label">
            Street Address *
          </label>
          <input
            name="companyAddress"
            type="text"
            defaultValue={formData.companyAddress}
            placeholder="e.g. 15 Marina Road"
            required
            className="input input-bordered w-full"
          />
        </div>

        <LocalSelect
          label="Country *"
          name="companyCountry"
          value={selectedCountryCode}
          onChange={handleCountryChange}
          required
        >
          {allCountries.map((c) => (
            <option key={c.isoCode} value={c.isoCode}>
              {c.flag} {c.name}
            </option>
          ))}
        </LocalSelect>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableStates.length > 0 ? (
            <LocalSelect
              label="State *"
              name="companyState"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              required
            >
              <option value="" disabled>
                Select State
              </option>
              {availableStates.map((s) => (
                <option key={s.isoCode || s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </LocalSelect>
          ) : (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold fieldset-label">
                State / Province *
              </label>
              <input
                name="companyState"
                type="text"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                placeholder="State or Province"
                required
                className="input input-bordered w-full"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold fieldset-label">
              City / Town *
            </label>
            <input
              name="companyCity"
              type="text"
              defaultValue={formData.companyCity}
              placeholder="e.g. Lagos"
              required
              className="input input-bordered w-full"
            />
          </div>
        </div>
      </div>

      <NavRow onBack={prevStep} />
    </form>
  );
}

/* ─────────────────────── Step 3: Team Size ─────────────────────── */

function TeamSizeStep({
  formData,
  advance,
  prevStep,
}: Pick<StepProps, "formData" | "advance" | "prevStep">) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const teamSize = fd.get("teamSize") as string;
    if (!teamSize) return;
    advance({ teamSize });
  };

  const defaultTeamSize =
    formData.teamSize && TEAM_SIZES.includes(formData.teamSize)
      ? formData.teamSize
      : "1-20";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold leading-snug">
          What is your staff /
          <br />
          team size?
        </h2>
        <p className="text-sm text-base-content/60">
          Choose the team strength that best matches your business operations.
        </p>
      </div>

      <select
        name="teamSize"
        defaultValue={defaultTeamSize}
        required
        className="select select-bordered w-full max-w-xs"
      >
        <option value="" disabled>
          Select Staff size
        </option>
        {TEAM_SIZES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <NavRow onBack={prevStep} />
    </form>
  );
}

/* ─────────────────────── Step 4: Company Website ─────────────────────── */

function CompanyWebsiteStep({
  formData,
  advance,
  prevStep,
}: Pick<StepProps, "formData" | "advance" | "prevStep">) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    advance({
      companyWebsite: (fd.get("companyWebsite") as string).trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold leading-snug">
          Your online presence
        </h2>
        <p className="text-sm text-base-content/60">
          Enter your company website URL (if available).
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold fieldset-label">
            Company Website
          </label>
          <input
            name="companyWebsite"
            type="url"
            defaultValue={formData.companyWebsite}
            placeholder="https://yourcompany.com"
            className="input input-bordered w-full"
          />
          <p className="text-xs text-base-content/50">
            Optional: Leave blank if your company does not have a website yet.
          </p>
        </div>
      </div>

      <NavRow onBack={prevStep} />
    </form>
  );
}

/* ─────────────────────── Step 5: Logo Upload ─────────────────────── */

function LogoUploadStep({
  advance,
  prevStep,
}: Pick<StepProps, "advance" | "prevStep">) {
  const [isUploading, setIsUploading] = useState(false);
  const selectImageProps = useSelectImage();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectImageProps.image) {
      setIsUploading(true);
      try {
        const response = await uploadImage(selectImageProps.image);
        const logoUrl =
          (response as any).payload?.url || (response as any).url || null;
        advance({ logo: logoUrl });
      } catch {
        toast.error("Failed to upload logo. Please try again.");
      } finally {
        setIsUploading(false);
      }
    } else {
      advance({}); // Keep current logo or continue
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold leading-snug">
          Upload your company
          <br />
          logo
        </h2>
        <p className="text-sm text-base-content/60">
          A logo helps your team and customers recognize your brand.
        </p>
      </div>

      <div className="flex justify-center py-4">
        <SelectImage {...selectImageProps} title="Company Logo" />
      </div>

      <NavRow onBack={prevStep} isPending={isUploading} />
    </form>
  );
}

/* ─────────────────────── Step 6: Business Type ─────────────────────── */

function BusinessTypeStep({
  formData,
  advance,
  prevStep,
}: Pick<StepProps, "formData" | "advance" | "prevStep">) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    advance({
      businessType: fd.get("businessType") as string,
      isCacRegistered: fd.get("isCacRegistered") === "on",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold leading-snug">
          Business registration
          <br />
          details
        </h2>
        <p className="text-sm text-base-content/60">
          This helps us provide the right compliance tools for your business.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold fieldset-label">
            Business Type *
          </label>
          <select
            name="businessType"
            defaultValue={formData.businessType}
            required
            className="select select-bordered w-full"
          >
            <option value="" disabled>
              Select business type
            </option>
            {BUSINESS_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-3 cursor-pointer pt-2">
          <input
            type="checkbox"
            name="isCacRegistered"
            defaultChecked={formData.isCacRegistered}
            className="toggle toggle-primary"
          />
          <span className="text-sm font-medium">
            My business is CAC registered
          </span>
        </label>
      </div>

      <NavRow onBack={prevStep} />
    </form>
  );
}

/* ─────────────────────── Step 7: Workspace Theme ─────────────────────── */

function ThemeStep({
  formData,
  advance,
  prevStep,
}: Pick<StepProps, "formData" | "advance" | "prevStep">) {
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">(
    formData.theme === "dark" ? "dark" : "light",
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    advance({ theme: selectedTheme });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold leading-snug">
          Choose your workspace
          <br />
          theme
        </h2>
        <p className="text-sm text-base-content/60">
          Select between light and dark interface mode for your team.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {THEMES.map((theme) => {
          const Icon = theme.icon;
          const isSelected = selectedTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setSelectedTheme(theme.id)}
              className={`p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] flex items-start gap-4 ${
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-1"
                  : "border-base-200 bg-base-100 hover:border-base-300"
              }`}
            >
              <div
                className={`p-3 rounded-xl shrink-0 ${
                  isSelected
                    ? "bg-primary text-primary-content"
                    : "bg-base-200 text-base-content/70"
                }`}
              >
                <Icon size={24} />
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-base text-base-content">
                  {theme.label}
                </div>
                <div className="text-xs text-base-content/60 leading-relaxed">
                  {theme.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <NavRow onBack={prevStep} />
    </form>
  );
}

/* ─────────────────────── Step 8: Hear About Us ─────────────────────── */

function HearAboutUsStep({
  formData,
  advance,
  prevStep,
  isPending,
}: Pick<StepProps, "formData" | "advance" | "prevStep" | "isPending">) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const hearAboutUs = fd.get("hearAboutUs") as string;
    if (!hearAboutUs) return;
    advance({ hearAboutUs });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold leading-snug">
          How did you hear about
          <br />
          us?
        </h2>
        <p className="text-sm text-base-content/60">
          Help us understand how businesses are discovering our platform.
        </p>
      </div>

      <select
        name="hearAboutUs"
        defaultValue={formData.hearAboutUs ?? ""}
        required
        className="select select-bordered w-full max-w-xs"
      >
        <option value="" disabled>
          Select Option
        </option>
        {HEAR_ABOUT_US.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <NavRow
        onBack={prevStep}
        isPending={isPending}
        label="Complete Onboarding"
      />
    </form>
  );
}
