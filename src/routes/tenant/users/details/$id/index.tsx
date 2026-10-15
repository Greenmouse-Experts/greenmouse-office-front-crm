import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import UserInfo from "./-components/UserInfo";
import FullInfo from "./-components/FullInfo";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import { useStaff, type StaffMember } from "@/api/tenantApi";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/tenant/users/details/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = useParams({
    strict: false,
  });

  const query = useStaff(id || "");

  return (
    <div className="container mx-auto px-4 py-4 space-y-6">
      <PageHeader
        title="Staff Member Profile"
        description="View staff details, contact information, and role privileges"
      >
        <Link to="/tenant/users" className="btn btn-outline btn-sm gap-2">
          <ArrowLeft className="size-4" /> Back to Staff
        </Link>
      </PageHeader>

      <PageLoader
        query={query}
        emptyState={{
          title: "Staff Member Not Found",
          description: "The requested staff member could not be located.",
        }}
      >
        {(staff: StaffMember) => (
          <div className="space-y-6">
            <UserInfo staff={staff} />
            <FullInfo staff={staff} />
          </div>
        )}
      </PageLoader>
    </div>
  );
}
