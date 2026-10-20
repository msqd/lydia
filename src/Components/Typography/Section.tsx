import type { ComponentProps, FunctionComponent } from "react";
import { twMerge } from "tailwind-merge";

export interface SectionProps extends ComponentProps<"section"> {
  /**
   * Additional classes to apply to the section
   */
  className?: string;
}

const baseClassName = "mb-6";

export const Section: FunctionComponent<SectionProps> = ({ className, ...props }) => {
  return <section className={twMerge(baseClassName, className)} {...props} />;
};
