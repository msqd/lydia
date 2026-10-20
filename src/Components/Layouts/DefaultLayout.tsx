import { NavBar, type NavBarProps } from "@msqd/lydia/Components/NavBar";
import { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export interface DefaultLayoutProps {
  /**
   * The content to be rendered inside the layout
   */
  children: ReactNode;

  /**
   * Props to be passed to the NavBar component
   */
  navBarProps?: NavBarProps;

  /**
   * Additional CSS classes for the main content area
   */
  contentClassName?: string;

  /**
   * The page's title, drawn as its one `h1` in a header band above the
   * content. Without it there is no band, and the page says its own title.
   */
  title?: ReactNode;

  /**
   * What the page is holding and what acts on it, beside the title. Wraps at
   * narrow widths rather than running off the edge (WCAG 1.4.10).
   */
  toolbar?: ReactNode;
}

/**
 * Default layout with a navbar at the top and a content area
 */
export function DefaultLayout({
  children,
  navBarProps,
  contentClassName = "p-4 sm:p-6 lg:p-8",
  title,
  toolbar,
}: DefaultLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <NavBar {...navBarProps} />

      {/* Main content */}
      <main className={twMerge("flex-grow", contentClassName)}>
        {/*
          A `div` and not a `header`: inside `main` a `header` has no landmark
          role anyway, and spelling it `div` keeps anyone from moving it out
          beside the NavBar and making a second banner.
        */}
        {title === undefined ? null : (
          <div className="flex flex-wrap items-baseline gap-3 border-b border-gray-200 bg-white px-4 py-3">
            <h1 className="text-base font-semibold">{title}</h1>
            {toolbar === undefined ? null : (
              <div className="ml-auto flex flex-wrap items-center justify-end gap-3 text-xs text-gray-500">
                {toolbar}
              </div>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
