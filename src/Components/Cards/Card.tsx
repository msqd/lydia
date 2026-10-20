import { type ComponentProps, type FunctionComponent, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export interface CardProps extends ComponentProps<"div"> {
  /**
   * Determines if the card has default padding for its content area.
   */
  hasDefaultPadding?: boolean;

  /**
   * Determines if the card has the default shadow and rounding styles.
   */
  hasDefaultShadowAndRounding?: boolean;

  /**
   * Optional custom CSS classes for the inner content `div`.
   */
  contentClassName?: string;

  /**
   * Optional header content for the card.
   */
  header?: ReactNode;

  /**
   * Optional custom CSS classes for the header `div`.
   */
  headerClassName?: string;

  /**
   * Optional footer content for the card.
   */
  footer?: ReactNode;

  /**
   * Optional custom CSS classes for the footer `div`.
   */
  footerClassName?: string;
}

// Styles for the outer div
const outerBaseClassName = "overflow-hidden bg-white ring-1 ring-gray-200 ";
const outerRoundingClassName = " sm:rounded-sm ";

// Padding classes for different card sections
const headerPaddingClassName = "px-4 py-5 sm:px-6";
const footerPaddingClassName = "px-4 py-4 sm:px-6";

/**
 * Padding of a card's content area. Exported because panels that sit inside a card, or beside one,
 * have to agree with it: three places hardcoded this same string, so a change to card padding would
 * have moved one of them and left the others behind.
 */
export const contentPaddingClassName = "px-4 py-5 sm:p-6";

// Divider class for separating sections
const dividerClassName = "divide-y divide-gray-200";

export const Card: FunctionComponent<CardProps> = ({
  children,
  hasDefaultPadding = true,
  hasDefaultShadowAndRounding: hasDefaultRounding = true,
  className,
  contentClassName,
  header,
  headerClassName,
  footer,
  footerClassName,
  ...moreProps
}) => {
  const outerDivClasses = twMerge(
    outerBaseClassName,
    hasDefaultRounding ? outerRoundingClassName : "",
    header || footer ? dividerClassName : "",
    className,
  );

  const innerDivClasses = twMerge(hasDefaultPadding ? contentPaddingClassName : "", contentClassName);

  const headerDivClasses = twMerge(headerPaddingClassName, headerClassName);

  const footerDivClasses = twMerge(footerPaddingClassName, footerClassName);

  return (
    <div className={outerDivClasses} {...moreProps}>
      {header && <div className={headerDivClasses}>{header}</div>}
      <div className={innerDivClasses}>{children}</div>
      {footer && <div className={footerDivClasses}>{footer}</div>}
    </div>
  );
};
