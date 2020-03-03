package com.wmstool.wmstool.utilities;

import java.util.ArrayList;
import java.util.List;

import com.wmstool.wmstool.models.StockInfo;

public class HistoryTreeNode {

	private StockInfo stockInfo;

	private List<HistoryTreeNode> nodes = new ArrayList<>();

	public HistoryTreeNode() {
	}

	public List<HistoryTreeNode> getNodes() {
		return nodes;
	}

	public StockInfo getStockInfo() {
		return stockInfo;
	}

	public void setStockInfo(StockInfo stockInfo) {
		this.stockInfo = stockInfo;
	}

	public void setNodes(List<HistoryTreeNode> nodes) {
		this.nodes = nodes;
	}

}
