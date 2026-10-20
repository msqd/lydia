import type { ReactNode } from "react";
import { tokenStyles } from "./syntaxTheme";

interface SyntaxHighlighterProps {
  /** The syntax tree to render */
  ast: any;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
}

/**
 * Recursively renders a syntax tree node with appropriate styling
 */
function renderNode(node: any, key: string): ReactNode {
  if (node.type === "text") {
    return node.value;
  }

  if (node.type === "element") {
    const { properties = {}, children = [] } = node;
    const className = Array.isArray(properties.className)
      ? properties.className.join(" ")
      : (properties.className as string) || "";

    // Extract token type from class name (e.g., "token keyword" -> "keyword")
    const tokenType = className.split(" ").find((cls: string) => cls !== "token" && tokenStyles[cls]);

    const style = tokenType ? tokenStyles[tokenType] : undefined;

    // Render as span with appropriate styling
    return (
      <span key={key} style={style} className={className}>
        {children.map((child: any, index: number) => renderNode(child, `${key}-${index}`))}
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
        <div className="pl-3 flex-1">
          {ast.children.map((child: any, index: number) => renderNode(child, `root-${index}`))}
        </div>
      </div>
    );
  }

  // Simple rendering without line numbers
  return (
    <div className="font-mono text-xs leading-5">
      {ast.children.map((child: any, index: number) => renderNode(child, `root-${index}`))}
    </div>
  );
}
