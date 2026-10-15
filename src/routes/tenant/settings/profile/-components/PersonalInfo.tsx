import { Mail, Phone, Briefcase, Edit } from "lucide-react";
import SimpleInput from "@/components/inputs/SimpleInput";
import { FormProvider, useForm } from "react-hook-form";
import { useState } from "react";

export default function PersonalInfo() {
  const methods = useForm();
  const [editMode, setEditMode] = useState(false);

  return (
    <FormProvider {...methods}>
      <div className="card bg-base-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setEditMode(!editMode)}
          >
            Edit <Edit size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <SimpleInput
            label="First Name"
            name="firstName"
            defaultValue="Rafiqur"
            disabled={!editMode}
          />
          <SimpleInput
            label="Last Name"
            name="lastName"
            defaultValue="Rahman"
            disabled={!editMode}
          />
          <SimpleInput
            label="Email address"
            name="email"
            type="email"
            defaultValue="rafiqurrahman51@gmail.com"
            icon={<Mail size={16} />}
            disabled={!editMode}
          />
          <SimpleInput
            label="Phone"
            name="phone"
            type="tel"
            defaultValue="+09 345 346 46"
            icon={<Phone size={16} />}
            disabled={!editMode}
          />
        </div>

        <SimpleInput
          label="Bio"
          name="bio"
          defaultValue="Team Manager"
          icon={<Briefcase size={16} />}
          disabled={!editMode}
        />
      </div>
    </FormProvider>
  );
}
