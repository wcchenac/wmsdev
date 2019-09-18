package com.wmstool.wmstool.services;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wmstool.wmstool.models.ClothIdentifier;
import com.wmstool.wmstool.models.ClothIdentifierBacklog;
import com.wmstool.wmstool.models.ClothInfo;
import com.wmstool.wmstool.models.ProductNoBacklog;
import com.wmstool.wmstool.models.history.History;
import com.wmstool.wmstool.models.payloads.InStockRequest;
import com.wmstool.wmstool.models.payloads.ShipRequest;
import com.wmstool.wmstool.repositories.ClothIdentifierBacklogRepo;
import com.wmstool.wmstool.repositories.ClothIdentifierRepo;
import com.wmstool.wmstool.repositories.ClothInfoRepository;
import com.wmstool.wmstool.repositories.HistoryRepository;
import com.wmstool.wmstool.repositories.ProductNoBacklogRepo;

@Service
@Transactional
public class ClothService {

	@Autowired
	private ProductNoBacklogRepo productNoBacklogRepo;

	@Autowired
	private ClothIdentifierRepo clothIdentifierRepo;

	@Autowired
	private ClothIdentifierBacklogRepo clothIdentifierBacklogRepo;

	@Autowired
	private ClothInfoRepository clothInfoRepository;

	@Autowired
	private HistoryRepository historyRepository;

	public ClothInfo createClothInfo(InStockRequest inStockRequest) {
		String condition = inStockRequest.getIsNew();
		ClothIdentifierBacklog resClothIdentifierBacklog = new ClothIdentifierBacklog();

		// find productNo is exist or not; if not exist, create new
		ProductNoBacklog productNoBacklog = productNoBacklogRepo.findByProductNo(inStockRequest.getProductNo())
				.orElseGet(() -> productNoBacklogRepo.save(new ProductNoBacklog(inStockRequest.getProductNo())));

		switch (condition) {
		case "new":
			// use productNoBacklog to create clothIdentifierBacklog
			ClothIdentifierBacklog clothIdentifierBacklog = new ClothIdentifierBacklog(productNoBacklog,
					inStockRequest.getType(), inStockRequest.getLength(), inStockRequest.getUnit());

			// increase lotNo in productNoBacklog
			int newLotNo = productNoBacklog.getLotNo() + 1;
			productNoBacklog.setLotNo(newLotNo);

			// find clothIdentifierBacklog is exist or not; if not exist, create new
			resClothIdentifierBacklog = clothIdentifierBacklogRepo
					.findByProductNoAndLotNoAndTypeAndLengthAndUnit(clothIdentifierBacklog.getProductNo(),
							clothIdentifierBacklog.getLotNo(), clothIdentifierBacklog.getType(),
							clothIdentifierBacklog.getLength(), clothIdentifierBacklog.getUnit())
					.orElseGet(() -> clothIdentifierBacklogRepo.save(clothIdentifierBacklog));

			break;
		case "old":
			// use inStockRequest to create clothIdentifierBacklog
			ClothIdentifierBacklog clothIdentifierBacklog1 = new ClothIdentifierBacklog(productNoBacklog,
					inStockRequest.getProductNo(), inStockRequest.getLotNo(), inStockRequest.getType(),
					inStockRequest.getLength(), inStockRequest.getUnit());

			// find clothIdentifierBacklog is exist or not; if not exist, create new
			resClothIdentifierBacklog = clothIdentifierBacklogRepo
					.findByProductNoAndLotNoAndTypeAndLengthAndUnit(clothIdentifierBacklog1.getProductNo(),
							clothIdentifierBacklog1.getLotNo(), clothIdentifierBacklog1.getType(),
							clothIdentifierBacklog1.getLength(), clothIdentifierBacklog1.getUnit())
					.orElseGet(() -> clothIdentifierBacklogRepo.save(clothIdentifierBacklog1));
			break;
		default:
			break;
		}

		// use clothIdentifierBacklog to save clothIdentifier
		ClothIdentifier clothIdentifier = new ClothIdentifier(resClothIdentifierBacklog);
		ClothIdentifier resIdentifier = clothIdentifierRepo.save(clothIdentifier);

		// history function code start
		History newHistory = new History();
		long resIdentifierId = resIdentifier.getId();

		newHistory.setCurrentId(resIdentifierId);

		switch (condition) {
		case "new":
			newHistory.setRootId(resIdentifierId);
			newHistory.setRoot(true);
			break;
		case "old":
			// use the data "parentId" from inStockRequest as key to find the parent
			// TODO: wait handle exception
			History oldHistory = historyRepository.findByCurrentId(inStockRequest.getParentId()).get();
			// type exchange: array to list
			List<Long> oldChildrenList = Arrays.stream(oldHistory.getChildrenId()).collect(Collectors.toList());
			oldChildrenList.add(resIdentifierId);
			// type exchange: list to array
			Long[] oldHistoryArr = oldChildrenList.toArray(oldHistory.getChildrenId());
			oldHistory.setChildrenId(oldHistoryArr);
			// update oldHistory/rootHistory
			historyRepository.save(oldHistory);

			newHistory.setRootId(oldHistory.getRootId());
			break;
		default:
			break;
		}

		historyRepository.save(newHistory);
		// history function code end

		// increase serialotNo in clothIdentifierBacklog
		int newSerialNo = resClothIdentifierBacklog.getSerialNo() + 1;
		resClothIdentifierBacklog.setSerialNo(newSerialNo);

		// use clothIdentifier to create clothInfo
		ClothInfo result = new ClothInfo(clothIdentifier, inStockRequest.getColor(), inStockRequest.getDefect(),
				inStockRequest.getRecord());

		return clothInfoRepository.save(result);
	}

	public List<ClothInfo> findClothInfoByProductNo(String productNo) {
		List<ClothInfo> result = new ArrayList<>();
		List<ClothIdentifier> res = clothIdentifierRepo.findByProductNoAndIsExist(productNo, true)
				.orElseGet(() -> new ArrayList<>());
		if (!res.isEmpty()) {
			res.stream().forEach(identifier -> result.add(clothInfoRepository.findById(identifier.getId()).get()));
		}
		return result;
	}

	public void letClothIdentifierNotExist(long clothIdentifierId) {
		ClothIdentifier res = clothIdentifierRepo.findById(clothIdentifierId).get();
		res.setExist(false);
		clothIdentifierRepo.save(res);
	}

	public void letClothIdentifierisShiped(ShipRequest shipRequest) {
		ClothIdentifier res = clothIdentifierRepo.findById(shipRequest.getClothIdentifierId()).get();
		res.setExist(false);
		res.setShip(true);
		res.setShipReason(shipRequest.getReason());
		clothIdentifierRepo.save(res);
	}

}