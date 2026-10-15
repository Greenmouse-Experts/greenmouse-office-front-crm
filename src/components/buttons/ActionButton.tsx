import {
  type ButtonHTMLAttributes,
  type PropsWithChildren,
  forwardRef,
} from "react";

interface ActionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    PropsWithChildren {
  title?: string; // Made title optional as children can also provide content
}

const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ title, onClick, children, ...props }, ref) => {
    return (
      <button
        className={"btn btn-primary " + props.className}
        ref={ref}
        onClick={onClick}
        {...props}
      >
        {children || title}
      </button>
    );
  },
);

ActionButton.displayName = "ActionButton";

export default ActionButton;
