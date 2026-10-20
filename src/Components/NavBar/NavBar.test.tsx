import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ApilabLogotype, NavBar } from "./NavBar";

// Mock ResizeObserver which is not available in the jsdom test environment
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("NavBar", () => {
  // Setup mock before each test
  beforeEach(() => {
    window.ResizeObserver = ResizeObserverMock;
  });
  it("renders the logo and default brand name", () => {
    render(<NavBar />);

    const logo = screen.getByAltText("APILab");
    expect(logo).toBeInTheDocument();

    const brandName = screen.getByText("apilab");
    expect(brandName).toBeInTheDocument();
  });

  it("renders custom brand as string", () => {
    render(<NavBar brand="Custom Brand" />);

    const brandName = screen.getByText("Custom Brand");
    expect(brandName).toBeInTheDocument();
  });

  it("renders custom logo alt text", () => {
    render(<NavBar logo="Custom Alt" />);

    const logo = screen.getByAltText("Custom Alt");
    expect(logo).toBeInTheDocument();
  });

  it("renders custom brand component", () => {
    const CustomBrand = () => <div data-testid="custom-brand">Custom Brand Component</div>;
    render(<NavBar brand={<CustomBrand />} />);

    const customBrand = screen.getByTestId("custom-brand");
    expect(customBrand).toBeInTheDocument();
    expect(screen.queryByText("Lydia")).not.toBeInTheDocument();
  });

  it("renders navigation items", () => {
    const navigation = [
      { name: "Overview", href: "#", current: true },
      { name: "Transactions", href: "#", current: false },
    ];

    render(<NavBar navigation={navigation} />);

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
  });

  it("accepts user information via props", () => {
    const user = {
      name: "Test User",
      email: "test@example.com",
    };

    render(<NavBar user={user} />);

    // Check that the user menu button is present
    const userMenuButton = screen.getByRole("button", { name: "Open user menu" });
    expect(userMenuButton).toBeInTheDocument();
  });

  it("renders custom logo component", () => {
    const CustomLogo = () => <div data-testid="custom-logo">Custom Logo Component</div>;
    render(<NavBar logo={<CustomLogo />} />);

    const customLogo = screen.getByTestId("custom-logo");
    expect(customLogo).toBeInTheDocument();
    expect(screen.queryByAltText("APILab")).not.toBeInTheDocument();
  });

  it("renders user avatar and settings button when signed in", () => {
    render(<NavBar user={{ name: "Test User", email: "test@example.com" }} onSettings={vi.fn()} />);

    // Check that the user menu button is present
    const userMenuButton = screen.getByRole("button", { name: "Open user menu" });
    expect(userMenuButton).toBeInTheDocument();

    // Check that the settings button is present
    const settingsButton = screen.getByRole("button", { name: "Settings" });
    expect(settingsButton).toBeInTheDocument();
  });

  it("draws no settings control when there is nothing behind it", () => {
    render(<NavBar />);

    // Same argument the bar already makes about `user`: a placeholder is
    // indistinguishable from the real thing to whoever reaches for it. A cog
    // that names itself "Settings", takes a tab stop and does nothing is worse
    // than absent, because absent is at least honest.
    expect(screen.queryByRole("button", { name: "Settings" })).not.toBeInTheDocument();
  });

  it("opens the settings it was given", () => {
    const onSettings = vi.fn();
    render(<NavBar onSettings={onSettings} />);

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));

    expect(onSettings).toHaveBeenCalledOnce();
  });

  // Name, email and the user navigation live in the mobile panel, which headlessui only
  // renders once opened. Asserting on them without opening it passes for the wrong reason.
  const openMobileMenu = () => fireEvent.click(screen.getByRole("button", { name: "Open main menu" }));

  it("shows the name and email it was given", () => {
    render(<NavBar user={{ name: "Ada Lovelace", email: "ada@example.com" }} />);
    openMobileMenu();

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
  });

  it("invents no identity when no user is given", () => {
    render(<NavBar />);

    expect(screen.queryByRole("button", { name: "Open user menu" })).not.toBeInTheDocument();
    expect(screen.queryByText("Tom Cook")).not.toBeInTheDocument();
    expect(screen.queryByText(/@example\.com/)).not.toBeInTheDocument();
  });

  it("keeps the bar usable when signed out", () => {
    render(<NavBar onSettings={vi.fn()} />);

    // The bar is a navbar with its navigation and settings, not a truncated one. Being signed
    // out costs it an identity and nothing else -- the settings are the consumer's, not the
    // user's, so they survive having nobody signed in.
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
  });

  it("offers no user menu entries when signed out", () => {
    render(<NavBar />);
    openMobileMenu();

    // The navigation itself is still there, so this is not asserting an empty panel.
    expect(screen.getAllByText("Overview").length).toBeGreaterThan(0);
    expect(screen.queryByText("Sign out")).not.toBeInTheDocument();
    expect(screen.queryByText("Your Profile")).not.toBeInTheDocument();
  });

  it("shows user menu entries when signed in", () => {
    render(<NavBar user={{ name: "Ada Lovelace", email: "ada@example.com" }} />);
    openMobileMenu();

    expect(screen.getByText("Sign out")).toBeInTheDocument();
    expect(screen.getByText("Your Profile")).toBeInTheDocument();
  });
});

