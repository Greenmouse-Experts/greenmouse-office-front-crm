import type { PropsWithChildren, ReactNode } from "react";
import type { JSX } from "react/jsx-runtime";

interface ContainerProps extends PropsWithChildren {
  title?: string | ReactNode;
  actions?: ReactNode | JSX.Element | any;
  fade?: boolean;
}

export default function SimpleContainer(props: ContainerProps) {
  return (
    <div className="">
      <div className="  ring ring-current/20 rounded-t-box flex h-14 bg-base-100 items-center px-4">
        <h2
          className={`text-lg font-semibold  ${props.fade ? "text-current/80" : ""}`}
        >
          {props.title || "Title"}
        </h2>{" "}
        <div className=""></div>
        <div
          className="ml-auto
          "
        >
          {props.actions}
        </div>
      </div>
      <div className="bg-base-200  space-y-4 rounded-box ">
        {props.children}
      </div>
    </div>
  );
}
