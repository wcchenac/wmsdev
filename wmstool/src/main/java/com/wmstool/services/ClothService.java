package com.wmstool.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wmstool.models.ClothIdentifier;
import com.wmstool.models.ClothIdentifierBacklog;
import com.wmstool.models.ClothInfo;
import com.wmstool.models.ProductNoBacklog;
import com.wmstool.models.payloads.InStockRequest;
import com.wmstool.repositories.ClothIdentifierBacklogRepo;
import com.wmstool.repositories.ClothIdentifierRepo;
import com.wmstool.repositories.ClothInfoRepository;
import com.wmstool.repositories.ProductNoBacklogRepo;

@Service
public class ClothService {

	@Autowired
	private ProductNoBacklogRepo productNoBacklogRepo;

	@Autowired
	private ClothIdentifierRepo clothIdentifierRepo;

	@Autowired
	private ClothIdentifierBacklogRepo clothIdentifierBacklogRepo;

	@Autowired
	private ClothInfoRepository clothInfoRepository;

	public ClothInfo createClothInfo(InStockRequest inStockRequest, String condition) {

		// find productNo is exist or not; if not exist, create new
		ProductNoBacklog productNoBacklog = productNoBacklogRepo.findByProductNo(inStockRequest.getProductNo())
				.orElseGet(() -> productNoBacklogRepo.save(new ProductNoBacklog(inStockRequest.getProductNo())));

		// use productNoBacklog to create clothIdentifierBacklog
		ClothIdentifierBacklog clothIdentifierBacklog = new ClothIdentifierBacklog(productNoBacklog,
				inStockRequest.getType(), inStockRequest.getLength(), inStockRequest.getUnit());

		// increase lotNo in productNoBacklog
		switch (condition) {
		case "new":
			int newLotNo = productNoBacklog.getLotNo() + 1;
			productNoBacklog.setLotNo(newLotNo);
			break;
		case "old":
			break;
		default:
			break;
		}

		// find clothIdentifierBacklog is exist or not; if not exist, create new
		ClothIdentifierBacklog resClothIdentifierBacklog = clothIdentifierBacklogRepo
				.findByProductNoAndLotNoAndTypeAndLengthAndUnit(clothIdentifierBacklog.getProductNo(),
						clothIdentifierBacklog.getLotNo(), clothIdentifierBacklog.getType(),
						clothIdentifierBacklog.getLength(), clothIdentifierBacklog.getUnit())
				.orElseGet(() -> clothIdentifierBacklogRepo.save(clothIdentifierBacklog));

		// use clothIdentifierBacklog to save clothIdentifier
		ClothIdentifier clothIdentifier = new ClothIdentifier(resClothIdentifierBacklog);
		clothIdentifierRepo.save(clothIdentifier);

		// increase serialotNo in clothIdentifierBacklog
		int newSerialNo = resClothIdentifierBacklog.getSerialNo() + 1;
		resClothIdentifierBacklog.setSerialNo(newSerialNo);

		// use clothIdentifier to create clothInfo
		ClothInfo clothInfo = new ClothInfo(clothIdentifier, inStockRequest.getColor(), inStockRequest.getDefect(),
				inStockRequest.getRecord());

		return clothInfoRepository.save(clothInfo);
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
	
	public void letClothIdentifierisSaled(long clothIdentifierId) {
		ClothIdentifier res = clothIdentifierRepo.findById(clothIdentifierId).get();
		res.setSale(true);
		clothIdentifierRepo.save(res);
	}

}
