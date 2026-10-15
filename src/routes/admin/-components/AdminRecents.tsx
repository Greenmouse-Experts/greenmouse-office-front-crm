import SimpleContainer from "@/components/SimpleContainer";
import CustomTable from "@/components/tables/CustomTable";
import { faker } from "@faker-js/faker";
import { Link } from "@tanstack/react-router";

export default function AdminRecents() {
  const transactions = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    transactionId: faker.string.uuid(),
    amount: faker.finance.amount(),
    status: faker.helpers.arrayElement(["Completed", "Pending", "Failed"]),
    date: faker.date.past().toLocaleDateString(),
  }));

  const columns = [
    { key: "transactionId", label: "Transaction ID" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "date", label: "Date" },
  ];

  const actions = [
    {
      key: "view",
      label: "View",
      action: (item: any) => console.log("View transaction:", item),
    },
  ];

  return (
    <div className="space-y-4">
      <SimpleContainer
        title="Recent Transactions"
        actions={
          <>
            <Link to="/admin/transactions" className="btn btn-primary btn-sm">
              See More
            </Link>
          </>
        }
      >
        <CustomTable
          ring={false}
          data={transactions}
          columns={columns}
          actions={actions}
        />
        {/*<div className="flex justify-center mt-4">
          <button className="btn btn-ghost">See More</button>
        </div>*/}
      </SimpleContainer>
    </div>
  );
}
