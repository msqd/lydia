import type { ReactNode } from "react";
import type { refractor } from "refractor/core";
import { tokenStyles } from "./syntaxTheme";

/** The syntax tree refractor produces (a hast `Root`). */
export type SyntaxTree = ReturnType<typeof refractor.highlight>;

/** A node of a syntax tree, at the root or beneath an element. */
type SyntaxNode = SyntaxTree["children"][number];

interface SyntaxHighlighterProps {
  /** The syntax tree to render */
  ast: SyntaxTree;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
}

/**
 * Recursively renders a syntax tree node with appropriate styling
 */
function renderNode(node: SyntaxNode, key: string): ReactNode {
  if (node.type === "text") {
    return node.value;
  }

  if (node.type === "element") {
    const { properties, children } = node;
    const className = Array.isArray(properties.className)
      ? properties.className.join(" ")
      : String(properties.className ?? "");

    // Extract token type from class name (e.g., "token keyword" -> "keyword")
    const tokenType = className.split(" ").find((cls) => cls !== "token" && tokenStyles[cls]);

    const style = tokenType ? tokenStyles[tokenType] : undefined;

    // Render as span with appropriate styling
    return (
      <span key={key} style={style} className={className}>
        {children.map((child, index) => renderNode(child, `${key}-${index}`))}
      </span>
    );
  }

  return null;
}

/**
 * Component for rendering syntax-highlighted code with optional line numbers
 */
export function SyntaxHighlighter({ ast, showLineNumbers = false }: SyntaxHighlighterProps) {
  // If we need line numbers, we'll render them separately
  if (showLineNumbers) {
    // For line numbers, we need to process the content differently
    // This is a simplified approach - in practice, you might want more sophisticated line number handling
    return (
      <div className="flex font-mono text-xs leading-5">
        <div className="select-none text-gray-400 text-right pr-3 border-r border-gray-200">
          {/* Line numbers would go here - simplified for this example */}
        </div>
        <div className="pl-3 flex-1">{ast.children.map((child, index) => renderNode(child, `root-${index}`))}</div>
      </div>
    );
  }

  // Simple rendering without line numbers
  return (
    <div className="font-mono text-xs leading-5">
      {ast.children.map((child, index) => renderNode(child, `root-${index}`))}
    </div>
  );
}
