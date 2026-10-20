import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, Cog6ToothIcon, XMarkIcon } from "@heroicons/react/24/outline";
import lydiaLogoSvg from "./Assets/lydia-logo.svg";
import lydiaLogotypeSvg from "./Assets/lydia-logotype.svg";
import { DefaultAvatar } from "./Assets/defaultAvatar";

/**
 * Default component for the logo (icon only)
 */
export const DefaultLogo = ({ alt = "lydia" }: { alt?: string }) => {
  return <img alt={alt} src={lydiaLogoSvg} className="h-8 w-auto" />;
};

/**
 * lydia logotype component (text logo)
 */
export const LydiaLogotype = () => {
  return <img src={lydiaLogotypeSvg} alt="lydia" className="h-8 w-auto ml-2" />;
};

/**
 * Default component for the brand
 */
export const DefaultBrand = ({ text = "lydia" }: { text?: string }) => {
  return typeof text === "string" ? (
    <span className="ml-2 text-white text-xl font-semibold">{text}</span>
  ) : (
    <LydiaLogotype />
  );
};

export interface User {
  name: string;
  email: string;
  avatar?: React.ReactNode;
}

const defaultNavigation = [
  { name: "Overview", href: "#", current: true },
  { name: "Journal", href: "#", current: false },
  { name: "Explorer", href: "#", current: false },
  { name: "Editor", href: "#", current: false },
  { name: "Alerts", href: "#", current: false },
  { name: "System", href: "#", current: false },
];

