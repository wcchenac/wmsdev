import React, { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useUpdateEffect } from "../../../../utilities/useUpdateEffect";
import { getProductHistory } from "../../../../actions/StockActions";
import { dayOfStart, dayOfEnd, setPreviousMonth } from "../Utilities/DateUtils";
import QueryProductInformation, { ProductNoChange } from "../Utilities/QueryProductInformation";
import DatePeriodSelectModal from "../Utilities/DatePeriodSelectModal";
import LoadingOverlay from "react-loading-overlay-ts";
import { Spinner } from "../../../Others/Spinner";
import TreeDataNode from "./TreeDataNode";
import Box from "@mui/material/Box";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { RootState, AppDispatch, StockInfo, TreeNode, ApiResponse } from "../../../../types";
import { notifyRequestFailed } from "../../../../utilities/notifyRequestFailed";

const dayRangeSetting = 180;

// Raw data structure from API
interface RawHistoryNode {
  stockInfo: StockInfo;
  nodes?: RawHistoryNode[];
}

// The shared stockInfo slice also holds other pages' results; only history roots have a
// stockInfo object.
const isHistoryNode = (value: unknown): value is RawHistoryNode =>
  typeof value === "object" && value !== null && "stockInfo" in value &&
  typeof value.stockInfo === "object" && value.stockInfo !== null;

function StockHistoryBoard(): React.ReactElement {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isQuery, setIsQuery] = useState<boolean>(false);
  const [productNo, setProductNo] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(setPreviousMonth(dayOfStart(new Date()), 1));
  const [endDate, setEndDate] = useState<Date>(dayOfEnd(new Date()));
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const dispatch = useDispatch<AppDispatch>();
  const stockInfo = useSelector((state: RootState) => state.stockInfo);

  const transversalForTreeData = (raw: RawHistoryNode, path: string): TreeNode => {
    const node: TreeNode = {
      id: path,
      stockInfo: raw.stockInfo,
      children: []
    };

    if (raw.nodes && raw.nodes.length > 0) {
      node.children = raw.nodes.map((child, idx) =>
        transversalForTreeData(child, `${path}-${idx}`)
      );
    }

    return node;
  };

  const treeDataTranslation = useCallback((data: unknown): TreeNode[] => {
    // Product history is an array of root nodes; anything else (another query's result) has no tree.
    if (!Array.isArray(data)) return [];
    return data.filter(isHistoryNode).map((item, idx) => transversalForTreeData(item, `${idx}`));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only react to a result that arrives while this page is mounted, not one another page
  // left in the shared stockInfo slice (componentDidUpdate in dev).
  useUpdateEffect(stockInfo.stockInfoes, (result) => {
    setTreeData(treeDataTranslation(result));
  });

  const handleProductNoChange = useCallback((e: ProductNoChange) => {
    setProductNo(e.target.value);
  }, []);

  const handleEndDateSelection = useCallback((date: Date | null) => {
    if (date) {
      setEndDate(dayOfEnd(date));
    }
  }, []);

  const handleStartDateSelectionWrapper = useCallback((date: Date | null) => {
    if (date) {
      setStartDate(dayOfStart(date));
    }
  }, []);

  const handleDateSelectionModeClick = useCallback(() => {
    // No-op for StockHistory - date selection is already handled
  }, []);

  const handleQuerySubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const request = {
      productNo,
      startDate: startDate.toJSON().substring(0, 19),
      endDate: endDate.toJSON().substring(0, 19)
    };

    setIsLoading(true);
    dispatch(getProductHistory(request)).then((response: ApiResponse) => {
      if (response?.status === 200) {
        setIsLoading(false);
        setIsQuery(true);
      }
    }).catch((error) => {
      setIsLoading(false);
      notifyRequestFailed(error);
    });
  }, [dispatch, productNo, startDate, endDate]);

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const renderTreeNode = (node: TreeNode, level: number = 0): React.ReactElement => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);

    return (
      <Box key={node.id} sx={{ ml: level * 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            py: 1,
            borderBottom: "1px solid #eee"
          }}
        >
          {hasChildren ? (
            <Box
              onClick={() => toggleNode(node.id)}
              sx={{ cursor: "pointer", mr: 1, mt: 0.5 }}
            >
              {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </Box>
          ) : (
            <Box sx={{ width: 24, mr: 1 }} />
          )}
          <TreeDataNode stockInfo={node.stockInfo as Parameters<typeof TreeDataNode>[0]["stockInfo"]} />
        </Box>
        {hasChildren && isExpanded && (
          <Box>
            {node.children.map((child) => renderTreeNode(child, level + 1))}
          </Box>
        )}
      </Box>
    );
  };

  const contentAlgorithm = (): React.ReactElement | null => {
    if (!isQuery) return null;

    if (treeData.length === 0) {
      return (
        <div className="row justify-content-md-center">
          <div className="col-md-6">
            <div className="alert alert-warning" role="alert">
              <p className="h5 text-center mb-0">
                查無此貨號資料 或 此貨號設定期間內無進貨資料
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <Box sx={{ height: "70vh", overflow: "auto" }}>
        {treeData.map((node) => renderTreeNode(node))}
      </Box>
    );
  };

  return (
    <div className="stockHistoryBoard">
      <div className="container">
        <div className="row">
          <div className="col-md-auto">
            <QueryProductInformation
              productNo={productNo}
              onChange={handleProductNoChange}
              onSubmit={handleQuerySubmit}
            />
          </div>
          <div className="col-md-auto">
            <DatePeriodSelectModal
              btnTitle={"設定時間區間"}
              fileType="stockHistory"
              startDate={startDate}
              endDate={endDate}
              handleStartDateSelection={handleStartDateSelectionWrapper}
              handleEndDateSelection={handleEndDateSelection}
              handleDateSelectionModeClick={handleDateSelectionModeClick}
              dayRange={dayRangeSetting}
            />
          </div>
          <div className="col-md-auto">
            <button className="btn-customize" disabled>
              <small className="text-muted">若無設定，預設查詢前一個月</small>
            </button>
          </div>
        </div>
        <hr />
        <LoadingOverlay active={isLoading} spinner={<Spinner />}>
          <div className="scrollbar-70" style={{ height: "75vh" }}>
            {contentAlgorithm()}
          </div>
        </LoadingOverlay>
      </div>
    </div>
  );
}

export default StockHistoryBoard;
