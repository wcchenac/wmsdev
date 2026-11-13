declare module "react-loading-overlay" {
  import type { ComponentType, ReactNode } from "react";

  interface LoadingOverlayProps {
    active?: boolean;
    spinner?: boolean | ReactNode;
    text?: ReactNode;
    className?: string;
    fadeSpeed?: number;
    onClick?: () => void;
    children?: ReactNode;
  }

  const LoadingOverlay: ComponentType<LoadingOverlayProps>;
  export default LoadingOverlay;
}

declare module "react-loader-spinner" {
  import type { ComponentType } from "react";

  interface LoaderProps {
    type: string;
    color?: string;
    height?: number | string;
    width?: number | string;
    timeout?: number;
  }

  const Loader: ComponentType<LoaderProps>;
  export default Loader;
}

declare module "react-sortable-tree" {
  import type { ComponentType, CSSProperties, ReactNode } from "react";

  export interface TreeItem {
    title?: ReactNode;
    subtitle?: ReactNode;
    expanded?: boolean;
    children?: TreeItem[];
    [key: string]: unknown;
  }

  export interface SortableTreeProps {
    treeData: TreeItem[];
    onChange: (treeData: TreeItem[]) => void;
    getNodeKey?: (data: { node: TreeItem; treeIndex: number }) => string | number;
    generateNodeProps?: (data: {
      node: TreeItem;
      path: number[];
      treeIndex: number;
      lowerSiblingCounts: number[];
    }) => {
      buttons?: ReactNode[];
      style?: CSSProperties;
      title?: ReactNode;
      subtitle?: ReactNode;
      className?: string;
    };
    canDrag?: boolean | ((data: { node: TreeItem; path: number[] }) => boolean);
    canDrop?: (data: unknown) => boolean;
    rowHeight?: number | ((data: { node: TreeItem; path: number[] }) => number);
    isVirtualized?: boolean;
    maxDepth?: number;
    searchQuery?: string;
    style?: CSSProperties;
  }

  const SortableTree: ComponentType<SortableTreeProps>;
  export default SortableTree;
}

declare module "react-sortable-tree/style.css";
