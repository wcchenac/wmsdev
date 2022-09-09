package com.wmstool.wmstool.services;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wmstool.wmstool.models.History;
import com.wmstool.wmstool.models.StockInfo;
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

	public HistoryTreeNode createHistoryTreeByIdentifierId(long identifierId) {
		return collectDataForTreeByIdentifierId(identifierId, null);
	}

	public HistoryTreeNode createHistoryTreeByRootIdentifierId(long rootId, Map<Long, StockInfo> idInfoMap) {
		return collectDataForTreeByRootId(rootId, idInfoMap);
	}

	private HistoryTreeNode collectDataForTreeByIdentifierId(long identifierId, Map<Long, StockInfo> idInfoMap) {
		// TODO: data not found exception
		History root = historyRepo.findByCurrentIdentifierId(identifierId).get();
		Long[] childrenId = root.getChildrenIdentifierId();

		HistoryTreeNode source = new HistoryTreeNode();
		// TODO: data not found exception

		if (idInfoMap == null) {
			source.setStockInfo(stockInfoRepository.findByStockIdentifierId(identifierId).get());
		} else {
			source.setStockInfo(idInfoMap.get(identifierId));
		}

		if (childrenId.length == 0) {
			return source;
		}

		List<Long> childrenIdList = Arrays.stream(childrenId).collect(Collectors.toList());

		while (!childrenIdList.isEmpty()) {
			long childId = childrenIdList.remove(0);
			source.getNodes().add(collectDataForTreeByIdentifierId(childId, idInfoMap));
		}

		return source;
	}
	
	private HistoryTreeNode collectDataForTreeByRootId(long rootId, Map<Long, StockInfo> idInfoMap) {
		// TODO: data not found exception
		List<History> mine = historyRepo.findByRootIdentifierId(rootId);
		Map<Long, History> mineMap = new HashMap<>();
		mine.forEach(history -> mineMap.put(history.getCurrentIdentifierId(), history));
		
		History root = mineMap.get(rootId);
		Long[] childrenId = root.getChildrenIdentifierId();

		HistoryTreeNode source = new HistoryTreeNode();
		// TODO: data not found exception

		if (idInfoMap == null) {
			source.setStockInfo(stockInfoRepository.findByStockIdentifierId(rootId).get());
		} else {
			source.setStockInfo(idInfoMap.get(rootId));
		}

		if (childrenId.length == 0) {
			return source;
		}

		List<Long> childrenIdList = Arrays.stream(childrenId).collect(Collectors.toList());

		while (!childrenIdList.isEmpty()) {
			long childId = childrenIdList.remove(0);
			source.getNodes().add(_collectDataForTreeByRootId(childId, mineMap, idInfoMap));
		}

		return source;
	}
	
	private HistoryTreeNode _collectDataForTreeByRootId(long childId, Map<Long, History> mineMap, Map<Long, StockInfo> idInfoMap) {
		History root = mineMap.get(childId);
		Long[] childrenId = root.getChildrenIdentifierId();

		HistoryTreeNode source = new HistoryTreeNode();
		// TODO: data not found exception

		if (idInfoMap == null) {
			source.setStockInfo(stockInfoRepository.findByStockIdentifierId(childId).get());
		} else {
			source.setStockInfo(idInfoMap.get(childId));
		}

		if (childrenId.length == 0) {
			return source;
		}

		List<Long> childrenIdList = Arrays.stream(childrenId).collect(Collectors.toList());

		while (!childrenIdList.isEmpty()) {
			long grandChildId = childrenIdList.remove(0);
			source.getNodes().add(_collectDataForTreeByRootId(grandChildId, mineMap, idInfoMap));
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
