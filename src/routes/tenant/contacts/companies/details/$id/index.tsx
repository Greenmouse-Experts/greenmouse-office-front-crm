import { createFileRoute, useParams } from "@tanstack/react-router";
import FullInfo from "./-components/FullInfo";
import OtherInfo from "./-components/OtherInfo";
import SimpleTitle from "@/components/SimpleTitle";
import CompanyInfo from "./-components/CompanyInfo";

export const Route = createFileRoute("/tenant/contacts/companies/details/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id: _id } = useParams({
    strict: false,
  });
  return (
    <div className="container mx-auto  px-4 py-4 space-y-4">
      <SimpleTitle title={"Company Details"}></SimpleTitle>
      <CompanyInfo />
      <FullInfo />
      <OtherInfo />
    </div>
  );
}
