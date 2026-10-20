import {
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentIcon,
  FolderIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline";
import type { Transaction } from "@msqd/lydia/Models/Transactions/types";
import { type ComponentProps, useMemo } from "react";
import { twMerge } from "tailwind-merge";

export interface TreeNode {
  id: string;
  name: string;
  path: string;
  type: "api" | "folder" | "endpoint";
  children?: TreeNode[];
  transactionCount?: number;
}

export interface TransactionsExplorerSidebarProps extends Omit<ComponentProps<"div">, "onSelect"> {
  /** Transaction data to build the tree from */
  transactions: Transaction[];
  /** Currently selected path */
  selectedPath?: string | null;
  /** Currently expanded nodes */
  expandedNodes?: Set<string>;
  /** Handler when a node is selected */
  onSelect?: (path: string, type: string) => void;
  /** Handler when a node is expanded/collapsed */
  onToggleExpand?: (nodeId: string) => void;
  /** Custom title for the sidebar */
  title?: string;
}

// Build tree structure from transactions
function buildApiTree(transactions: Transaction[]): TreeNode[] {
  const apiMap = new Map<string, Map<string, Set<string>>>();

  // Group transactions by API and paths
  transactions.forEach((transaction) => {
    const apiName = transaction.apiName || "unknown-api";
    const pathParts = transaction.url.split("/").filter(Boolean);

    if (!apiMap.has(apiName)) {
      apiMap.set(apiName, new Map());
    }

    const pathMap = apiMap.get(apiName)!;

    // Build path hierarchy
    let currentPath = "";
    pathParts.forEach((part, index) => {
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!pathMap.has(parentPath)) {
        pathMap.set(parentPath, new Set());
      }
      pathMap.get(parentPath)!.add(part);

      // Add final endpoint
      if (index === pathParts.length - 1) {
        if (!pathMap.has(currentPath)) {
          pathMap.set(currentPath, new Set());
        }
      }
    });
  });

  // Convert to tree structure
  const trees: TreeNode[] = [];

  apiMap.forEach((pathMap, apiName) => {
    const apiNode: TreeNode = {
      id: apiName,
      name: apiName,
      path: apiName,
      type: "api",
      children: [],
      transactionCount: transactions.filter((t) => t.apiName === apiName).length,
    };

    // Build children recursively
    const buildChildren = (parentPath: string, parentNode: TreeNode) => {
      const children = pathMap.get(parentPath);
      if (!children || children.size === 0) return;

      children.forEach((childName) => {
        const childPath = parentPath ? `${parentPath}/${childName}` : childName;
        const fullPath = `${apiName}/${childPath}`;
        const hasGrandchildren = pathMap.has(childPath) && pathMap.get(childPath)!.size > 0;

        const childNode: TreeNode = {
          id: fullPath,
          name: childName,
          path: fullPath,
          type: hasGrandchildren ? "folder" : "endpoint",
          children: hasGrandchildren ? [] : undefined,
          transactionCount: transactions.filter((t) => t.apiName === apiName && t.url.startsWith(`/${childPath}`))
            .length,
        };

        parentNode.children!.push(childNode);

        if (hasGrandchildren) {
          buildChildren(childPath, childNode);
        }
      });
    };

    buildChildren("", apiNode);
    trees.push(apiNode);
  });

  return trees.sort((a, b) => a.name.localeCompare(b.name));
}

// Tree node component
function TreeNodeComponent({
  node,
  level = 0,
  selectedPath,
  expandedNodes,
  onSelect,
  onToggleExpand,
}: {
  node: TreeNode;
  level?: number;
  selectedPath: string | null;
  expandedNodes: Set<string>;
  onSelect: (path: string, type: string) => void;
  onToggleExpand: (id: string) => void;
}) {
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedPath === node.path;
  const hasChildren = node.children && node.children.length > 0;

  const handleClick = () => {
    onSelect(node.path, node.type);
    if (hasChildren) {
      onToggleExpand(node.id);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(node.id);
  };

  const getIcon = () => {
    switch (node.type) {
      case "api":
        return isExpanded ? (
          <FolderOpenIcon className="h-4 w-4 text-blue-500" />
        ) : (
          <FolderIcon className="h-4 w-4 text-blue-500" />
        );
      case "folder":
        return isExpanded ? (
          <FolderOpenIcon className="h-4 w-4 text-yellow-500" />
        ) : (
          <FolderIcon className="h-4 w-4 text-yellow-500" />
        );
      case "endpoint":
        return <DocumentIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div>
      <div
        className={twMerge(
          "flex items-center px-2 py-1 cursor-pointer hover:bg-gray-100 rounded text-sm",
          isSelected && "bg-blue-50 hover:bg-blue-100",
        )}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={handleClick}
      >
        {hasChildren && (
          // Named by its node, with the state in `aria-expanded` rather than in
          // the name: an icon alone left a screen reader saying "button".
          <button
            type="button"
            onClick={handleToggle}
            aria-label={node.name}
            aria-expanded={isExpanded}
            className="p-0.5 hover:bg-gray-200 rounded mr-1"
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-3 w-3" aria-hidden="true" />
            ) : (
              <ChevronRightIcon className="h-3 w-3" aria-hidden="true" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-5 mr-1" />}

        <div className="flex items-center space-x-2 flex-1">
          {getIcon()}
          <span className={twMerge("truncate", isSelected && "font-medium")}>{node.name}</span>
          {node.transactionCount !== undefined && (
            <span className="text-[11px] text-gray-600 font-light ml-auto">{node.transactionCount}</span>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              selectedPath={selectedPath}
              expandedNodes={expandedNodes}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * TransactionsExplorerSidebar provides a hierarchical tree view of API endpoints.
 * Features the same clean design as other sidebar components in the Elements namespace.
 */
export function TransactionsExplorerSidebar({
  transactions,
  selectedPath = null,
  expandedNodes = new Set<string>(),
  onSelect = () => {},
  onToggleExpand = () => {},
  title = "API Endpoints",
  className,
  ...props
}: TransactionsExplorerSidebarProps) {
  // Build tree from transactions
  const apiTree = useMemo(() => buildApiTree(transactions), [transactions]);

  return (
    <div className={twMerge("bg-white rounded-lg shadow overflow-hidden flex flex-col", className)} {...props}>
      {/* Header - matching FiltersSidebar style */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {apiTree.length === 0 ? (
          <p className="text-sm text-gray-500 p-4 text-center">No APIs found</p>
        ) : (
          apiTree.map((node) => (
            <TreeNodeComponent
              key={node.id}
              node={node}
              selectedPath={selectedPath}
              expandedNodes={expandedNodes}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Export utility functions for external use
export { buildApiTree };
