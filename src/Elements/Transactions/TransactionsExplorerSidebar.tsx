import {
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentIcon,
  FolderIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline";
import {
  type EndpointNodeType,
  type Selection,
  apiOf,
  isUnder,
  segmentsOf,
} from "@msqd/lydia/Models/Transactions/endpoints";
import type { Transaction } from "@msqd/lydia/Models/Transactions/types";
import { type ComponentProps, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";

export interface TreeNode {
  id: string;
  name: string;
  path: string;
  type: EndpointNodeType;
  apiName: string;
  /** Path segments below the API, empty for the API node. */
  segments: string[];
  children?: TreeNode[];
  transactionCount?: number;
}

export interface TransactionsExplorerSidebarProps extends Omit<ComponentProps<"div">, "onSelect"> {
  /** Transaction data to build the tree from */
  transactions: Transaction[];
  /** Currently selected node */
  selected?: Selection | null;
  /** Expanded node ids. When omitted the sidebar keeps its own, and `onToggleExpand` only reports. */
  expandedNodes?: Set<string>;
  /** Handler when a node is selected */
  onSelect?: (selection: Selection) => void;
  /** Handler when a node is expanded/collapsed */
  onToggleExpand?: (nodeId: string) => void;
  /** Custom title for the sidebar */
  title?: string;
}

function selectionOf(node: TreeNode): Selection {
  return { type: node.type, apiName: node.apiName, segments: node.segments };
}

const sameNode = (a: Selection, b: Selection) =>
  a.apiName === b.apiName && a.segments.length === b.segments.length && a.segments.every((s, i) => s === b.segments[i]);

function buildApiTree(transactions: Transaction[]): TreeNode[] {
  const segmentsByApi = new Map<string, string[][]>();
  for (const transaction of transactions) {
    const apiName = apiOf(transaction);
    segmentsByApi.set(apiName, [...(segmentsByApi.get(apiName) ?? []), segmentsOf(transaction)]);
  }

  const countUnder = (apiName: string, segments: string[]) =>
    transactions.filter((t) => isUnder(t, { apiName, segments })).length;

  const childrenOf = (apiName: string, parent: string[], paths: string[][]): TreeNode[] => {
    const below = paths.filter((p) => p.length > parent.length && parent.every((segment, i) => p[i] === segment));
    const names = new Set(below.map((p) => p[parent.length]));
    return [...names].map((name) => {
      const segments = [...parent, name];
      const children = childrenOf(apiName, segments, below);
      return {
        id: [apiName, ...segments].join("/"),
        name,
        path: [apiName, ...segments].join("/"),
        type: children.length > 0 ? "folder" : "endpoint",
        apiName,
        segments,
        children: children.length > 0 ? children : undefined,
        transactionCount: countUnder(apiName, segments),
      };
    });
  };

  return [...segmentsByApi]
    .map(
      ([apiName, paths]): TreeNode => ({
        id: apiName,
        name: apiName,
        path: apiName,
        type: "api",
        apiName,
        segments: [],
        children: childrenOf(apiName, [], paths),
        transactionCount: countUnder(apiName, []),
      }),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Tree node component
function TreeNodeComponent({
  node,
  level = 0,
  selected,
  expandedNodes,
  onSelect,
  onToggleExpand,
}: {
  node: TreeNode;
  level?: number;
  selected: Selection | null;
  expandedNodes: Set<string>;
  onSelect: (selection: Selection) => void;
  onToggleExpand: (id: string) => void;
}) {
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selected !== null && sameNode(selected, selectionOf(node));
  const hasChildren = node.children && node.children.length > 0;

  const handleClick = () => {
    onSelect(selectionOf(node));
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
              selected={selected}
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
  selected = null,
  expandedNodes: controlledExpandedNodes,
  onSelect = () => {},
  onToggleExpand,
  title = "API Endpoints",
  className,
  ...props
}: TransactionsExplorerSidebarProps) {
  const [ownExpandedNodes, setOwnExpandedNodes] = useState<Set<string>>(new Set());
  const expandedNodes = controlledExpandedNodes ?? ownExpandedNodes;

  const handleToggleExpand = (nodeId: string) => {
    if (!controlledExpandedNodes) {
      setOwnExpandedNodes((prev) => {
        const next = new Set(prev);
        if (!next.delete(nodeId)) next.add(nodeId);
        return next;
      });
    }
    onToggleExpand?.(nodeId);
  };

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
              selected={selected}
              expandedNodes={expandedNodes}
              onSelect={onSelect}
              onToggleExpand={handleToggleExpand}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Export utility functions for external use
export { buildApiTree };
export type { Selection };
