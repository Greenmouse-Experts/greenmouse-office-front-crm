import type { PropsWithChildren } from "react";

interface PageHeaderProps extends PropsWithChildren {
  title?: string;
  description?: string;
  side?: any;
}

export default function PageHeader(props: PageHeaderProps) {
  const {
    title = "Dashboard",
    description = "Welcome back! Here's your system overview.",
  } = props;
  return (
    <div className="flex py-3 md:items-center flex-col md:flex-row gap-2">
      <div>
        <h1 className="text-2xl font-semibold text-base-content">{title}</h1>
        <p className="text    mt-1">{description}</p>
      </div>
      <div className="flex gap-2 md:*:w-auto w-full md:flex-row *:flex-1   md:w-fit md:ml-auto">
        {props.children}
      </div>
    </div>
  );
}
