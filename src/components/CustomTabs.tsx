import type { Tab, useTabs } from "@/stores/client";

export default function CustomTabs({
  tabs,
  tabProps,
}: {
  tabs: Tab[];
  tabProps?: ReturnType<typeof useTabs>;
}) {
  return (
    <ul role="tablist" className="menu menu-horizontal bg-base-100 rounded-box space-x-1 flex-nowrap">
      {tabs.map((t) => (
        <li role="presentation" key={t.name}>
          <button
            type="button"
            role="tab"
            aria-selected={tabProps?.tab.name === t.name}
            className={tabProps?.tab.name === t.name ? "menu-active" : ""}
            onClick={() => tabProps?.setTab(t)}
          >
            {t.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
