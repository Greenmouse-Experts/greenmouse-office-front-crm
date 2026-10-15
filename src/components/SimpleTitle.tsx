import { forwardRef, type PropsWithChildren } from "react";
import { ArrowLeft } from "lucide-react";

const SimpleTitle = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{ title?: string | Element | any; backBtn?: boolean }>
>(({ title = "Title", children, backBtn = true }, ref) => {
  return (
    <>
      {backBtn && (
        <button
          onClick={() => {
            window.history.back();
          }}
          className="btn btn-accent btn-sm from-accent bg-linear-30 to-primary/10"
        >
          <span>
            <ArrowLeft className="!size-4" />
          </span>
          Go Back
        </button>
      )}
      <div className="flex items-center gap-2 flex-1    ">
        <div
          ref={ref}
          className="text-xl flex-1 font-semibold  divider divider-start"
        >
          {title}
        </div>
        <div className="">{children}</div>
      </div>
    </>
  );
});

export default SimpleTitle;
