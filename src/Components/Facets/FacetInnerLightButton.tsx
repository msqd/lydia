export interface FacetInnerLightButtonProps {
  /** Button label text */
  label: string;
  /** Click handler function */
  handler: () => void;
}

/**
 * FacetInnerLightButton component for action buttons inside facet labels.
 * Based on HARP's FacetInnerLightButton implementation.
 */
export function FacetInnerLightButton({ label, handler }: FacetInnerLightButtonProps) {
  return (
    <button
      className="text-gray-500 mx-1 font-normal text-xs hover:text-gray-700 transition-colors cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handler();
      }}
      type="button"
    >
      {label}
    </button>
  );
}
