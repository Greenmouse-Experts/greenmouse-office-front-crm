import type { PropsWithChildren } from "react";

interface FormWrapperProps extends PropsWithChildren {
  title?: string;
  className?: string;
}

export default function FormWrapper(props: FormWrapperProps) {
  const { title = "Title" } = props;
  return (
    <div
      className={`space-y-2 p-4 py-6 ring rounded-box ring-current/10 shadow-md ${props.className}`}
    >
      <h2 className="fieldset-label divider divider-start text-lg mb-4 font-semibold opacity-80">
        {title}
      </h2>
      <section className=" space-y-4 ">{props.children}</section>
    </div>
  );
}
