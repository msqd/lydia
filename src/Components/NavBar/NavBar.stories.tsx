import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { DefaultBrand, NavBar } from "./NavBar";
import type { NavigationItem, User } from "./NavBar";

const meta = {
  title: "Components/NavBar",
  component: NavBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    themes: {
      default: "light",
      list: [
        { name: "light", class: "light", color: "#ffffff" },
        { name: "dark", class: "dark", color: "#1f2937" },
      ],
    },
  },
} satisfies Meta<typeof NavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultNavigation: NavigationItem[] = [
  { name: "Overview", href: "#", current: true },
  { name: "Journal", href: "#", current: false },
  { name: "Explorer", href: "#", current: false },
  { name: "Editor", href: "#", current: false },
  { name: "Alerts", href: "#", current: false },
];

const alternateNavigation: NavigationItem[] = [
  { name: "Home", href: "#", current: true },
  { name: "Documentation", href: "#", current: false },
  { name: "API", href: "#", current: false },
  { name: "Support", href: "#", current: false },
];

const defaultUserNavigation: NavigationItem[] = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "#" },
  { name: "Sign out", href: "#" },
];

const alternateUserNavigation: NavigationItem[] = [
  { name: "Account", href: "#" },
  { name: "Preferences", href: "#" },
  { name: "Logout", href: "#" },
];

const defaultUser: User = {
  name: "Tom Cook",
  email: "tom@example.com",
};

const customUser: User = {
  name: "Alex Johnson",
  email: "alex@example.com",
  avatar: (
    <div className="size-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-medium">AJ</div>
  ),
};

/**
 * No props: the "lydia" brand and nothing else. The bar draws only what the consumer passes.
 */
export const Empty: Story = {};

/**
 * A user without `userNavigation`: the avatar is drawn, the menu holds no entry.
 */
export const UserWithoutUserNavigation: Story = {
  args: {
    user: defaultUser,
  },
};

/**
 * Every item goes through `linkComponent` and receives its `onClick`, desktop and mobile.
 * Clicks show in the Actions panel.
 */
export const WithOnClickItems: Story = {
  args: {
    navigation: [{ name: "Overview", href: "#", current: true, onClick: fn().mockName("navigate: Overview") }],
    userNavigation: [
      {
        name: "Sign out",
        href: "#",
        onClick: fn((event: React.MouseEvent) => event.preventDefault()).mockName("sign out"),
      },
    ],
    user: defaultUser,
  },
};

export const Default: Story = {
  args: {
    navigation: defaultNavigation,
    userNavigation: defaultUserNavigation,
    user: defaultUser,
  },
};

/**
 * No user signed in. The bar keeps its navigation and settings, and simply offers no identity:
 * no name, no avatar and no user menu. This is the state of any consumer that has not built
 * authentication yet, and it is a supported state rather than a missing prop.
 */
export const SignedOut: Story = {
  args: {
    navigation: defaultNavigation,
    userNavigation: defaultUserNavigation,
  },
};

export const WithAlternativeNavigation: Story = {
  args: {
    navigation: alternateNavigation,
    userNavigation: defaultUserNavigation,
    user: defaultUser,
  },
};

export const WithAlternativeUserNavigation: Story = {
  args: {
    navigation: defaultNavigation,
    userNavigation: alternateUserNavigation,
    user: defaultUser,
  },
};

export const WithDefaultAvatar: Story = {
  args: {
    navigation: defaultNavigation,
    userNavigation: defaultUserNavigation,
    user: defaultUser,
  },
};

export const WithCustomAvatar: Story = {
  args: {
    navigation: defaultNavigation,
    userNavigation: defaultUserNavigation,
    user: customUser,
  },
};

export const WithCustomTheme: Story = {
  args: {
    navigation: defaultNavigation,
    userNavigation: defaultUserNavigation,
    user: defaultUser,
  },

  parameters: {
    backgrounds: {
      options: {
        primary: { name: "primary", value: "#0c4a6e" },
      },
    },
  },

  globals: {
    backgrounds: {
      value: "primary",
    },
  },
};

export const WithCustomBrand: Story = {
  args: {
    navigation: defaultNavigation,
    userNavigation: defaultUserNavigation,
    user: defaultUser,
    brand: "My Application",
  },
};

export const WithCustomLogo: Story = {
  args: {
    navigation: defaultNavigation,
    userNavigation: defaultUserNavigation,
    user: defaultUser,
    logo: "Application Logo",
  },
};

export const WithCustomBrandComponent: Story = {
  args: {
    navigation: defaultNavigation,
    userNavigation: defaultUserNavigation,
    user: defaultUser,
    brand: (
      <div className="flex items-center">
        <span className="text-white text-xl font-bold">My</span>
        <span className="text-primary-300 text-xl font-bold">App</span>
        <span className="ml-1 bg-white text-primary-900 text-xs px-1 py-0.5 rounded">BETA</span>
      </div>
    ),
  },
};

export const WithCustomLogoComponent: Story = {
  args: {
    navigation: defaultNavigation,
    userNavigation: defaultUserNavigation,
    user: defaultUser,
    logo: (
      <div className="flex items-center justify-center bg-white p-1 rounded">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#0EA5E9" />
          <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="#0284C7" />
        </svg>
      </div>
    ),
  },
};

export const WithBrandText: Story = {
  args: {
    navigation: defaultNavigation,
    userNavigation: defaultUserNavigation,
    user: defaultUser,
    brand: <DefaultBrand text="Custom Text via DefaultBrand" />,
  },
};

export const WithApplicationNavigation: Story = {
  args: {
    navigation: [
      { name: "Overview", href: "#", current: true },
      { name: "Requests", href: "#", current: false },
      { name: "Map", href: "#", current: false },
    ],
    userNavigation: defaultUserNavigation,
    user: defaultUser,
  },
  name: "With Application Navigation",
};
