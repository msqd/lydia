import { TabPanel as HeadlessTabPanel, Tab, TabGroup, TabList, TabPanels } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { type ComponentProps, type FC, Fragment, type ReactNode, useState } from "react";
import { twMerge } from "tailwind-merge";

// Type for a single tab
export interface TabItem {
  name: string;
  href?: string;
  disabled?: boolean;
  id: string;
}

// Props for the Tabs component
export interface TabsProps
  extends Omit<ComponentProps<typeof TabGroup>, "children" | "defaultIndex" | "selectedIndex"> {
  tabs: TabItem[];
  children?: ReactNode;
  defaultIndex?: number;
  selectedIndex?: number;
  onChange?: (index: number) => void;
  className?: string;
  tabListClassName?: string;
  tabClassName?: string;
}

// Utility functions
export const Tabs: FC<TabsProps> = ({
  tabs,
  children,
  defaultIndex = 0,
  selectedIndex,
  onChange,
  className,
  tabListClassName,
  tabClassName,
  ...otherProps
}) => {
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const isControlled = selectedIndex !== undefined;
  const currentIndex = isControlled ? selectedIndex : internalIndex;

  const handleChange = (index: number) => {
    if (!isControlled) setInternalIndex(index);
    onChange?.(index);
  };

  return (
    <div className={twMerge("w-full max-w-3xl mx-auto", className)}>
      <TabGroup selectedIndex={currentIndex} onChange={handleChange} {...otherProps}>
        {/* Mobile view with dropdown */}
        <div className="grid grid-cols-1 sm:hidden">
          <div className="relative">
            <select
              aria-label="Select a tab"
              className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600 focus-visible:outline-primary-600 focus:outline-none"
              value={currentIndex}
              onChange={(e) => handleChange(Number(e.target.value))}
            >
              {tabs.map((tab, index) => (
                <option key={tab.id} value={index} disabled={tab.disabled}>
                  {tab.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-5 fill-gray-500"
            />
          </div>
        </div>

        {/* Desktop view with tabs */}
        <div className="hidden sm:block">
          <TabList
            className={twMerge(
              "border-b border-gray-200 -mb-px flex space-x-8 w-full justify-center",
              tabListClassName,
            )}
          >
            {tabs.map((tab) => (
              <Tab key={tab.id} disabled={tab.disabled} as={Fragment}>
                {({ selected }) => (
                  <a
                    href={tab.href || "#"}
                    className={twMerge(
                      selected
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                      tab.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                      "border-b-2 px-4 py-4 text-sm font-medium whitespace-nowrap min-w-[100px] text-center outline-none focus-visible:outline-2 focus-visible:outline-primary-600",
                      tabClassName,
                    )}
                    aria-disabled={tab.disabled}
                  >
                    {tab.name}
                  </a>
                )}
              </Tab>
            ))}
          </TabList>
        </div>

        {/* Tab content */}
        {children && <TabPanels className="mt-4">{children}</TabPanels>}
      </TabGroup>
    </div>
  );
};

// Component for tab content
export interface TabPanelProps extends ComponentProps<typeof HeadlessTabPanel> {
  children: ReactNode;
  className?: string;
}

export const TabPanel: FC<TabPanelProps> = ({ children, className, ...props }) => {
  return (
    <HeadlessTabPanel className={className} {...props}>
      {children}
    </HeadlessTabPanel>
  );
};
