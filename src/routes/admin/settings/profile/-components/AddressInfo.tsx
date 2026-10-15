import { Edit } from "lucide-react";
import SimpleInput from "@/components/inputs/SimpleInput";
import { FormProvider, useForm } from "react-hook-form";
import { useState } from "react";

export default function AddressInfo() {
  const methods = useForm();
  const [editMode, setEditMode] = useState(false);

  return (
    <FormProvider {...methods}>
      <div className="card bg-base-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Address</h2>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setEditMode(!editMode)}
          >
            Edit <Edit size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <SimpleInput
            label="Country"
            name="country"
            defaultValue="United Kingdom"
            disabled={!editMode}
          />
          <SimpleInput
            label="City/State"
            name="cityState"
            defaultValue="Leeds, East London"
            disabled={!editMode}
          />
          <SimpleInput
            label="Postal Code"
            name="postalCode"
            defaultValue="ERT 2354"
            disabled={!editMode}
          />
          <SimpleInput
            label="TAX ID"
            name="taxId"
            defaultValue="AS45645756"
            disabled={!editMode}
          />
        </div>
      </div>
    </FormProvider>
  );
}
