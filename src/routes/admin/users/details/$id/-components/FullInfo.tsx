import CustomTabs from "@/components/CustomTabs";
import { useTabs } from "@/stores/client";

export default function FullInfo() {
  const tabs = [
    { name: "Employee Information" },
    { name: "Phone Numbers" },
    { name: "Payroll Data" },
    { name: "Pay Method" },
    { name: "Notes" },
  ];
  const props = useTabs(tabs, tabs[0]);

  return (
    <div className="bg-base-100 px-4 py-4">
      <CustomTabs tabs={tabs} tabProps={props} />
      <div className="mt-4 px-4">
        <h2 className="text-xl font-semibold mb-4">{props.tab.name}</h2>
        <div className="grid grid-cols-2 gap-4 min-h-52">
          {props.tab.name === "Employee Information" && (
            <>
              <div>
                <p className="text-gray-500">Employer</p>
                <p>Preferred Services</p>
              </div>
              <div>
                <p className="text-gray-500">Group Name</p>
                <p>Full Time</p>
              </div>
              <div>
                <p className="text-gray-500">Full Name</p>
                <p>Amber Leary</p>
              </div>
              <div>
                <p className="text-gray-500">Default Position</p>
                <p>Engineer</p>
              </div>
              <div>
                <p className="text-gray-500">First Name</p>
                <p>Amber</p>
              </div>
              <div>
                <p className="text-gray-500">Middle Name</p>
                <p>Misty</p>
              </div>
              <div>
                <p className="text-gray-500">Last Name</p>
                <p>Leary</p>
              </div>
              <div>
                <p className="text-gray-500">Federal ID Number</p>
                <p>123-82-9876</p>
              </div>
              <div>
                <p className="text-gray-500">Address 1</p>
                <p>1029 Menaturi Street</p>
              </div>
              <div>
                <p className="text-gray-500">Address 2</p>
                <p>UP37</p>
              </div>
              <div>
                <p className="text-gray-500">City</p>
                <p>Victoria City</p>
              </div>
              <div>
                <p className="text-gray-500">State/Province</p>
                <p>Kowloon</p>
              </div>
              <div>
                <p className="text-gray-500">Country Name</p>
                <p>United States of America</p>
              </div>
              <div>
                <p className="text-gray-500">Zip/Postal Code</p>
                <p>999077</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