/*
 * The mobile menu button is the third control on this bar that could name
 * itself and do nothing.
 *
 * `user` and `onSettings` are both drawn only when there is something behind
 * them, for a reason the component states in its own docs: a control that
 * announces itself and does nothing is indistinguishable from a working one to
 * whoever reaches for it. The hamburger was drawn unconditionally, so a
 * consumer with no navigation and no user -- a single-screen application, which
 * is exactly what `navigation={[]}` is for -- shipped an "Open main menu"
 * button on every narrow viewport that opened an empty panel.
 *
 * Appended rather than inserted: the snapshots above are keyed by headlessui
 * ids numbered per render.
 */
describe("NavBar with nothing in its menu", () => {
  it("draws no menu button when there is no navigation and no user", () => {
    render(<NavBar navigation={[]} />);

    expect(screen.queryByRole("button", { name: "Open main menu" })).not.toBeInTheDocument();
  });

  it("still draws it for navigation alone", () => {
    render(<NavBar navigation={[{ name: "Overview", href: "/" }]} />);

    expect(screen.getByRole("button", { name: "Open main menu" })).toBeInTheDocument();
  });

  it("still draws it for a signed-in user alone", () => {
    // The panel carries the name, email and user navigation, so a user is
    // something to open even with no navigation at all.
    render(<NavBar navigation={[]} user={{ name: "Ada Lovelace", email: "ada@example.com" }} />);

    expect(screen.getByRole("button", { name: "Open main menu" })).toBeInTheDocument();
  });

  it("keeps the bar itself, and the settings on it", () => {
    // Losing the menu costs the bar nothing else: the brand still shows, and
    // settings are the consumer's rather than the menu's.
    render(<NavBar navigation={[]} onSettings={vi.fn()} />);

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
  });

  /**
   * The home link is named by the brand it shows, not by a label nobody sees:
   * "Go to homepage" over a visible "apilab" left a speech user with no words
   * to reach it by (WCAG 2.5.3, axe `label-content-name-mismatch`).
   */
  it("names the home link by the brand it shows", () => {
    render(<NavBar brand="jaco" />);

    expect(screen.getByRole("link", { name: /jaco/ })).toHaveAttribute("href", "/");
  });

  /**
   * The logo mark beside the brand says the brand again: "APILab apilab" read
   * twice, and with the logotype brand "APILab APILab" (axe
   * `image-redundant-alt`). The brand names the link; the mark is decoration.
   */
  it("names the home link once, by its brand", () => {
    render(<NavBar brand="jaco" />);
    expect(screen.getByRole("link", { name: "jaco" })).toBeInTheDocument();
  });

  it("names it by a logotype brand once too", () => {
    render(<NavBar brand={<ApilabLogotype />} />);
    expect(screen.getByRole("link", { name: "APILab" })).toBeInTheDocument();
  });
});
