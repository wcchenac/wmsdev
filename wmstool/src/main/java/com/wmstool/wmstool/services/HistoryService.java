package com.wmstool.wmstool.services;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.wmstool.wmstool.models.History;
import com.wmstool.wmstool.repositories.HistoryRepository;
import com.wmstool.wmstool.repositories.StockIdentifierRepo;
import com.wmstool.wmstool.utilities.HistoryTreeNode;

@Service
//@PreAuthorize("hasRole('Role_Operator') or hasRole('Role_Admin')")
public class HistoryService {

	@Autowired
	private HistoryRepository historyRepo;

	@Autowired
	private StockIdentifierRepo stockIdentifierRepo;

	public History findHistoryByCurrentId(long id) {
		// TODO: data not found exception
		return historyRepo.findByCurrentIdentifierId(id).get();
	}

	public HistoryTreeNode createHistoryTreeByIdentifierId(long rootId) {
		return collectDataForTree(rootId);
	}

	private HistoryTreeNode collectDataForTree(long rootId) {
		// TODO: data not found exception
		History root = historyRepo.findByCurrentIdentifierId(rootId).get();
		Long[] childrenId = root.getChildrenIdentifierId();

		HistoryTreeNode source = new HistoryTreeNode();
		// TODO: data not found exception
		source.setStockIdentifier(stockIdentifierRepo.findById(rootId).get());

		if (childrenId.length == 0) {
			return source;
		}

		List<Long> childrenIdList = Arrays.stream(childrenId).collect(Collectors.toList());

		while (!childrenIdList.isEmpty()) {
			long childId = childrenIdList.remove(0);
			source.getNodes().add(collectDataForTree(childId));
		}

		return source;
	}

}
