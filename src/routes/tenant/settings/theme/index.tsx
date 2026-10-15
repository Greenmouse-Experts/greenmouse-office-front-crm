import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tenant/settings/theme/")({
  component: RouteComponent,
});

function RouteComponent() {
  const themes = ["light", "dark", "halloween", "garden", "pastel"];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Theme Settings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {themes.map((theme) => (
          <div
            key={theme}
            data-theme={theme}
            className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow duration-200"
            onClick={() =>
              document.documentElement.setAttribute("data-theme", theme)
            }
          >
            <div className="card-body p-4">
              <h3 className="card-title text-lg capitalize">{theme}</h3>
              <div className="grid grid-cols-5 gap-1 mt-2">
                <div className="bg-primary w-full h-6 rounded"></div>
                <div className="bg-secondary w-full h-6 rounded"></div>
                <div className="bg-accent w-full h-6 rounded"></div>
                <div className="bg-neutral w-full h-6 rounded"></div>
                <div className="bg-base-100 w-full h-6 rounded border border-base-content/20"></div>
              </div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="text-base-content">Text</span>
                <button className="btn btn-sm btn-primary">Button</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
