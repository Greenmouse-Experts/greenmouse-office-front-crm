import { createFileRoute } from "@tanstack/react-router";
import ExpensesStat from "./-components/ExpensesStats";
import { useTabs, type Tab } from "@/stores/client";
import CustomTabs from "@/components/CustomTabs";
import IncomeTable from "./-components/IncomeTable";
import ExpenseTable from "./-components/ExpenseTable";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import { useAdminCrossIncome, useAdminCrossExpenses } from "@/api/adminApi";
import { RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/accounts/income-expenses/")({
  component: RouteComponent,
});

function RouteComponent() {
  const tabs: Tab[] = [{ name: "Income" }, { name: "Expenses" }];
  const tab = useTabs(tabs, { name: "Income" });
  const searchProps = useSearch();

  const incomeQuery = useAdminCrossIncome();
  const expenseQuery = useAdminCrossExpenses();

  const activeQuery = tab.tab.name === "Income" ? incomeQuery : expenseQuery;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income & Expenses Audit"
        description="Monitor cross-tenant revenue streams, operating expenses, and financial health"
      >
        <button
          onClick={() => {
            incomeQuery.refetch();
            expenseQuery.refetch();
          }}
          className="btn btn-outline btn-sm gap-2"
          disabled={incomeQuery.isFetching || expenseQuery.isFetching}
        >
          <RefreshCw
            size={15}
            className={
              incomeQuery.isFetching || expenseQuery.isFetching
                ? "animate-spin"
                : ""
            }
          />
          Refresh
        </button>
      </PageHeader>

      <PageLoader query={activeQuery}>
        {() => (
          <div className="space-y-6">
            <ExpensesStat
              incomeList={incomeQuery.data || []}
              expenseList={expenseQuery.data || []}
            />

            <div className="bg-base-100 rounded-box border border-base-200 shadow-sm p-4 space-y-4">
              <ContainerRow
                showSearch
                searchProps={searchProps}
                searchPlaceholder={`Search ${tab.tab.name.toLowerCase()} entries...`}
              >
                <div className="flex items-center">
                  <CustomTabs tabs={tabs} tabProps={tab} />
                </div>
              </ContainerRow>

              {tab.tab.name === "Income" ? (
                <IncomeTable searchTerm={searchProps.search || ""} />
              ) : (
                <ExpenseTable searchTerm={searchProps.search || ""} />
              )}
            </div>
          </div>
        )}
      </PageLoader>
    </div>
  );
}
