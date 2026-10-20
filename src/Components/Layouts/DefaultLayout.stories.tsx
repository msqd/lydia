import { Badge } from "@msqd/lydia/Components/Badges";
import { Button } from "@msqd/lydia/Components/Buttons";
import { LydiaLogotype, DefaultLogo } from "@msqd/lydia/Components/NavBar/NavBar";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DefaultLayout } from "./DefaultLayout";

const meta = {
  title: "Components/Layouts/DefaultLayout",
  component: DefaultLayout,
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
} satisfies Meta<typeof DefaultLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="p-4 bg-white rounded-lg border-gray-200 border-3 border-dashed">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Content</h1>
        <p className="text-gray-700">
          This is a placeholder for page content. In a real application, this area would contain your page-specific
          components and data.
        </p>
      </div>
    ),
    navBarProps: {
      logo: <DefaultLogo />,
      brand: <LydiaLogotype />,
    },
  },
};

/**
 * The signed-out layout, which is what a consumer without authentication gets. The user travels
 * through `navBarProps`, so omitting it is all that is required.
 */
export const SignedOut: Story = {
  args: {
    children: (
      <div className="p-4 bg-white rounded-lg border-gray-200 border-3 border-dashed">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Content</h1>
        <p className="text-gray-700">No user is signed in, so the navbar shows no identity.</p>
      </div>
    ),
    navBarProps: {
      logo: <DefaultLogo />,
      brand: <LydiaLogotype />,
    },
  },
};

/**
 * The same layout with a user, passed straight through to the navbar.
 */
export const SignedIn: Story = {
  args: {
    children: (
      <div className="p-4 bg-white rounded-lg border-gray-200 border-3 border-dashed">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Content</h1>
        <p className="text-gray-700">A user is signed in, so the navbar shows their identity.</p>
      </div>
    ),
    navBarProps: {
      logo: <DefaultLogo />,
      brand: <LydiaLogotype />,
      user: { name: "Ada Lovelace", email: "ada@example.com" },
    },
  },
};

export const WithCustomNavBar: Story = {
  args: {
    children: (
      <div className="p-4 bg-white rounded-lg border-gray-200 border-3 border-dashed">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Custom NavBar Example</h1>
        <p className="text-gray-700">This example shows the DefaultLayout with custom navigation settings.</p>
      </div>
    ),
    navBarProps: {
      logo: <DefaultLogo />,
      brand: "lydia custom",
      navigation: [
        { name: "Overview", href: "#", current: true },
        { name: "Journal", href: "#", current: false },
        { name: "Explorer", href: "#", current: false },
        { name: "Editor", href: "#", current: false },
        { name: "Alerts", href: "#", current: false },
      ],
      user: {
        name: "Jane Smith",
        email: "jane@example.com",
      },
    },
  },
};

export const WithCustomPadding: Story = {
  args: {
    children: (
      <div className="bg-white rounded-lg border-gray-200 border-3 border-dashed">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Custom Padding Example</h1>
        <p className="text-gray-700">
          This example shows the DefaultLayout with custom padding settings for the content area.
        </p>
      </div>
    ),
    navBarProps: {
      logo: <DefaultLogo />,
      brand: <LydiaLogotype />,
    },
    contentClassName: "p-8 bg-gray-100",
  },
};

const toolbar = (
  <>
    <span>
      <b className="text-gray-900">812</b> of 1000 · 3.1 MiB of 32.0 MiB
    </span>
    <Badge color="red">12 dropped</Badge>
    <Button variant="secondary" size="sm">
      Filters (2)
    </Button>
    <Button variant="secondary" size="sm">
      pause
    </Button>
    <Button variant="secondary" size="sm">
      export
    </Button>
    <Button variant="secondary" size="sm">
      clear
    </Button>
  </>
);

/**
 * A page's own header: its title, and the instruments that act on it.
 *
 * The title is the page's one `h1`, and the band sits inside `main`, so it adds
 * no second banner beside the NavBar's. The toolbar is not `role="toolbar"`: it
 * mixes figures with buttons and has no arrow-key navigation, which that role
 * would promise.
 */
export const WithAPageHeader: Story = {
  args: {
    title: "recordings",
    toolbar,
    contentClassName: "bg-gray-50",
    children: <p className="p-4 text-sm text-gray-700">The page's content, below its header.</p>,
    navBarProps: { logo: <DefaultLogo />, brand: <LydiaLogotype /> },
  },
};

/**
 * At 320 CSS pixels the instruments wrap rather than run off the edge, so the
 * last of them stays reachable without scrolling sideways: WCAG 1.4.10.
 *
 * The width is pinned here because viewport settings do nothing in the browser
 * the stories are tested in.
 */
export const APageHeaderOnANarrowScreen: Story = {
  ...WithAPageHeader,
  decorators: [(Story) => <div style={{ width: 320 }}>{Story()}</div>],
  play: async ({ canvasElement }) => {
    // Measured in the face the page ships: a narrower fallback, drawn while
    // Lato is still loading, fits where Lato does not.
    for (const face of ['400 12px "Lato"', '700 12px "Lato"']) {
      await document.fonts.load(face);
      await expect(document.fonts.check(face), face).toBe(true);
    }
    const main = canvasElement.querySelector("main");
    const heading = within(canvasElement).getByRole("heading", { level: 1, name: "recordings" });
    const band = heading.parentElement;
    if (!main || !band) throw new Error("no page header drawn");

    await expect(main.contains(band)).toBe(true);
    for (const element of [band, main]) {
      await expect(element.scrollWidth, `${element.tagName} overflows`).toBe(element.clientWidth);
    }
    const last = within(band).getByRole("button", { name: "clear" }).getBoundingClientRect();
    await expect(last.right).toBeLessThanOrEqual(band.getBoundingClientRect().right);
  },
};
