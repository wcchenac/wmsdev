package com.wmstool.wmstool.utilities;

import java.util.ArrayList;
import java.util.List;

import com.wmstool.wmstool.models.StockIdentifier;

public class HistoryTreeNode {

	private StockIdentifier stockIdentifier;

	private List<HistoryTreeNode> nodes = new ArrayList<>();

	public HistoryTreeNode() {
	}

	public StockIdentifier getStockIdentifier() {
		return stockIdentifier;
	}

	public void setStockIdentifier(StockIdentifier stockIdentifier) {
		this.stockIdentifier = stockIdentifier;
	}

	public List<HistoryTreeNode> getNodes() {
		return nodes;
	}

	public void setNodes(List<HistoryTreeNode> nodes) {
		this.nodes = nodes;
	}

	@Override
	public String toString() {
		return "HistoryTreeNode [clothInfo=" + stockIdentifier + ", nodes=" + nodes + "]";
	}

}
