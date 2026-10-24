import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export interface BodyNoticeProps extends Omit<ComponentProps<"div">, "children"> {
  /** What the view did to the body. */
  children: ReactNode;
  /** Controls acting on that, such as buttons. */
  actions?: ReactNode;
}

/** A bar above a body telling the reader it is not shown as captured. */
export function BodyNotice({ children, actions, className, ...props }: BodyNoticeProps) {
  return (
    <div
      className={twMerge(
        "flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900",
        className,
      )}
      {...props}
    >
      <p role="status">{children}</p>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
