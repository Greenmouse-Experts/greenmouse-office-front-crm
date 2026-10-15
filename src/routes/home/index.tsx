import { createFileRoute } from "@tanstack/react-router";
import HomeNav from "./-components/HomeNav";

export const Route = createFileRoute("/home/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-base-100">
      <HomeNav />
      <main className="container mx-auto py-20 text-center">
        <h1 className="text-5xl font-semibold tracking-tight mb-6">
          Management made{" "}
          <span className="text-primary italic underline decoration-wavy decoration-base-300">
            effortless.
          </span>
        </h1>
        <p className="text-xl opacity-70 max-w-2xl mx-auto mb-10">
          The all-in-one business suite for modern teams. Streamline your
          workflow, track your growth, and manage your customers with
          CRMgreenmouse.
        </p>
        <div className="flex justify-center gap-4">
          <button className="btn btn-primary btn-lg px-10">
            Start Free Trial
          </button>
          <button className="btn btn-outline btn-lg px-10">Watch Demo</button>
        </div>
      </main>
    </div>
  );
}