const defaultUserNavigation = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "#" },
  { name: "Sign out", href: "#" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

// Default link component that uses standard anchor tags
const DefaultLink = ({
  href,
  ...props
}: { href: string; className?: string; children: React.ReactNode; "aria-current"?: "page" | undefined }) => (
  <a href={href} {...props} />
);

export interface NavigationItem {
  name: string;
  href: string;
  current?: boolean;
  onClick?: () => void;
}

export interface NavBarProps {
  navigation?: NavigationItem[];
  userNavigation?: NavigationItem[];
  /**
   * The signed-in user. Omit it for a signed-out bar: no identity, no avatar and no user menu.
   * The library never invents a user, since a placeholder identity is indistinguishable from a
   * real one to a consumer that has not built authentication yet.
   */
  user?: User;
  /**
   * Logo to display. Can be a string (for the alt attribute) or a ReactNode.
   * By default, uses the DefaultLogo component
   */
  logo?: React.ReactNode;
  /**
   * Brand to display next to the logo. Can be a string or a ReactNode.
   * By default, uses the DefaultBrand component
   */
  brand?: React.ReactNode;
  /**
   * What the settings control opens. Omit it and no cog is drawn: the bar has no settings of its
   * own to show, and a control that names itself and does nothing is indistinguishable from a
   * working one to whoever reaches for it - the same argument this component already makes about
   * inventing a user.
   */
  onSettings?: () => void;

  /**
   * Custom Link component to use for navigation items.
   * By default, uses standard anchor tags
   */
  linkComponent?: React.ComponentType<{
    href: string;
    className?: string;
    children: React.ReactNode;
    "aria-current"?: "page" | undefined;
  }>;
}

export function NavBar({
  navigation = defaultNavigation,
  userNavigation = defaultUserNavigation,
  user,
  logo,
  brand,
  onSettings,
  linkComponent: LinkComponent = DefaultLink,
}: NavBarProps) {
  /*
   * Whether the mobile panel has anything in it.
   *
   * The panel holds the navigation, and the user's name, email and menu. With
   * neither there is nothing to open, and a button announcing "Open main menu"
   * that opens an empty panel is the same defect this component already
   * refuses for `user` and for `onSettings`: a control that names itself and
   * does nothing is indistinguishable from a working one to whoever reaches
   * for it.
   *
   * A single-screen consumer passing `navigation={[]}` is the case that meets
   * it, and that is a supported way to use this bar rather than a misuse.
   */
  const hasMenu = navigation.length > 0 || Boolean(user);

  return (
    <Disclosure as="nav" data-testid="navbar" className="bg-primary-900 shadow">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {/* Named by the brand it shows (WCAG 2.5.3). */}
            <LinkComponent href="/" className="flex items-center shrink-0 cursor-pointer">
              {/* The mark is decoration: the brand beside it names the link, and
                  an alt saying the brand again was read twice. */}
              <span aria-hidden="true" className="contents">
                {typeof logo === "string" ? <DefaultLogo alt={logo} /> : logo || <DefaultLogo />}
              </span>
              {typeof brand === "string" ? <DefaultBrand text={brand} /> : brand || <DefaultBrand />}
            </LinkComponent>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigation.map((item) => (
                  <LinkComponent
                    key={item.name}
                    href={item.href}
                    aria-current={item.current ? "page" : undefined}
                    className={classNames(
                      item.current ? "bg-primary-500 text-white" : "text-white hover:bg-primary-500/75",
                      "rounded-md px-3 py-2 text-sm font-medium cursor-pointer",
                    )}
                  >
                    {item.name}
                  </LinkComponent>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {onSettings && (
                <button
                  type="button"
                  onClick={onSettings}
                  className="relative rounded-full bg-primary-500 p-1 text-primary-200 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-500 focus:outline-hidden cursor-pointer"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Settings</span>
                  <Cog6ToothIcon aria-hidden="true" className="size-6" />
                </button>
              )}

              {/* Profile dropdown, signed in only */}
              {user && (
                <Menu as="div" className="relative ml-3">
                  <div>
                    <MenuButton className="relative flex max-w-xs items-center rounded-full bg-primary-500 text-sm text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-500 focus:outline-hidden cursor-pointer">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      {user.avatar ?? <DefaultAvatar />}
                    </MenuButton>
                  </div>
                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                  >
                    {userNavigation.map((item) => (
                      <MenuItem key={item.name}>
                        <a
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-500 data-focus:bg-gray-100 data-focus:outline-hidden"
                        >
                          {item.name}
                        </a>
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>
              )}
            </div>
          </div>
          {hasMenu && (
            <div className="-mr-2 flex md:hidden">
              {/* Mobile menu button */}
              <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-primary-500 p-2 text-primary-200 hover:bg-primary-500/75 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-500 focus:outline-hidden">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
                <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
              </DisclosureButton>
            </div>
          )}
        </div>
      </div>

      {hasMenu && (
        <DisclosurePanel className="md:hidden">
          <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
            {navigation.map((item) => (
              <DisclosureButton
                key={item.name}
                as={LinkComponent as any}
                href={item.href}
                aria-current={item.current ? "page" : undefined}
                className={classNames(
                  item.current ? "bg-primary-500 text-white" : "text-white hover:bg-primary-500/75",
                  "block rounded-md px-3 py-2 text-base font-medium cursor-pointer",
                )}
              >
                {item.name}
              </DisclosureButton>
            ))}
          </div>
          {user && (
            <div className="border-t border-primary-500 pt-4 pb-3">
              <div className="flex items-center px-5">
                <div className="shrink-0">{user.avatar ?? <DefaultAvatar className="size-10 rounded-full" />}</div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{user.name}</div>
                  <div className="text-sm font-medium text-primary-300">{user.email}</div>
                </div>
                <div className="ml-auto flex space-x-2">
                  {onSettings && (
                    <button
                      type="button"
                      onClick={onSettings}
                      className="relative shrink-0 rounded-full border-2 border-transparent bg-primary-500 p-1 text-primary-200 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-500 focus:outline-hidden cursor-pointer"
                    >
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Settings</span>
                      <Cog6ToothIcon aria-hidden="true" className="size-6" />
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-3 space-y-1 px-2">
                {userNavigation.map((item) => (
                  <DisclosureButton
                    key={item.name}
                    as="a"
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-primary-500/75"
                  >
                    {item.name}
                  </DisclosureButton>
                ))}
              </div>
            </div>
          )}
        </DisclosurePanel>
      )}
    </Disclosure>
  );
}
