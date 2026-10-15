import { createFileRoute, Outlet } from "@tanstack/react-router";
import HomeNav from "@/routes/home/-components/HomeNav";

export const Route = createFileRoute("/auth/verify")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <HomeNav />
      <div className="flex min-h-screen w-full overflow-hidden bg-base-100">
        {/* Left Side: Form Content */}
        <div className="flex w-full flex-col lg:w-1/2">
          <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-24">
            <div className="w-full max-w-md mx-auto">
              <Outlet />
            </div>
          </div>

          {/* Mobile-only footer */}
          <div className="p-6 text-center text-xs opacity-50 lg:hidden">
            © 2026 CRMgreenmouse
          </div>
        </div>

        {/* Right Side: Image (Hidden on mobile) */}
        <div className="hidden h-[680px] lg:block lg:w-1/2 p-8">
          <img
            src="/onboarding/side-image.png"
            alt="CRM illustration"
            className="h-full w-full object-cover rounded-xl"
          />
        </div>
      </div>
    </>
  );
}
