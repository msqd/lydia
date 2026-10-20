import { type ComponentProps, useState } from "react";
import { twMerge } from "tailwind-merge";

export interface JsonTreeViewProps extends Omit<ComponentProps<"div">, "onChange"> {
  /**
   * The JSON data to display
   */
  data: unknown;

  /**
   * Whether nodes should be initially expanded
   */
  initiallyExpanded?: boolean;

  /**
   * Maximum nesting depth to show expanded (after this depth, nodes will be collapsed)
   */
  expandedDepth?: number;

  /**
   * Callback when a value is clicked
   */
  onValueClick?: (path: string, value: unknown) => void;

  /**
   * CSS class for the container
   */
  className?: string;
}

// Node types for rendering
type NodeType = "object" | "array" | "string" | "number" | "boolean" | "null";

/**
 * Tree View component for JSON data
 */
export function JsonTreeView({
  data,
  initiallyExpanded = false,
  expandedDepth = 1,
  onValueClick,
  className,
  ...props
}: JsonTreeViewProps) {
  // Parse the JSON if it's a string
  let jsonData;
  try {
    jsonData = typeof data === "string" ? JSON.parse(data) : data;
  } catch (error) {
    console.error("Failed to parse JSON string:", error);
    jsonData = { error: "Invalid JSON data" };
  }

  return (
    <div
      className={twMerge("font-mono text-sm text-gray-800 p-4 bg-white rounded-md border border-gray-200", className)}
      {...props}
    >
      <JsonNode
        data={jsonData}
        name="root"
        path="$"
        initiallyExpanded={initiallyExpanded}
        expandedDepth={expandedDepth}
        depth={0}
        onValueClick={onValueClick}
      />
    </div>
  );
}

interface JsonNodeProps {
  data: unknown;
  name: string;
  path: string;
  initiallyExpanded: boolean;
  expandedDepth: number;
  depth: number;
  onValueClick?: (path: string, value: unknown) => void;
}

function JsonNode({ data, name, path, initiallyExpanded, expandedDepth, depth, onValueClick }: JsonNodeProps) {
  // Determine if this node should be initially expanded based on depth
  const shouldExpand = initiallyExpanded || depth < expandedDepth;
  const [isExpanded, setIsExpanded] = useState(shouldExpand);

  // Get the type of this node
  const nodeType = getNodeType(data);

  // For objects and arrays, determine the size (number of properties/elements)
  const size =
    nodeType === "object"
      ? Object.keys(data as object).length
      : nodeType === "array"
        ? (data as unknown[]).length
        : null;

  // Toggle expansion
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle click on a primitive value
  const handleValueClick = () => {
    if (nodeType !== "object" && nodeType !== "array" && onValueClick) {
      onValueClick(path, data);
    }
  };

  // Apply appropriate styling based on node type
  const getValueClass = () => {
    switch (nodeType) {
      case "string":
        return "text-green-700";
      case "number":
        return "text-blue-600";
      case "boolean":
        return "text-purple-600";
      case "null":
        return "text-gray-500 italic";
      default:
        return "";
    }
  };

  // Format the value for display
  const formatValue = () => {
    switch (nodeType) {
      case "string":
        return `"${data}"`;
      case "null":
        return "null";
      default:
        return String(data);
    }
  };

  // For objects and arrays, handle nested rendering
  const renderChildren = () => {
    if (nodeType === "object") {
      const obj = data as Record<string, unknown>;
      return Object.keys(obj).map((key) => (
        <div key={key} className="ml-4 my-1">
          <JsonNode
            data={obj[key]}
            name={key}
            path={`${path}.${key}`}
            initiallyExpanded={initiallyExpanded}
            expandedDepth={expandedDepth}
            depth={depth + 1}
            onValueClick={onValueClick}
          />
        </div>
      ));
    } else if (nodeType === "array") {
      const arr = data as unknown[];
      return arr.map((item, index) => (
        <div key={index} className="ml-4 my-1">
          <JsonNode
            data={item}
            name={`${index}`}
            path={`${path}[${index}]`}
            initiallyExpanded={initiallyExpanded}
            expandedDepth={expandedDepth}
            depth={depth + 1}
            onValueClick={onValueClick}
          />
        </div>
      ));
    }
    return null;
  };

  // Don't show root node name
  const displayName = path === "$" ? "" : name;

  // Render toggle button for expandable nodes
  const renderToggle = () => {
    if (nodeType === "object" || nodeType === "array") {
      return (
        <button type="button" onClick={toggleExpand} className="mr-1 inline-block w-4 text-gray-500 focus:outline-none">
          {isExpanded ? "▼" : "►"}
        </button>
      );
    }
    return <span className="mr-1 inline-block w-4" />;
  };

  // Render the node
  return (
    <div className="node">
      <div className="flex items-start">
        {renderToggle()}

        {displayName && <span className="mr-1 font-semibold">{displayName}:</span>}

        {nodeType === "object" || nodeType === "array" ? (
          <span>
            {nodeType === "object" ? "{" : "["}
            {!isExpanded && (
              <span className="text-gray-500">
                {" "}
                {size} {nodeType === "object" ? "properties" : "items"} {"}"}
              </span>
            )}
          </span>
        ) : (
          <span
            className={twMerge(getValueClass(), onValueClick && "cursor-pointer hover:underline")}
            onClick={handleValueClick}
          >
            {formatValue()}
          </span>
        )}
      </div>

      {isExpanded && (nodeType === "object" || nodeType === "array") && (
        <>
          <div>{renderChildren()}</div>
          <div className="ml-4">{nodeType === "object" ? "}" : "]"}</div>
        </>
      )}
    </div>
  );
}

// Helper function to determine the type of a JSON value
function getNodeType(value: unknown): NodeType {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";

  const type = typeof value;
  switch (type) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "object":
      return "object";
    default:
      return "null";
  }
}

export default JsonTreeView;
