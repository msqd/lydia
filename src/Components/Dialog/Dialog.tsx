import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useScrollLock } from "@msqd/lydia/Components/Utilities/useScrollLock";
import { Fragment } from "react";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import type { BaseModalProps, ModalSize } from "./modal.types";

export type DialogSize = ModalSize;

export interface DialogProps extends BaseModalProps {
  size?: DialogSize;
}

const sizeClasses: Record<DialogSize, string> = {
  sm: "max-w-[30vw]",
  md: "max-w-[55vw]",
  lg: "max-w-[80vw]",
};

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
  useScrollLock(isOpen, backdrop);

  const handleClose = backdrop ? onClose : () => {};

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <HeadlessDialog
        as="div"
        className={twMerge("relative z-10", className)}
        onClose={handleClose}
        initialFocus={typeof initialFocus === "boolean" ? undefined : initialFocus}
        {...props}
      >
        {/* Background overlay - only show when backdrop is enabled */}
        {backdrop && (
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" aria-hidden="true" />
          </Transition.Child>
        )}

        {/* Dialog position wrapper */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <HeadlessDialog.Panel
                className={twMerge(
                  "w-full transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all",
                  sizeClasses[size],
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
                  <HeadlessDialog.Title
                    as="h3"
                    className={twMerge("text-lg font-semibold leading-6 text-gray-900", titleClassName)}
                  >
                    {title}
                  </HeadlessDialog.Title>
                )}

                {/* Dialog Description */}
                {description && (
                  <HeadlessDialog.Description className={twMerge("mt-2 text-sm text-gray-500", descriptionClassName)}>
                    {description}
                  </HeadlessDialog.Description>
                )}

                {/* Dialog Content */}
                {children}
              </HeadlessDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}

/**
 * Dialog.Title component for creating accessible dialog titles.
 * Use this when you need more customization than the basic title prop.
 */
export function DialogTitle({ className, ...props }: ComponentProps<typeof HeadlessDialog.Title>) {
  return (
    <HeadlessDialog.Title className={twMerge("text-lg font-semibold leading-6 text-gray-900", className)} {...props} />
  );
}

/**
 * Dialog.Description component for creating accessible dialog descriptions.
 * Use this when you need more customization than the basic description prop.
 */
export function DialogDescription({ className, ...props }: ComponentProps<typeof HeadlessDialog.Description>) {
  return <HeadlessDialog.Description className={twMerge("mt-2 text-sm text-gray-500", className)} {...props} />;
}
