package com.wmstool.wmstool.services;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wmstool.wmstool.models.History;
import com.wmstool.wmstool.repositories.HistoryRepository;
import com.wmstool.wmstool.repositories.StockInfoRepository;
import com.wmstool.wmstool.utilities.HistoryTreeNode;

@Service
public class HistoryService {

	@Autowired
	private HistoryRepository historyRepo;

	@Autowired
	private StockInfoRepository stockInfoRepository;

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
		source.setStockInfo(stockInfoRepository.findByStockIdentifierId(rootId).get());

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

	public History findById(Long id) {
		return historyRepo.findById(id).get();
	}

	public History save(Long id) {
		History tmp = historyRepo.findById(id).get();

		Long[] a = { 80757L, 80758L, 80759L, 80760L, 80762L, 80764L, 80765L };

		tmp.setChildrenIdentifierId(a);

		return historyRepo.save(tmp);
	}
}
