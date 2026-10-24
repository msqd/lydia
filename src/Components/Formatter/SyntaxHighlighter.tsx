import type { ReactNode } from "react";
import type { refractor } from "refractor/core";

/** The syntax tree refractor produces (a hast `Root`). */
export type SyntaxTree = ReturnType<typeof refractor.highlight>;

/** A node of a syntax tree, at the root or beneath an element. */
type SyntaxNode = SyntaxTree["children"][number];

interface SyntaxHighlighterProps {
  /** The syntax tree to render */
  ast: SyntaxTree;
}

/** Token colours come from `prism.css`, through the `token` classes. */
function renderNode(node: SyntaxNode, key: string): ReactNode {
  if (node.type === "text") {
    return node.value;
  }

  if (node.type === "element") {
    const { properties, children } = node;
    const className = Array.isArray(properties.className)
      ? properties.className.join(" ")
      : String(properties.className ?? "");

    return (
      <span key={key} className={className}>
        {children.map((child, index) => renderNode(child, `${key}-${index}`))}
      </span>
    );
  }

  return null;
}

/**
 * Renders a syntax tree as inline tokens, to be placed inside a code line.
 */
export function SyntaxHighlighter({ ast }: SyntaxHighlighterProps) {
  return <>{ast.children.map((child, index) => renderNode(child, `root-${index}`))}</>;
}
