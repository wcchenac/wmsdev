package com.wmstool.wmstool.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.wmstool.wmstool.models.ClothIdentifier;
import com.wmstool.wmstool.models.ClothIdentifierBacklog;
import com.wmstool.wmstool.models.ClothInfo;
import com.wmstool.wmstool.models.OutStockRequest;
import com.wmstool.wmstool.models.history.History;
import com.wmstool.wmstool.models.payloads.HandleListResponse;
import com.wmstool.wmstool.models.payloads.InStockRequest;
import com.wmstool.wmstool.models.payloads.ShipRequest;
import com.wmstool.wmstool.models.payloads.ShrinkStockRequest;
import com.wmstool.wmstool.repositories.ClothIdentifierBacklogRepo;
import com.wmstool.wmstool.repositories.ClothIdentifierRepo;
import com.wmstool.wmstool.repositories.ClothInfoRepository;
import com.wmstool.wmstool.repositories.HistoryRepository;
//import com.wmstool.wmstool.repositories.ProductNoBacklogRepo;
import com.wmstool.wmstool.repositories.OutStockRequestRepo;

@Service
@Transactional
public class ClothService {

	/*
	@Autowired
	private ProductNoBacklogRepo productNoBacklogRepo;
	*/

	@Autowired
	private ClothIdentifierRepo clothIdentifierRepo;

	@Autowired
	private ClothIdentifierBacklogRepo clothIdentifierBacklogRepo;

	@Autowired
	private ClothInfoRepository clothInfoRepository;

	@Autowired
	private HistoryRepository historyRepository;
	
	@Autowired
	private OutStockRequestRepo outStockRequestRepo;
	
	// To be deprecated
	/*
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
	*/

	/* Test
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
	*/

	// re-factor for LotNo 
	public List<ClothInfo> createClothInfoes(List<InStockRequest> inStockRequests) {
		List<ClothInfo> resultList = new ArrayList<>();
		
		for (int i = 0; i < inStockRequests.size(); i += 1) {
			InStockRequest inStockRequest = inStockRequests.get(i);
			
			String condition = inStockRequest.getIsNew();
			ClothIdentifierBacklog resClothIdentifierBacklog = new ClothIdentifierBacklog();

			// use inStockRequest to create clothIdentifierBacklog
			ClothIdentifierBacklog clothIdentifierBacklog = new ClothIdentifierBacklog(
					inStockRequest.getProductNo(), inStockRequest.getLotNo(), inStockRequest.getType(),
					inStockRequest.getLength(), inStockRequest.getUnit());
			
			// find clothIdentifierBacklog is exist or not; if not exist, create new
			resClothIdentifierBacklog = clothIdentifierBacklogRepo
					.findByProductNoAndLotNoAndTypeAndLengthAndUnit(clothIdentifierBacklog.getProductNo(),
							clothIdentifierBacklog.getLotNo(), clothIdentifierBacklog.getType(),
							clothIdentifierBacklog.getLength(), clothIdentifierBacklog.getUnit())
					.orElseGet(() -> clothIdentifierBacklogRepo.save(clothIdentifierBacklog));

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
			resultList.add(new ClothInfo(clothIdentifier, inStockRequest.getColor(), inStockRequest.getDefect(),
					inStockRequest.getRecord()));
			
		}
		
		return clothInfoRepository.saveAll(resultList);
	}
	
	public List<ClothInfo> findClothInfoByProductNo(String productNo) {
		List<ClothInfo> result = new ArrayList<>();
		
		List<ClothIdentifier> res = clothIdentifierRepo.findByProductNoAndIsExist(productNo.toUpperCase(), true)
				.orElseGet(() -> new ArrayList<>());
		
		if (!res.isEmpty()) {
			res.stream().forEach(identifier -> result.add(clothInfoRepository.findByClothIdentifierId(identifier.getId()).get()));
		}

		return result;
	}

	// Test
	public void shrinkCloth(ShrinkStockRequest shrinkStockRequest) {
		// find old clothIdentifier, and set to not exist
		ClothIdentifier res = clothIdentifierRepo.findById(shrinkStockRequest.getOldClothIdentifierId()).get();

		res.setExist(false);
		
		// then batch create new cloth
		createClothInfoes(shrinkStockRequest.getInStockRequests());
	}
	// Test
	
	// To be deprecated
	public void letClothIdentifierNotExist(long clothIdentifierId) {
		ClothIdentifier res = clothIdentifierRepo.findById(clothIdentifierId).get();

		res.setExist(false);

//		clothIdentifierRepo.save(res);
	}

	public void letClothIdentifierisNotShiped(long clothIdentifierId) {
		ClothIdentifier res = clothIdentifierRepo.findById(clothIdentifierId).get();

		// TODO: if rollback, delete data in OutStockRequest
		
		res.setExist(true);
		res.setShip(false);
		res.setShipReason(null);
//		res.setShipedAt(null);
		res.setOutStock(false);
		res.setOutStockAt(null);

//		clothIdentifierRepo.save(res);
	}

