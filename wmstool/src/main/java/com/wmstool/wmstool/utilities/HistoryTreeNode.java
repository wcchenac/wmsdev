package com.wmstool.wmstool.utilities;

import java.util.ArrayList;
import java.util.List;

import com.wmstool.wmstool.models.StockIdentifier;

public class HistoryTreeNode {

	private StockIdentifier clothIdentifier;

	private List<HistoryTreeNode> nodes = new ArrayList<>();

	public HistoryTreeNode() {
	}

	public StockIdentifier getClothIdentifier() {
		return clothIdentifier;
	}

	public void setClothIdentifier(StockIdentifier clothIdentifier) {
		this.clothIdentifier = clothIdentifier;
	}

	public List<HistoryTreeNode> getNodes() {
		return nodes;
	}

	public void setNodes(List<HistoryTreeNode> nodes) {
		this.nodes = nodes;
	}

	@Override
	public String toString() {
		return "HistoryTreeNode [clothInfo=" + clothIdentifier + ", nodes=" + nodes + "]";
	}

}
