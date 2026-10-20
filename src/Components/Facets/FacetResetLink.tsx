import { ArrowPathIcon } from "@heroicons/react/16/solid";

export interface FacetResetLinkProps {
  /** Title/label for the facet being reset */
  title: string;
  /** Click handler for reset action */
  onReset: () => void;
  /** Text content for the link */
  children?: React.ReactNode;
}

/**
 * FacetResetLink component provides a consistent reset link for facets.
 * Displays a small "reset" link with an arrow icon that clears filter values.
 */
export function FacetResetLink({ title, onReset, children }: FacetResetLinkProps) {
  const linkText = children || "reset";

  return (
    <a
      href="#"
      className="text-gray-500 font-normal text-[11px] hover:text-gray-700 transition-colors"
      onClick={(e) => {
        e.preventDefault();
        onReset();
      }}
      aria-label={`Reset ${title}`}
    >
      <ArrowPathIcon className="h-2.5 w-2.5 inline-block mr-0.5" />
      {linkText}
    </a>
  );
}
