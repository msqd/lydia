import { EnvelopeIcon } from "@heroicons/react/16/solid";
import { describe, expect, it } from "vitest";
import { customRender, expectComponentDefaults, screen } from "../../../Components/Utilities/Testing";
import { InputAddon } from "../InputAddon";
import { InputButton } from "../InputButton";
import { InputIcon } from "../InputIcon";
import { KeyboardShortcut } from "../KeyboardShortcut";
import { Input } from "./Input";

describe("Input (public surface)", () => {
  it("exports the Input component and nothing else", async () => {
    const module = await import("./Input");
    expect(Object.keys(module).sort()).toEqual(["Input"]);
  });
});

describe("Input (Basic)", () => {
  it("renders with default props", () => {
    customRender(<Input placeholder="Test input" />);
    const input = screen.getByPlaceholderText("Test input");
    expectComponentDefaults({
      element: input,
      tagName: "input",
    });
  });

  it("renders with a label", () => {
    customRender(<Input label="Name" placeholder="Enter your name" />);
    expectComponentDefaults({
      element: screen.getByText("Name"),
      tagName: "label",
    });
    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
  });

  it("renders with help text", () => {
    customRender(
      <Input
        label="Email"
        placeholder="example@example.com"
        helpText="We'll only use this for spam."
        helpTextId="email-description"
      />,
    );
    const helpText = screen.getByText("We'll only use this for spam.");
    expectComponentDefaults({
      element: helpText,
      tagName: "p",
    });
    expect(helpText).toHaveAttribute("id", "email-description");
  });

  it("renders with an error message", () => {
    customRender(
      <Input
        label="Email"
        placeholder="invalid-email"
        errorMessage="Please enter a valid email address."
        errorId="email-error"
        variant="error"
      />,
    );
    const errorMessage = screen.getByText("Please enter a valid email address.");
    expectComponentDefaults({
      element: errorMessage,
      tagName: "p",
    });
    expect(errorMessage).toHaveAttribute("id", "email-error");
  });

  it("renders with a corner hint", () => {
    customRender(
      <Input label="Email" placeholder="example@example.com" cornerHint="Optional" cornerHintId="email-optional" />,
    );
    const cornerHint = screen.getByText("Optional");
    expectComponentDefaults({
      element: cornerHint,
      tagName: "span",
    });
    expect(cornerHint).toHaveAttribute("id", "email-optional");
  });

  it("renders in disabled state", () => {
    customRender(<Input label="Name" placeholder="Enter your name" disabled />);
    const input = screen.getByPlaceholderText("Enter your name");
    expect(input).toBeDisabled();
  });

  it("renders with leading icon", () => {
    customRender(
      <Input label="Name" placeholder="Enter your name" leadingElement={<div data-testid="leading-icon">Icon</div>} />,
    );
    expect(screen.getByTestId("leading-icon")).toBeInTheDocument();
  });

  it("renders with trailing icon", () => {
    customRender(
      <Input
        label="Name"
        placeholder="Enter your name"
        trailingElement={<div data-testid="trailing-icon">Icon</div>}
      />,
    );
    expect(screen.getByTestId("trailing-icon")).toBeInTheDocument();
  });

  it("applies error styles when variant is error", () => {
    const { container } = customRender(<Input label="Email" placeholder="invalid-email" variant="error" />);
    const wrapper = container.querySelector('div[class*="outline-danger-300"]');
    expect(wrapper).toBeInTheDocument();
  });

  it("applies success styles when variant is success", () => {
    const { container } = customRender(<Input label="Email" placeholder="email@example.com" variant="success" />);
    const wrapper = container.querySelector('div[class*="outline-success-300"]');
    expect(wrapper).toBeInTheDocument();
  });
});

