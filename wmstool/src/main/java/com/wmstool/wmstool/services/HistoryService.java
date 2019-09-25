package com.wmstool.wmstool.services;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.wmstool.wmstool.models.history.History;
import com.wmstool.wmstool.repositories.ClothIdentifierRepo;
import com.wmstool.wmstool.repositories.HistoryRepository;
import com.wmstool.wmstool.utilities.HistoryTreeNode;

@Service
public class HistoryService {

	@Autowired
	private HistoryRepository historyRepo;

	@Autowired
	private ClothIdentifierRepo clothIdentifierRepo;

	public History findHistoryByCurrentId(long id) {
		return historyRepo.findByCurrentId(id).get();
	}

	public ResponseEntity<?> createHistoryTree(long rootId) {
		return new ResponseEntity<HistoryTreeNode>(collectDataForTree(rootId), HttpStatus.OK);
	}

	private HistoryTreeNode collectDataForTree(long rootId) {
		History root = historyRepo.findByCurrentId(rootId).get();
		Long[] childrenId = root.getChildrenId();

		HistoryTreeNode source = new HistoryTreeNode();
		source.setClothIdentifier(clothIdentifierRepo.findById(rootId).get());
		
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
