import CustomTabs from "@/components/CustomTabs";
import { useTabs } from "@/stores/client";

export default function FullInfo() {
  const tabs = [
    { name: "Company Info" },
    // { name: "Phone Numbers" },
    // { name: "Payroll Data" },
    // { name: "Pay Method" },
    // { name: "Notes" },
  ];
  const props = useTabs(tabs, tabs[0]);

  return (
    <div className="bg-base-100 px-4 py-4">
      <CustomTabs tabs={tabs} tabProps={props} />
      <div className="mt-4 px-4">
        <h2 className="text-xl font-semibold mb-4">{props.tab.name}</h2>
        <div className="grid grid-cols-2 gap-4 min-h-52">
          {props.tab.name === "Company Info" && (
            <>
              <div>
                <p className="text-gray-500">Company Name</p>
                <p>Acme Corporation</p>
              </div>
              <div>
                <p className="text-gray-500">Group Name</p>
                <p>Marketing Department</p>
              </div>
              <div>
                <p className="text-gray-500">Federal ID Number</p>
                <p>987-65-4321</p>
              </div>
              <div>
                <p className="text-gray-500">Address 1</p>
                <p>123 Main Street</p>
              </div>
              <div>
                <p className="text-gray-500">Address 2</p>
                <p>Suite 400</p>
              </div>
              <div>
                <p className="text-gray-500">City</p>
                <p>Anytown</p>
              </div>
              <div>
                <p className="text-gray-500">State/Province</p>
                <p>CA</p>
              </div>
              <div>
                <p className="text-gray-500">Country Name</p>
                <p>United States of America</p>
              </div>
              <div>
                <p className="text-gray-500">Zip/Postal Code</p>
                <p>90210</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
