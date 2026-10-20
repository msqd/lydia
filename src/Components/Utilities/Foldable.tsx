import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { H5 } from "@msqd/lydia/Components/Typography";
import { HeadingLevel, useSubheadingLevel } from "@msqd/lydia/Components/Typography/HeadingLevel";
import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export interface FoldableProps extends Omit<ComponentProps<"div">, "title"> {
  /**
   * Whether the foldable is open by default
   */
  defaultOpen?: boolean;
  /**
   * Title of the foldable section
   */
  title: ReactNode;
  /**
   * Optional action element to display next to the title (like reset button)
   */
  titleAction?: ReactNode;
  /**
   * Optional subtitle below the title
   */
  subtitle?: ReactNode;
  /**
   * Content to display when expanded
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the container
   */
  className?: string;
  /**
   * Where the title sits in the document outline, if that is not `h5`.
   *
   * A `Foldable` is dropped into a page it does not own, so only the consumer knows which heading
   * precedes it. Fixed at `h5`, a rail headed `h2` produces `h2` then `h5`, which skips two levels
   * and fails WCAG 1.3.1 -- and there was nothing the consumer could pass to fix it.
   *
   * The title's size does not move with it.
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * A foldable component that uses Disclosure from headlessui to manage expand/collapse state.
 * Ideal for use as full-width subpanes within cards or other containers.
 */
export function Foldable({
  defaultOpen = true,
  title,
  titleAction,
  subtitle,
  children,
  className,
  headingLevel,
  ...props
}: FoldableProps) {
  // Its own level if given, else one below the section it sits in, else h5.
  const sectionLevel = useSubheadingLevel(5);
  const level = headingLevel ?? sectionLevel;

  return (
    <Disclosure defaultOpen={defaultOpen}>
      {({ open }) => (
        <div className={twMerge("px-4 py-3 relative", className)} {...props}>
          <div className="flex w-full items-start">
            {/*
              The button inside the heading, as the WAI disclosure pattern has
              it: a button's content is phrasing content, so the heading cannot
              go inside it.
            */}
            <H5 level={level} padding="pt-0" className="flex min-w-0 grow whitespace-nowrap font-normal">
              <Disclosure.Button
                className={twMerge("flex w-full items-start text-left", children ? "cursor-pointer" : "cursor-default")}
                disabled={!children}
              >
                <span className="grow truncate font-semibold">{title}</span>

                {/* Control to fold/unfold the content */}
                {children &&
                  (open ? (
                    <ChevronUpIcon className="h-4 w-4 min-w-4 text-gray-600" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 min-w-4 text-gray-600" />
                  ))}
              </Disclosure.Button>
            </H5>

            {/*
              Beside the button and never inside it: a link in a button is two
              controls announced as one (WCAG 4.1.2, axe `nested-interactive`),
              and outside it a click needs no guard against folding the section.
            */}
            {titleAction && <div className="ml-2 shrink-0 leading-5">{titleAction}</div>}
          </div>

          {/* Subtitle */}
          {subtitle && <div className="mt-1">{subtitle}</div>}

          {/* Foldable content */}
          {children && (
            <Disclosure.Panel className="mt-2 space-y-2">
              <HeadingLevel level={level}>{children}</HeadingLevel>
            </Disclosure.Panel>
          )}
        </div>
      )}
    </Disclosure>
  );
}
