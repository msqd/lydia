import { customRender, screen } from "@msqd/lydia/Components/Utilities/Testing";
import { describe, expect, it } from "vitest";
import { NetworkNode, NetworkNodeDetail } from "./NetworkNode";

const shellOf = (title: string) => screen.getByRole("heading", { name: title }).closest("div")?.parentElement;

describe("NetworkNode", () => {
  it("frames every node the same way, whatever it holds", () => {
    // The frame is the point: box, radius, height and title row are one design decision that used
    // to live in three copies.
    customRender(<NetworkNode tone="blue" title="entrypoint" />);

    expect(shellOf("entrypoint")).toHaveClass("border", "rounded-lg", "p-3", "h-full");
  });

  it.each([
    ["blue", "bg-blue-50"],
    ["green", "bg-green-50"],
    ["purple", "bg-purple-50"],
  ] as const)("takes the %s tone", (tone, expected) => {
    customRender(<NetworkNode tone={tone} title="node" />);

    expect(shellOf("node")).toHaveClass(expected);
  });

  it("names the node in a heading, so a map is navigable rather than only visual", () => {
    customRender(<NetworkNode tone="green" title="/api/users" />);

    expect(screen.getByRole("heading", { name: "/api/users" })).toBeInTheDocument();
  });

  it("truncates the title rather than growing, since a node has a fixed height", () => {
    customRender(<NetworkNode tone="green" title="a name far longer than the box that holds it" />);

    expect(screen.getByRole("heading", { name: /far longer/ })).toHaveClass("truncate");
  });

  it("puts an action on the title row", () => {
    customRender(<NetworkNode tone="blue" title="node" action={<span>8080</span>} />);

    expect(screen.getByText("8080")).toBeInTheDocument();
  });

  it("renders its body under the title row", () => {
    customRender(
      <NetworkNode tone="green" title="node">
        <NetworkNodeDetail>/some/path</NetworkNodeDetail>
      </NetworkNode>,
    );

    expect(screen.getByText("/some/path")).toHaveClass("font-mono", "truncate");
  });

  it("lets a caller override the frame", () => {
    customRender(<NetworkNode tone="green" title="node" className="p-6" />);

    expect(shellOf("node")).toHaveClass("p-6");
    expect(shellOf("node")).not.toHaveClass("p-3");
  });
});
