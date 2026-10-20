import { Dialog as HeadlessDialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useScrollLock } from "@msqd/lydia/Components/Utilities/useScrollLock";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import type { BaseModalProps, DrawerPosition, ModalSize } from "./modal.types";

export type DrawerSize = ModalSize;

export interface DrawerProps extends BaseModalProps {
  size?: DrawerSize;
  position?: DrawerPosition;
}

const sizeClasses: Record<DrawerSize, string> = {
  sm: "max-w-[30vw]",
  md: "max-w-[55vw]",
  lg: "max-w-[80vw]",
};

const positionClasses: Record<
  DrawerPosition,
  { container: string; panel: string; transform: { closed: string; open: string } }
> = {
  right: {
    container: "inset-y-0 right-0",
    panel: "pointer-events-auto w-screen transform transition duration-100 ease-in-out data-[closed]:translate-x-full",
    transform: {
      closed: "translate-x-full",
      open: "translate-x-0",
    },
  },
  left: {
    container: "inset-y-0 left-0",
    panel: "pointer-events-auto w-screen transform transition duration-100 ease-in-out data-[closed]:-translate-x-full",
    transform: {
      closed: "-translate-x-full",
      open: "translate-x-0",
    },
  },
};

/**
 * Drawer component for displaying slide-out panels from the side of the screen.
 * Shares similar props interface with Dialog component for consistency.
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
 *
 * <Drawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Settings"
 *   description="Configure your application settings"
 *   position="right"
 *   size="lg"
 * >
 *   <div className="space-y-4">
 *     Your content goes here
 *   </div>
 * </Drawer>
 * ```
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "lg",
  position = "right",
  className,
  contentClassName,
  titleClassName,
  descriptionClassName,
  showCloseButton = true,
  initialFocus = true,
  backdrop = true,
  ...props
}: DrawerProps) {
  const positionConfig = positionClasses[position];

  useScrollLock(isOpen, backdrop);

  const handleClose = backdrop ? onClose : () => {};

  if (!backdrop) {
    // When backdrop is false, render without HeadlessDialog to avoid focus trapping and interaction blocking
    return isOpen ? (
      <div className={twMerge("relative z-10", className)}>
        {/* Drawer container - positioned only where needed */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={twMerge("pointer-events-none fixed flex max-w-full", positionConfig.container)}>
              <div className={twMerge(positionConfig.panel, sizeClasses[size], contentClassName)}>
                <div className="flex h-full flex-col bg-white shadow-xl relative" data-drawer-content>
                  {/* Scrollable content area */}
                  <div className="flex-1 overflow-y-auto py-6">
                    {/* Header with title and close button */}
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Drawer Title */}
                          {title && (
                            <h3 className={twMerge("text-base font-semibold text-gray-900", titleClassName)}>
                              {title}
                            </h3>
                          )}

                          {/* Drawer Description */}
                          {description && (
                            <p className={twMerge("mt-1 text-sm text-gray-500", descriptionClassName)}>{description}</p>
                          )}
                        </div>

                        {/* Close button */}
                        {showCloseButton && (
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              onClick={onClose}
                              className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none cursor-pointer"
                              aria-label="Close drawer"
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Drawer Content */}
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">{children}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : null;
  }

  // When backdrop is true, use HeadlessDialog for proper modal behavior
  return (
    <HeadlessDialog
      open={isOpen}
      onClose={handleClose}
      className={twMerge("relative z-10", className)}
      initialFocus={typeof initialFocus === "boolean" ? undefined : initialFocus}
      {...props}
    >
      {/* Fixed background overlay - only show when backdrop is enabled */}
      {backdrop && <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />}

      {/* Drawer container */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className={twMerge("pointer-events-none fixed flex max-w-full", positionConfig.container)}>
            <HeadlessDialog.Panel
              transition
              className={twMerge(positionConfig.panel, sizeClasses[size], contentClassName)}
            >
              <div className="flex h-full flex-col bg-white shadow-xl relative" data-drawer-content>
                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto py-6">
                  {/* Header with title and close button */}
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Drawer Title */}
                        {title && (
                          <HeadlessDialog.Title
                            className={twMerge("text-base font-semibold text-gray-900", titleClassName)}
                          >
                            {title}
                          </HeadlessDialog.Title>
                        )}

                        {/* Drawer Description */}
                        {description && (
                          <HeadlessDialog.Description
                            className={twMerge("mt-1 text-sm text-gray-500", descriptionClassName)}
                          >
                            {description}
                          </HeadlessDialog.Description>
                        )}
                      </div>

                      {/* Close button */}
                      {showCloseButton && (
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            onClick={onClose}
                            className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none cursor-pointer"
                            aria-label="Close drawer"
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Drawer Content */}
                  <div className="relative mt-6 flex-1 px-4 sm:px-6">{children}</div>
                </div>
              </div>
            </HeadlessDialog.Panel>
          </div>
        </div>
      </div>
    </HeadlessDialog>
  );
}

/**
 * Drawer.Title component for creating accessible drawer titles.
 * Use this when you need more customization than the basic title prop.
 */
export function DrawerTitle({ className, ...props }: ComponentProps<typeof HeadlessDialog.Title>) {
  return <HeadlessDialog.Title className={twMerge("text-base font-semibold text-gray-900", className)} {...props} />;
}

/**
 * Drawer.Description component for creating accessible drawer descriptions.
 * Use this when you need more customization than the basic description prop.
 */
export function DrawerDescription({ className, ...props }: ComponentProps<typeof HeadlessDialog.Description>) {
  return <HeadlessDialog.Description className={twMerge("mt-1 text-sm text-gray-500", className)} {...props} />;
}
