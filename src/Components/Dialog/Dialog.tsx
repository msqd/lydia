import {
  DialogBackdrop,
  DialogPanel,
  Dialog as HeadlessDialog,
  DialogDescription as HeadlessDialogDescription,
  DialogTitle as HeadlessDialogTitle,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { type BaseModalProps, type ModalSize, modalSizeClasses } from "./modal.types";

export type DialogSize = ModalSize;

export interface DialogProps extends BaseModalProps {
  size?: DialogSize;
}

/**
 * Dialog component for displaying modal dialogs and popovers.
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>
 *
 * <Dialog
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirmation"
 *   description="Are you sure you want to continue with this action?"
 * >
 *   <div className="mt-4 flex justify-end space-x-2">
 *     <Button variant="secondary" onClick={() => setIsOpen(false)}>
 *       Cancel
 *     </Button>
 *     <Button onClick={() => {
 *       // Perform action
 *       setIsOpen(false);
 *     }}>
 *       Confirm
 *     </Button>
 *   </div>
 * </Dialog>
 * ```
 */
export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  className,
  contentClassName,
  titleClassName,
  descriptionClassName,
  showCloseButton = true,
  initialFocus = true,
  backdrop = true,
  ...props
}: DialogProps) {
  const handleClose = backdrop ? onClose : () => {};

  return (
    <HeadlessDialog
      transition
      as="div"
      open={isOpen}
      className={twMerge("relative z-10 transition duration-100 data-[closed]:opacity-0", className)}
      onClose={handleClose}
      initialFocus={typeof initialFocus === "boolean" ? undefined : initialFocus}
      {...props}
    >
      {/* Background overlay - only show when backdrop is enabled */}
      {backdrop && <DialogBackdrop className="fixed inset-0 bg-black/25 backdrop-blur-sm" />}

      {/* Dialog position wrapper */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <DialogPanel
            transition
            className={twMerge(
              "w-full transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0",
              modalSizeClasses[size],
              contentClassName,
            )}
          >
            {/* Close button */}
            {showCloseButton && (
              <div className="absolute top-4 right-4">
                <button
                  type="button"
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                  onClick={onClose}
                  aria-label="Close dialog"
                >
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            )}

            {/* Dialog Title */}
            {title && (
              <HeadlessDialogTitle
                as="h3"
                className={twMerge("text-lg font-semibold leading-6 text-gray-900", titleClassName)}
              >
                {title}
              </HeadlessDialogTitle>
            )}

            {/* Dialog Description */}
            {description && (
              <HeadlessDialogDescription className={twMerge("mt-2 text-sm text-gray-500", descriptionClassName)}>
                {description}
              </HeadlessDialogDescription>
            )}

            {/* Dialog Content */}
            {children}
          </DialogPanel>
        </div>
      </div>
    </HeadlessDialog>
  );
}

/**
 * Dialog.Title component for creating accessible dialog titles.
 * Use this when you need more customization than the basic title prop.
 */
export function DialogTitle({ className, ...props }: ComponentProps<typeof HeadlessDialogTitle>) {
  return (
    <HeadlessDialogTitle className={twMerge("text-lg font-semibold leading-6 text-gray-900", className)} {...props} />
  );
}

/**
 * Dialog.Description component for creating accessible dialog descriptions.
 * Use this when you need more customization than the basic description prop.
 */
export function DialogDescription({ className, ...props }: ComponentProps<typeof HeadlessDialogDescription>) {
  return <HeadlessDialogDescription className={twMerge("mt-2 text-sm text-gray-500", className)} {...props} />;
}
