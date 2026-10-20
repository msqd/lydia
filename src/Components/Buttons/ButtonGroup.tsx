import type { ComponentProps, FunctionComponent } from "react";
import { twMerge } from "tailwind-merge";
import { Button, type ButtonProps as GenericButtonProps } from "./Button";

interface ButtonProp {
  key: string;
  title: string;
}

export type ButtonGroupButtons = Array<ButtonProp>;

interface StyledButtonProps extends GenericButtonProps {
  isCurrent: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

const StyledButton: FunctionComponent<StyledButtonProps> = ({
  isCurrent,
  isFirst,
  isLast,
  className: incomingClassName,
  ...props
}) => {
  const baseStyling = "relative inline-flex items-center focus:z-10 px-3 py-2";

  let positionalStyling = "rounded-none";
  if (!isFirst) {
    positionalStyling += " -ml-px";
  }
  if (isFirst) {
    positionalStyling += " rounded-l-sm";
  }
  if (isLast) {
    positionalStyling += " rounded-r-sm";
  }

  // Use primary button styles for the current (selected) button
  // Ensure hover state does not change appearance and ring matches primary button
  const currentSpecificClasses =
    "text-white bg-blue-600 hover:bg-blue-600 focus-visible:outline-blue-500 ring-1 ring-inset ring-blue-700";
  // Ensure the ring is consistent with the primary button's ring and hover is static

  const defaultSpecificClasses = ""; // Non-current buttons use the Button's secondary variant styling by default

  const combinedClassName = twMerge(
    baseStyling,
    positionalStyling,
    isCurrent ? currentSpecificClasses : defaultSpecificClasses,
    incomingClassName,
  );

  return (
    <Button
      variant={isCurrent ? "primary" : "secondary"} // Dynamically set variant
      className={combinedClassName}
      {...props}
    />
  );
};

interface ButtonGroupProps extends ComponentProps<"span"> {
  buttonProps: ButtonGroupButtons;
  current: string;
  setCurrent: (current: string) => void;
}

export const ButtonGroup: FunctionComponent<ButtonGroupProps> = ({
  buttonProps,
  current,
  setCurrent,
  className: incomingSpanClassName,
  ...moreProps
}) => {
  return (
    <span
      role="group"
      className={twMerge("isolate inline-flex rounded-md shadow-xs", incomingSpanClassName)}
      {...moreProps}
    >
      {buttonProps.map((buttonProp, index) => {
        const { key, title } = buttonProp;
        const isCurrent = key === current;
        const isFirst = index === 0;
        const isLast = index === buttonProps.length - 1;
        return (
          <StyledButton
            onClick={() => {
              setCurrent(key);
            }}
            key={key}
            type="button"
            isCurrent={isCurrent}
            isFirst={isFirst}
            isLast={isLast}
          >
            {title}
          </StyledButton>
        );
      })}
    </span>
  );
};
