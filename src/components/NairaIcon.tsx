import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";

export const NairaIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, strokeWidth = 2, className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        {/* N shape */}
        <path d="M6 20V4l12 16V4" />
        {/* Dual crossbars */}
        <path d="M4 10h16" />
        <path d="M4 14h16" />
      </svg>
    );
  },
);

NairaIcon.displayName = "NairaIcon";

export { NairaIcon as Naira };
export default NairaIcon;