describe("Input (Group)", () => {
  it("renders with default props", () => {
    const { container } = customRender(
      <div className="grid grid-cols-1">
        <Input placeholder="Test input" />
      </div>,
    );

    const input = screen.getByPlaceholderText("Test input");
    expectComponentDefaults({
      element: input,
      tagName: "input",
    });

    // Snapshot test
    expect(container).toMatchSnapshot();
  });

  it("renders with label", () => {
    customRender(
      <div className="grid grid-cols-1">
        <Input placeholder="Test input" label="Test Label" id="test" />
      </div>,
    );

    const label = screen.getByText("Test Label");
    expectComponentDefaults({
      element: label,
      tagName: "label",
    });
    // Check if input is associated with label
    const inputElement = screen.getByPlaceholderText("Test input");
    expect(inputElement).toHaveAttribute("id", "test");
  });

  it("renders with help text", () => {
    customRender(
      <div className="grid grid-cols-1">
        <Input placeholder="Test input" label="Test Label" helpText="This is help text" helpTextId="help-text" />
      </div>,
    );

    const helpText = screen.getByText("This is help text");
    expectComponentDefaults({
      element: helpText,
      tagName: "p",
    });
    expect(helpText).toHaveAttribute("id", "help-text");
  });

  it("renders with error message", () => {
    customRender(
      <div className="grid grid-cols-1">
        <Input
          placeholder="Test input"
          label="Test Label"
          errorMessage="This is an error"
          errorId="error-text"
          variant="error"
        />
      </div>,
    );

    const errorText = screen.getByText("This is an error");
    expectComponentDefaults({
      element: errorText,
      tagName: "p",
    });
    expect(errorText).toHaveAttribute("id", "error-text");
  });

  it("renders with corner hint", () => {
    customRender(
      <div className="grid grid-cols-1">
        <Input placeholder="Test input" label="Test Label" cornerHint="Optional" cornerHintId="corner-hint" />
      </div>,
    );

    const cornerHint = screen.getByText("Optional");
    expectComponentDefaults({
      element: cornerHint,
      tagName: "span",
    });
    expect(cornerHint).toHaveAttribute("id", "corner-hint");
  });

  it("renders as a fieldset when legend is provided", () => {
    customRender(
      <fieldset>
        <legend>Card details</legend>
        <div className="grid grid-cols-1">
          <Input placeholder="Test input" />
        </div>
      </fieldset>,
    );

    const legend = screen.getByText("Card details");
    expectComponentDefaults({
      element: legend,
      tagName: "LEGEND",
    });
  });

  it("renders with the InputAddon component", () => {
    customRender(
      <div className="grid grid-cols-1">
        <div className="flex">
          <InputAddon position="leading">https://</InputAddon>
          <Input placeholder="example.com" label="Website" />
        </div>
      </div>,
    );

    const addon = screen.getByText("https://");
    expect(addon).toBeInTheDocument();
    expect(screen.getByText("Website")).toBeInTheDocument(); // Check label is rendered by Input
  });

  it("renders with the Icon component", () => {
    customRender(
      <div className="grid grid-cols-1">
        <div className="grid grid-cols-1 relative">
          <Input
            placeholder="Test input"
            label="Test Label with Icon"
            leadingElement={
              <InputIcon position="leading">
                <div data-testid="test-icon">Icon</div>
              </InputIcon>
            }
          />
        </div>
      </div>,
    );

    const icon = screen.getByTestId("test-icon");
    expect(icon).toBeInTheDocument();
    expect(screen.getByText("Test Label with Icon")).toBeInTheDocument();
  });

  it("renders with the Button component", () => {
    customRender(
      <div className="grid grid-cols-1">
        <div className="flex">
          <Input placeholder="Test input" label="Test Label with Button" />
          <InputButton position="trailing">Button</InputButton>
        </div>
      </div>,
    );

    const button = screen.getByRole("button", { name: "Button" });
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Test Label with Button")).toBeInTheDocument();
  });

  it("renders with the KeyboardShortcut component", () => {
    customRender(
      <div className="grid grid-cols-1">
        <div className="flex items-center relative">
          <Input
            placeholder="Test input"
            label="Test Label with Shortcut"
            trailingElement={<KeyboardShortcut shortcut="⌘K" />}
          />
        </div>
      </div>,
    );

    const shortcut = screen.getByText("⌘K");
    expect(shortcut).toBeInTheDocument();
    expect(screen.getByText("Test Label with Shortcut")).toBeInTheDocument();
  });

  it("renders an inset input inside a styled container", () => {
    const { container } = customRender(
      <div className="grid grid-cols-1 w-full">
        <div className="rounded-sm bg-white px-3 pt-2.5 pb-1.5 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary-600">
          <Input label="Label" placeholder="Test input" />
        </div>
      </div>,
    );
    expect(container.firstChild).toHaveClass("w-full");
    expectComponentDefaults({
      element: screen.getByPlaceholderText("Test input"),
      tagName: "input",
    });
  });

  it("renders adjacent inputs with shared borders", () => {
    customRender(
      <div className="grid grid-cols-1">
        <div className="-space-y-px">
          <Input placeholder="First input" className="rounded-b-none" />
          <Input placeholder="Second input" className="rounded-t-none" />
        </div>
      </div>,
    );
    const firstInput = screen.getByPlaceholderText("First input");
    expect(firstInput).toBeInTheDocument();

    const secondInput = screen.getByPlaceholderText("Second input");
    expect(secondInput).toBeInTheDocument();
  });

  it("renders a label alongside the input", () => {
    customRender(
      <div className="grid grid-cols-1">
        <Input placeholder="Test input" label="Name" />
      </div>,
    );
    expectComponentDefaults({
      element: screen.getByPlaceholderText("Test input"),
      tagName: "input",
    });
    const label = screen.getByText("Name");
    expectComponentDefaults({
      element: label,
      tagName: "label",
    });
  });
});

