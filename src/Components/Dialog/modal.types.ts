import type { Dialog as HeadlessDialog } from "@headlessui/react";
import type { ReactNode } from "react";
import type { ComponentProps } from "react";

/**
 * Shared base interface for Dialog and Drawer components
 * to ensure consistent API and behavior across modal components.
 */
export interface BaseModalProps extends Omit<ComponentProps<typeof HeadlessDialog>, "className" | "initialFocus"> {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when the modal is closed */
  onClose: () => void;
  /** Optional title for the modal */
  title?: string;
  /** Optional description for the modal */
  description?: string;
  /** Modal content */
  children?: ReactNode;
  /** Additional CSS classes for the modal container */
  className?: string;
  /** Additional CSS classes for the modal content */
  contentClassName?: string;
  /** Additional CSS classes for the title */
  titleClassName?: string;
  /** Additional CSS classes for the description */
  descriptionClassName?: string;
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Element to focus when the modal opens (defaults to true) */
  initialFocus?: React.RefObject<HTMLElement> | boolean;
  /**
   * Whether to show backdrop with click-to-close and scroll blocking.
   * When true: backdrop is shown, clicking it closes modal, background scroll is blocked.
   * When false: no backdrop, modal can only be closed programmatically or via close button, background is interactive.
   */
  backdrop?: boolean;
}

/**
 * Size options for modal components based on viewport width percentages
 */
export type ModalSize = "sm" | "md" | "lg";

/**
 * Position options for drawer components
 */
export type DrawerPosition = "left" | "right";