	public void letClothIdentifierisShiped(ShipRequest shipRequest) {
		ClothIdentifier res = clothIdentifierRepo.findById(shipRequest.getClothIdentifierId()).get();
//		Date now = new Date();
		OutStockRequest outStockRequest = new OutStockRequest(res.getProductNo(), res.getType(), res.getLength(), res.getUnit(), shipRequest.getReason(), res.getId());
		
		res.setExist(false);
		res.setShip(true);
		res.setShipReason(shipRequest.getReason());
//		res.setShipedAt(now);
		res.setOutStock(true);
		res.setOutStockAt(LocalDateTime.now());

		outStockRequestRepo.save(outStockRequest);
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
//		Date now = new Date();
		OutStockRequest outStockRequest = new OutStockRequest(res.getProductNo(), res.getType(), res.getLength(), res.getUnit(),"減肥", res.getId());

		res.setWaitToShrink(true);
//		res.setWaitShrinkedAt(now);
		res.setOutStock(true);
		res.setOutStockAt(LocalDateTime.now());
		
		outStockRequestRepo.save(outStockRequest);
		
		return res.getProductNo();
//		return clothIdentifierRepo.save(res).getProductNo();
	}

	public void letClothIdentifierWaitToShrinkIsFalse(long clothIdentifierId) {
		ClothIdentifier res = clothIdentifierRepo.findById(clothIdentifierId).get();

		// if rollback, delete data in OutStockRequest
		
		res.setWaitToShrink(false);
//		res.setWaitShrinkedAt(null);
		res.setOutStock(false);
		res.setOutStockAt(null);

//		clothIdentifierRepo.save(res);
	}

	public OutStockRequest createOutStockRequest(OutStockRequest outStockRequest) {
		return outStockRequestRepo.save(outStockRequest);
	}
	
	public HandleListResponse getOutStockWaitHandleList() {
		LocalDateTime today = LocalDate.now().atStartOfDay();
		
		Specification<OutStockRequest> specification = new Specification<OutStockRequest>() {

			@Override
			public Predicate toPredicate(Root<OutStockRequest> root, CriteriaQuery<?> query,
					CriteriaBuilder criteriaBuilder) {
				List<Predicate> predicatesList = new ArrayList<>();

				if (today != null) {
					Predicate startFromPredicate = criteriaBuilder.greaterThan(root.get("createdAt"), today);
					predicatesList.add(startFromPredicate);
				}

				// order by outStock productNo then order by type
				query.orderBy(criteriaBuilder.asc(root.get("productNo")), criteriaBuilder.asc(root.get("type")));

				Predicate[] predicates = new Predicate[predicatesList.size()];

				return criteriaBuilder.and(predicatesList.toArray(predicates));
			}

		};

		// query results after filter
		List<OutStockRequest> resultList = outStockRequestRepo.findAll(specification);
		
		Map<String, List<OutStockRequest>> resultMap = new HashMap<>();
		Set<String> userSet = new HashSet<>();
		DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;

		// store the results at the certain day in the Map
		resultMap.put(today.format(formatter), resultList);
		
		// collect all users showing within createdBy attribute
		resultList.forEach(outStockRequest->{if (!userSet.contains(outStockRequest.getCreatedBy())){
			userSet.add(outStockRequest.getCreatedBy());
		}});
		
		HandleListResponse res = new HandleListResponse(userSet.stream().collect(Collectors.toList()), resultMap);
		
		return res;
	}
	
	public HandleListResponse getOutStockWaitHandleListWithTimeInterval(String start, String end) {
		LocalDateTime startDateTime = LocalDateTime.parse(start,DateTimeFormatter.ISO_LOCAL_DATE_TIME).plusHours(8);
		LocalDateTime endDateTime= LocalDateTime.parse(end,DateTimeFormatter.ISO_LOCAL_DATE_TIME).plusHours(8);
		
		Specification<OutStockRequest> specification = new Specification<OutStockRequest>() {

			@Override
			public Predicate toPredicate(Root<OutStockRequest> root, CriteriaQuery<?> query,
					CriteriaBuilder criteriaBuilder) {
				List<Predicate> predicatesList = new ArrayList<>();

				if (startDateTime != null && endDateTime != null) {
					Predicate startFromPredicate = criteriaBuilder.between(root.get("createdAt"), startDateTime, endDateTime);
					predicatesList.add(startFromPredicate);
				}

				// order by outStock productNo then order by type
				query.orderBy(criteriaBuilder.asc(root.get("productNo")), criteriaBuilder.asc(root.get("type")));

				Predicate[] predicates = new Predicate[predicatesList.size()];

				return criteriaBuilder.and(predicatesList.toArray(predicates));
			}

		};

		// query results after filter
		List<OutStockRequest> resultList = outStockRequestRepo.findAll(specification);

		List<LocalDate> dateList = new ArrayList<>();
		Map<String, List<OutStockRequest>> resultMap = new HashMap<>();
		Set<String> userSet = new HashSet<>();

		// create a date list containing days between start and end
		Period period = Period.between(startDateTime.toLocalDate(), endDateTime.toLocalDate());
		int dayInterval = period.getDays();
		LocalDateTime tempTime = startDateTime;
		
		for (int i = 0; i <= dayInterval ; i += 1) {
			LocalDate d = tempTime.plusDays(i).toLocalDate();
			dateList.add(d);
		}
		
		// filter the requests with given date and store the filter results in the Map
		dateList.stream().forEach( date -> {
			List<OutStockRequest> filterResultList = resultList.stream().filter( 
					outStockRequest -> outStockRequest.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE)
					.equals(date.format(DateTimeFormatter.ISO_LOCAL_DATE))).collect(Collectors.toList());
			resultMap.put(date.format(DateTimeFormatter.ISO_LOCAL_DATE), filterResultList);
		});
		
		
		// collect all users showing within createdBy attribute
		resultList.forEach(outStockRequest->{if (!userSet.contains(outStockRequest.getCreatedBy())){
			userSet.add(outStockRequest.getCreatedBy());
		}});
		
		HandleListResponse res = new HandleListResponse(userSet.stream().collect(Collectors.toList()), resultMap);
		
		return res;
	}
	
}