describe("Input with Addons", () => {
  it("renders with leading addon", () => {
    customRender(
      <div className="flex">
        <InputAddon position="leading">https://</InputAddon>
        <Input placeholder="example.com" />
      </div>,
    );
    expect(screen.getByText("https://")).toBeInTheDocument();
    expectComponentDefaults({
      element: screen.getByPlaceholderText("example.com"),
      tagName: "input",
    });
  });

  it("renders with trailing addon", () => {
    customRender(
      <div className="flex">
        <Input placeholder="0.00" type="number" />
        <InputAddon position="trailing">USD</InputAddon>
      </div>,
    );
    expect(screen.getByText("USD")).toBeInTheDocument();
    expectComponentDefaults({
      element: screen.getByPlaceholderText("0.00"),
      tagName: "input",
      defaultClasses: [],
    });
  });

  it("renders with inline leading addon", () => {
    customRender(
      <Input
        placeholder="555-0000"
        leadingElement={
          <InputAddon position="leading" inline>
            +1
          </InputAddon>
        }
      />,
    );
    expect(screen.getByText("+1")).toBeInTheDocument();
    expectComponentDefaults({
      element: screen.getByPlaceholderText("555-0000"),
      tagName: "input",
    });
  });

  it("renders with inline trailing addon", () => {
    customRender(
      <Input
        placeholder="100"
        trailingElement={
          <InputAddon position="trailing" inline>
            kg
          </InputAddon>
        }
      />,
    );
    expect(screen.getByText("kg")).toBeInTheDocument();
    expectComponentDefaults({
      element: screen.getByPlaceholderText("100"),
      tagName: "input",
    });
  });
});

describe("Input with Icons", () => {
  it("renders with leading icon", () => {
    customRender(
      <Input
        placeholder="Email"
        leadingElement={
          <InputIcon position="leading">
            <EnvelopeIcon />
          </InputIcon>
        }
      />,
    );
    // Since EnvelopeIcon doesn't have role="img", we'll check for the SVG element instead
    const iconContainer = screen.getByPlaceholderText("Email").parentElement?.querySelector("svg");
    expect(iconContainer).toBeInTheDocument();
    expectComponentDefaults({
      element: screen.getByPlaceholderText("Email"),
      tagName: "input",
    });
  });

  it("renders with trailing icon", () => {
    customRender(
      <Input
        placeholder="Email"
        trailingElement={
          <InputIcon position="trailing">
            <EnvelopeIcon />
          </InputIcon>
        }
      />,
    );
    // Since EnvelopeIcon doesn't have role="img", we'll check for the SVG element instead
    const iconContainer = screen.getByPlaceholderText("Email").parentElement?.querySelector("svg");
    expect(iconContainer).toBeInTheDocument();
    expectComponentDefaults({
      element: screen.getByPlaceholderText("Email"),
      tagName: "input",
    });
  });
});

describe("Input with Buttons", () => {
  it("renders with trailing button", () => {
    customRender(
      <div className="flex">
        <Input placeholder="Promo code" />
        <InputButton position="trailing">Apply</InputButton>
      </div>,
    );
    expect(screen.getByRole("button", { name: "Apply" })).toBeInTheDocument();
    expectComponentDefaults({
      element: screen.getByPlaceholderText("Promo code"),
      tagName: "input",
    });
  });
});

describe("Input with KeyboardShortcut", () => {
  it("renders with keyboard shortcut", () => {
    customRender(<Input placeholder="Search" trailingElement={<KeyboardShortcut shortcut="⌘K" />} />);
    expect(screen.getByText("⌘K")).toBeInTheDocument();
    expectComponentDefaults({
      element: screen.getByPlaceholderText("Search"),
      tagName: "input",
    });
  });
});

describe("Input in a grid", () => {
  it("renders several inputs side by side", () => {
    customRender(
      <div className="grid grid-cols-2">
        <Input placeholder="Input 1" />
        <Input placeholder="Input 2" />
      </div>,
    );
    expectComponentDefaults({
      element: screen.getByPlaceholderText("Input 1"),
      tagName: "input",
    });
    expectComponentDefaults({
      element: screen.getByPlaceholderText("Input 2"),
      tagName: "input",
    });
  });
});
