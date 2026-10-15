import { createFileRoute } from "@tanstack/react-router";
import UserInfo from "./-components/UserInfo";
import PersonalInfo from "./-components/PersonalInfo";
import AddressInfo from "./-components/AddressInfo";

export const Route = createFileRoute("/tenant/settings/profile/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-4 *:ring *:p-4 *:ring-current/10 *:rounded-box">
      <UserInfo />
      <PersonalInfo />
      <AddressInfo />
    </div>
  );
}
