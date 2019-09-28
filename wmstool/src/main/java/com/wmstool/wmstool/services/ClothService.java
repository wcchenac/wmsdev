package com.wmstool.wmstool.services;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
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

	// Test
	public List<ClothInfo> createClothInfoes(List<InStockRequest> inStockRequests) {
		List<ClothInfo> resultList = new ArrayList<>();
		ProductNoBacklog productNoBacklog= new ProductNoBacklog();
		
		for (int i = 0; i < inStockRequests.size(); i += 1) {
			InStockRequest inStockRequest = inStockRequests.get(i);
			
			String condition = inStockRequest.getIsNew();
			ClothIdentifierBacklog resClothIdentifierBacklog = new ClothIdentifierBacklog();

			// find productNo is exist or not; if not exist, create new
			productNoBacklog = productNoBacklogRepo.findByProductNo(inStockRequest.getProductNo())
					.orElseGet(() -> productNoBacklogRepo.save(new ProductNoBacklog(inStockRequest.getProductNo())));

			// flow control,to identify newInStock process or shrinking process
			switch (condition) {
			case "new":
				// use productNoBacklog to create clothIdentifierBacklog
				ClothIdentifierBacklog clothIdentifierBacklog = new ClothIdentifierBacklog(productNoBacklog,
						inStockRequest.getType(), inStockRequest.getLength(), inStockRequest.getUnit());

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
			resultList.add(result);
		}

		// flow control, is it necessary to increase lotNo
		String condition = inStockRequests.get(0).getIsNew();
		
		if (condition.equals("new")) {
			// increase lotNo in productNoBacklog
			int newLotNo = productNoBacklog.getLotNo() + 1;
			productNoBacklog.setLotNo(newLotNo);
		}
		
		return clothInfoRepository.saveAll(resultList);
	}
	// Test	

	public List<ClothInfo> findClothInfoByProductNo(String productNo) {
		List<ClothInfo> result = new ArrayList<>();
		
		List<ClothIdentifier> res = clothIdentifierRepo.findByProductNoAndIsExist(productNo.toUpperCase(), true)
				.orElseGet(() -> new ArrayList<>());
		
		if (!res.isEmpty()) {
			res.stream().forEach(identifier -> result.add(clothInfoRepository.findByClothIdentifierId(identifier.getId()).get()));
		}

		return result;
	}

	public void letClothIdentifierNotExist(long clothIdentifierId) {
		ClothIdentifier res = clothIdentifierRepo.findById(clothIdentifierId).get();

		res.setExist(false);

//		clothIdentifierRepo.save(res);
	}

	public void letClothIdentifierisNotShiped(long clothIdentifierId) {
		ClothIdentifier res = clothIdentifierRepo.findById(clothIdentifierId).get();

		res.setExist(true);
		res.setShip(false);
		res.setShipReason(null);
		res.setShipedAt(null);
		res.setOutStock(false);
		res.setOutStockAt(null);

//		clothIdentifierRepo.save(res);
	}

	public void letClothIdentifierisShiped(ShipRequest shipRequest) {
		ClothIdentifier res = clothIdentifierRepo.findById(shipRequest.getClothIdentifierId()).get();
		Date now = new Date();

		res.setExist(false);
		res.setShip(true);
		res.setShipReason(shipRequest.getReason());
		res.setShipedAt(now);
		res.setOutStock(true);
		res.setOutStockAt(now);

//		clothIdentifierRepo.save(res);
	}

	public List<ClothInfo> getWaitToShrinkList() {
		List<ClothInfo> result = new ArrayList<>();
		List<ClothIdentifier> res = clothIdentifierRepo.findByWaitToShrinkAndIsExist(true, true)
				.orElseGet(() -> new ArrayList<>());

		if (!res.isEmpty()) {
			res.stream().forEach(identifier -> result.add(clothInfoRepository.findByClothIdentifierId(identifier.getId()).get()));
		}

		return result;
	}

	public String letClothIdentifierWaitToShrinkIsTrue(long clothIdentifierId) {
		ClothIdentifier res = clothIdentifierRepo.findById(clothIdentifierId).get();
		Date now = new Date();

		res.setWaitToShrink(true);
		res.setWaitShrinkedAt(now);
		res.setOutStock(true);
		res.setOutStockAt(now);

		return res.getProductNo();
//		return clothIdentifierRepo.save(res).getProductNo();
	}

	public void letClothIdentifierWaitToShrinkIsFalse(long clothIdentifierId) {
		ClothIdentifier res = clothIdentifierRepo.findById(clothIdentifierId).get();

		res.setWaitToShrink(false);
		res.setWaitShrinkedAt(null);
		res.setOutStock(false);
		res.setOutStockAt(null);

//		clothIdentifierRepo.save(res);
	}

	public Page<ClothIdentifier> getOutStockWaitHandleList(boolean isOutStock, Date startFrom) {
		Specification<ClothIdentifier> specification = new Specification<ClothIdentifier>() {

			@Override
			public Predicate toPredicate(Root<ClothIdentifier> root, CriteriaQuery<?> query,
					CriteriaBuilder criteriaBuilder) {
				List<Predicate> predicatesList = new ArrayList<>();

				if (isOutStock) {
					Predicate isOutStockPredicate = criteriaBuilder.equal(root.get("isOutStock"), isOutStock);
					predicatesList.add(isOutStockPredicate);
				}

				if (startFrom != null) {
					Predicate startFromPredicate = criteriaBuilder.between(root.get("outStockAt"), startFrom,
							new Date());
					predicatesList.add(startFromPredicate);
				}

				// order by outStock date then order by type
				query.orderBy(criteriaBuilder.asc(root.get("outStockAt")), criteriaBuilder.asc(root.get("type")));

				Predicate[] predicates = new Predicate[predicatesList.size()];

				return criteriaBuilder.and(predicatesList.toArray(predicates));
			}

		};

		return clothIdentifierRepo.findAll(specification, PageRequest.of(0, 10));
	}

}
