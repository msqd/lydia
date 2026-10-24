import { type ComponentProps, type ReactNode, createContext, useContext } from "react";
import { twMerge } from "tailwind-merge";

export type HeadingLevelNumber = 1 | 2 | 3 | 4 | 5 | 6;

const SectionLevel = createContext<HeadingLevelNumber | undefined>(undefined);

/**
 * Says which heading level heads the section it wraps, so the headings inside
 * go one level below it.
 *
 * A component dropped into a page cannot know the page's outline: a facet card
 * headed `h3` and a detail page headed `h1` need their foldables at `h4` and
 * `h2`. The section around them knows, and says so once, rather than every
 * consumer threading a level through every component (WCAG 1.3.1, axe
 * `heading-order`).
 */
export interface HeadingLevelProps {
  level: HeadingLevelNumber;
  children: ReactNode;
}

export function HeadingLevel({ level, children }: HeadingLevelProps) {
  return <SectionLevel.Provider value={level}>{children}</SectionLevel.Provider>;
}

/**
 * The level for a heading inside the current section: one below it, never past
 * `h6`, or `fallback` outside any section.
 */
export function useSubheadingLevel(fallback: HeadingLevelNumber): HeadingLevelNumber {
  const section = useContext(SectionLevel);
  return section === undefined ? fallback : (Math.min(section + 1, 6) as HeadingLevelNumber);
}

export interface SubheadingProps extends ComponentProps<"h4"> {
  /** The level outside any `HeadingLevel`. */
  fallback?: HeadingLevelNumber;
}

/** A heading one level below the section it sits in. */
export function Subheading({ fallback = 4, className, ...props }: SubheadingProps) {
  const Tag = `h${useSubheadingLevel(fallback)}` as const;
  return <Tag className={twMerge(className)} {...props} />;
}
