package com.wmstool.wmstool.services;

import java.io.IOException;
import java.lang.reflect.Type;
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

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Query;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.wmstool.wmstool.models.ClothIdentifier;
import com.wmstool.wmstool.models.ClothIdentifierBacklog;
import com.wmstool.wmstool.models.ClothInfo;
import com.wmstool.wmstool.models.InStockOrderRecord;
import com.wmstool.wmstool.models.OutStockRequest;
import com.wmstool.wmstool.models.history.History;
import com.wmstool.wmstool.models.payloads.HandleListResponse;
import com.wmstool.wmstool.models.payloads.InStockRequest;
import com.wmstool.wmstool.models.payloads.OutStockUpdateRequest;
import com.wmstool.wmstool.models.payloads.ProductInformation;
import com.wmstool.wmstool.models.payloads.QueryOrderResponse;
import com.wmstool.wmstool.models.payloads.QueryProductNoResponse;
import com.wmstool.wmstool.models.payloads.ShipRequest;
import com.wmstool.wmstool.models.payloads.ShrinkStockRequest;
import com.wmstool.wmstool.repositories.ClothIdentifierBacklogRepo;
import com.wmstool.wmstool.repositories.ClothIdentifierRepo;
import com.wmstool.wmstool.repositories.ClothInfoRepository;
import com.wmstool.wmstool.repositories.HistoryRepository;
import com.wmstool.wmstool.repositories.InStockOrderRepo;
import com.wmstool.wmstool.repositories.OutStockRequestRepo;
import com.wmstool.wmstool.utilities.OutStockRequestExcelHelper;

@Service
@Transactional
public class ClothService {

	@Autowired
	@Qualifier("testEntityManagerFactory")
	private EntityManagerFactory emf;

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

	@Autowired
	private InStockOrderRepo inStockOrderRepo;

	/**
	 * Return a response containing current 'in-stock' order content fetching from
	 * second db and previous process records fetching from first db
	 */
	public QueryOrderResponse queryInStockOrder(String inStockOrderNo) {
		Map<String, Map<String, Map<String, String>>> currentOrderStatus = getInStockOrderContent(inStockOrderNo);
		Map<String, Map<String, Map<String, String>>> prevOrderStatus = getInStockOrderRecord(inStockOrderNo);
		Map<String, Map<String, Map<String, String>>> waitHandleStatus = deriveWaitHandleStatus(currentOrderStatus,
				prevOrderStatus);
		return new QueryOrderResponse(currentOrderStatus, prevOrderStatus, waitHandleStatus);
	}

	/**
	 * Fetch necessary 'in-stock' order content from second db, and accumulate the
	 * amount of same type based on productNo
	 */
	private Map<String, Map<String, Map<String, String>>> getInStockOrderContent(String orderNo) {
		EntityManager em = emf.createEntityManager();
		String inStockSQLStatement = "SELECT PROD, QTY, UNIT, GWN, BANQTY FROM dbo.STKPRHS2 where CODE= ?1";

		Query q = em.createNativeQuery(inStockSQLStatement);
		q.setParameter(1, orderNo);

		List<InStockOrderRecord> orderRecordList = new ArrayList<>();

		// The format of q.getResultList() is as below:
		// Row n : PROD, QTY, UNIT, GWN, BANQTY
		for (Object row : q.getResultList()) {
			Object[] cell = (Object[]) row;
			InStockOrderRecord orderRecord = new InStockOrderRecord();
			orderRecord.setProductNo(cell[0].toString());
			Double sum = Double.valueOf(cell[1].toString()) + Double.valueOf(cell[4].toString());
			orderRecord.setLength(String.format("%.1f", sum));
			orderRecord.setUnit(unitMappingHelper(cell[2].toString()));
			orderRecord.setType(typeMappingHelper(cell[3].toString()));

			orderRecordList.add(orderRecord);
		}

		return orderContentCollector(orderRecordList);
	}

	/**
	 * Helper method to create nested structure : { productNo : { type : { length:
	 * length_value, unit: unit_value}}}
	 */
	private Map<String, Map<String, Map<String, String>>> orderContentCollector(
			List<InStockOrderRecord> orderRecordList) {
		Map<String, Map<String, Map<String, String>>> productNo_type_properties = new HashMap<>();

		if (orderRecordList.isEmpty()) {
			return productNo_type_properties;
		}

		for (InStockOrderRecord content : orderRecordList) {
			// filter type = "" which is not necessary
			if (!content.getType().equals("")) {
				// if product is not exist, create sub Map Objects
				if (!productNo_type_properties.containsKey(content.getProductNo())) {
					Map<String, Map<String, String>> type_properties = new HashMap<>();
					Map<String, String> properties = new HashMap<>();

					properties.put("length", content.getLength());
					properties.put("unit", content.getUnit());
					type_properties.put(content.getType(), properties);
					productNo_type_properties.put(content.getProductNo(), type_properties);
				} else {
					Map<String, Map<String, String>> temp_type_properties = productNo_type_properties
							.get(content.getProductNo());
					// if productNo exist but type no exist, create sub Map object
					if (!temp_type_properties.containsKey(content.getType())) {
						Map<String, String> properties = new HashMap<>();

						properties.put("length", content.getLength());
						properties.put("unit", content.getUnit());

						temp_type_properties.put(content.getType(), properties);
					} else {
						// if productNo exist and type exist, sum
						Map<String, String> tempProperties = productNo_type_properties.get(content.getProductNo())
								.get(content.getType());
						Double sum = Double.valueOf(tempProperties.get("length")) + Double.valueOf(content.getLength());
						tempProperties.put("length", String.format("%.1f", sum));
					}
				}
			}
		}

		return productNo_type_properties;
	}

	/**
	 * Helper method for translate UNIT to literal value
	 */
	private String unitMappingHelper(String unitCode) {
		String[] unitList = { "台", "支", "碼", "尺", "公斤", "公尺", "個", "打", "包", "箱", "件", "對", "本", "張", "才", "幅", "盒",
				"瓶", "磅", "批", "條", "筆", "雙", "公克", "次", "疊", "組" };

		return unitList[Integer.valueOf(unitCode)];
	}

	/**
	 * Helper method for translate GWN to literal value
	 */
	private String typeMappingHelper(String whName) {
		String type = "";

		switch (whName) {
		case "AB":
			type = "板卷";
			break;
		case "AC":
			type = "整支";
			break;
		case "AD":
			type = "整支";
			break;
		case "AE":
			type = "整支";
			break;
		case "AP":
			type = "雜項";
			break;
		default:
			break;
		}

		return type;
	}

	/**
	 * Fetch previous process records of certain orderNo from first db
	 */
	private Map<String, Map<String, Map<String, String>>> getInStockOrderRecord(String inStockOrderNo) {
		return orderContentCollector(inStockOrderRepo.findByInStockOrderNo(inStockOrderNo));
	}

	/**
	 * Derive waitHandleStatus from currentStatus and prevStatus
	 */
	private Map<String, Map<String, Map<String, String>>> deriveWaitHandleStatus(
			Map<String, Map<String, Map<String, String>>> currentStatus,
			Map<String, Map<String, Map<String, String>>> prevStatus) {
		if (prevStatus == null) {
			return currentStatus;
		}

		// deep copy a map object by Gson
		Gson gson = new Gson();
		String mapString = gson.toJson(currentStatus);
		Type typeOfMap = new TypeToken<Map<String, Map<String, Map<String, String>>>>() {
		}.getType();
		Map<String, Map<String, Map<String, String>>> waitHandleStatus = gson.fromJson(mapString, typeOfMap);

		// when prevStatus map has same productNo and type as waitHandleStatus map, the
		// calculation arises
		waitHandleStatus.keySet().stream().forEach(productNo -> {
			waitHandleStatus.get(productNo).keySet().stream().forEach(type -> {
				if (prevStatus.get(productNo) != null && prevStatus.get(productNo).get(type) != null) {
					Double result = Double.valueOf(waitHandleStatus.get(productNo).get(type).get("length"))
							- Double.valueOf(prevStatus.get(productNo).get(type).get("length"));
					waitHandleStatus.get(productNo).get(type).put("length", result.toString());
				}
			});
		});

		return waitHandleStatus;
	}

	// TODO: query assemble order content
	/**
	 * Return a response containing current 'assemble' order content fetching from
	 * second db and previous process records fetching from first db
	 */
	public QueryOrderResponse queryAssembleOrder(String assembleOrderNo) {
		Map<String, Map<String, Map<String, String>>> currentOrderStatus = getAssembleOrderContent(assembleOrderNo);
		Map<String, Map<String, Map<String, String>>> prevOrderStatus = getInStockOrderRecord(assembleOrderNo);
		Map<String, Map<String, Map<String, String>>> waitHandleStatus = deriveWaitHandleStatus(currentOrderStatus,
				prevOrderStatus);
		return new QueryOrderResponse(currentOrderStatus, prevOrderStatus, waitHandleStatus);
	}

	/**
	 * Fetch necessary 'assemble' order content from second db
	 */
	private Map<String, Map<String, Map<String, String>>> getAssembleOrderContent(String orderNo) {
		EntityManager em = emf.createEntityManager();
		// TODO: Modify SQL statement for assembleOrder
		String assembleSQLStatement = "SELECT MPROD, MQTY, GWN FROM dbo.BOMMIS1 where CODE= ?1 ";

		Query q = em.createNativeQuery(assembleSQLStatement);
		q.setParameter(1, orderNo);

		List<InStockOrderRecord> orderRecordList = new ArrayList<>();

		// The format of q.getResultList() is as below:
		// Row n : PROD, QTY, UNIT, GWN
		for (Object row : q.getResultList()) {
			Object[] cell = (Object[]) row;
			InStockOrderRecord orderRecord = new InStockOrderRecord();
			orderRecord.setProductNo(cell[0].toString());
			orderRecord.setLength(cell[1].toString());
			orderRecord.setUnit(unitMappingHelper(cell[2].toString()));
			orderRecord.setType(typeMappingHelper(cell[3].toString()));
			orderRecordList.add(orderRecord);
		}

		return orderContentCollector(orderRecordList);
	}

	/**
	 * Save inStockRequest in List as ClothInfo/InStockOrderRecord to first db
	 */
	// TODO: 1) lotNo can be null
	public List<ClothInfo> createClothInfoes(List<InStockRequest> inStockRequests) {
		List<ClothInfo> resultList = new ArrayList<>();

		for (int i = 0; i < inStockRequests.size(); i += 1) {
			InStockRequest inStockRequest = inStockRequests.get(i);
			String condition = inStockRequest.getIsNew();

			// find clothIdentifierBacklog is exist or not; if not exist, create new
			ClothIdentifierBacklog resClothIdentifierBacklog = clothIdentifierBacklogRepo
					.findByProductNoAndLotNoAndTypeAndLengthAndUnit(inStockRequest.getProductNo(),
							inStockRequest.getLotNo(), inStockRequest.getType(), inStockRequest.getLength(),
							inStockRequest.getUnit())
					.orElseGet(() -> clothIdentifierBacklogRepo
							.save(new ClothIdentifierBacklog(inStockRequest.getProductNo(), inStockRequest.getLotNo(),
									inStockRequest.getType(), inStockRequest.getLength(), inStockRequest.getUnit())));

			// use clothIdentifierBacklog to save clothIdentifier
			ClothIdentifier clothIdentifier = new ClothIdentifier(resClothIdentifierBacklog);

			History oldHistory = new History();

			// identify newInStock and shrink process, to set firstInStockAt
			switch (condition) {
			case "new":
				clothIdentifier.setFirstInStockAt(LocalDate.now().toString());
				break;
			case "old":
				// use the data "parentId" from inStockRequest as key to find the parent
				// TODO: wait handle exception
				oldHistory = historyRepository.findByCurrentId(inStockRequest.getParentId()).get();
				clothIdentifier.setFirstInStockAt(
						clothIdentifierRepo.findById(oldHistory.getRootId()).get().getFirstInStockAt());
				break;
			default:
				break;
			}

			ClothIdentifier resIdentifier = clothIdentifierRepo.save(clothIdentifier);

			// only new cloth need to save to orderRecord repository
			if (condition.equals("new")) {
				inStockOrderRepo.save(new InStockOrderRecord(resIdentifier, inStockRequest.getOrderNo()));
			}

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
				// type exchange: array to list
				List<Long> oldChildrenList = Arrays.stream(oldHistory.getChildrenId()).collect(Collectors.toList());
				oldChildrenList.add(resIdentifierId);
				// type exchange: list to array
				Long[] oldHistoryArr = oldChildrenList.toArray(oldHistory.getChildrenId());
				oldHistory.setChildrenId(oldHistoryArr);
				// update oldHistory/rootHistory
				historyRepository.save(oldHistory); // could be ignored?

				newHistory.setRootId(oldHistory.getRootId());
				break;
			default:
				break;
			}

			historyRepository.save(newHistory); // could be ignored?
			// history function code end

			// increase serialotNo in clothIdentifierBacklog
			int newSerialNo = resClothIdentifierBacklog.getSerialNo() + 1;
			resClothIdentifierBacklog.setSerialNo(newSerialNo);

			// use clothIdentifier to create clothInfo, and add into list
			resultList.add(new ClothInfo(clothIdentifier, inStockRequest.getColor(), inStockRequest.getDefect(),
					inStockRequest.getRecord()));

		}

		return clothInfoRepository.saveAll(resultList);
	}

	/**
	 * Return a response containing 'less' information for certain productNo
	 * fetching from second db and a list of ClothInfoes with certain productNo
	 * fetching from first db
	 */
	public QueryProductNoResponse findBasicClothInfoByProductNo(String productNo) {
		return new QueryProductNoResponse(getClothInfoByProductNo(productNo), getBasicProductNoInfo(productNo));
	}

	/**
	 * Return a response containing information for certain productNo fetching from
	 * second db and a list of ClothInfoes with certain productNo fetching from
	 * first db
	 */
	public QueryProductNoResponse findClothInfoByProductNo(String productNo) {
		return new QueryProductNoResponse(getClothInfoByProductNo(productNo), getProductNoInfo(productNo));
	}

	/**
	 * Fetch a list of ClothInfoes with certain productNo from first db
	 */
	private List<ClothInfo> getClothInfoByProductNo(String productNo) {
		List<ClothInfo> result = new ArrayList<>();

		List<ClothIdentifier> res = clothIdentifierRepo.findByProductNoAndIsExist(productNo.toUpperCase(), true)
				.orElseGet(() -> new ArrayList<>());

		if (!res.isEmpty()) {
			res.stream().forEach(
					identifier -> result.add(clothInfoRepository.findByClothIdentifierId(identifier.getId()).get()));
		}

		return result;
	}

	/**
	 * Fetch less & necessary productNo information from second db
	 */
	private ProductInformation getBasicProductNoInfo(String productNo) {
		ProductInformation productInformation = new ProductInformation();
		EntityManager em = emf.createEntityManager();

		String SQLStatement1 = "SELECT CODE, CNAME, SPEC, PACKDESC, ADDTYPE, PICTURE FROM dbo.PRODUCT WHERE CODE= ?1";
		Query q1 = em.createNativeQuery(SQLStatement1);
		q1.setParameter(1, productNo);

		if (!q1.getResultList().isEmpty()) {
			// directly use get(0), because productNo is unique in db
			Object[] cells = (Object[]) q1.getResultList().get(0);

			productInformation.setProductNo(nullValueHelper(cells[0].toString()));
			productInformation.setcName(nullValueHelper(cells[1].toString()));
			productInformation.setSpec(nullValueHelper(cells[2].toString()));
			productInformation.setPackDesc(nullValueHelper(cells[3].toString()));
			productInformation.setAddType(addTypeMappingHelper(Integer.valueOf(cells[4].toString())));
			productInformation.setPicture(nullValueHelper(cells[5].toString()));
		}

		return productInformation;
	}

	/**
	 * Fetch necessary productNo information from second db
	 */
	private ProductInformation getProductNoInfo(String productNo) {
		ProductInformation productInformation = new ProductInformation();
		EntityManager em = emf.createEntityManager();

		String SQLStatement1 = "SELECT CODE, CNAME, SPEC, SUPP, PRODDESC, USERFLD1, DESCRIP, PACKDESC, ADDTYPE, PICTURE FROM dbo.PRODUCT WHERE CODE= ?1";
		Query q1 = em.createNativeQuery(SQLStatement1);
		q1.setParameter(1, productNo);

		if (!q1.getResultList().isEmpty()) {
			// directly use get(0), because productNo is unique in db
			Object[] cells = (Object[]) q1.getResultList().get(0);

			productInformation.setProductNo(nullValueHelper(cells[0].toString()));
			productInformation.setcName(nullValueHelper(cells[1].toString()));
			productInformation.setSpec(nullValueHelper(cells[2].toString()));
			productInformation.setSupp(nullValueHelper(cells[3].toString()));
			productInformation.setProdDesc(nullValueHelper(cells[4].toString()));
			productInformation.setUserField1(nullValueHelper(cells[5].toString()));
			productInformation.setDescrip(nullValueHelper(cells[6].toString()));
			productInformation.setPackDesc(nullValueHelper(cells[7].toString()));
			productInformation.setAddType(addTypeMappingHelper(Integer.valueOf(cells[8].toString())));
			productInformation.setPicture(nullValueHelper(cells[9].toString()));

			String SQLStatement2 = "SELECT CNAME FROM dbo.SUPPLIER WHERE CODE= ?1";

			Query q2 = em.createNativeQuery(SQLStatement2);
			q2.setParameter(1, cells[3].toString());

			Object cell = (Object) q2.getResultList().get(0);

			productInformation.setSuppName(nullValueHelper(cell.toString()));
		}

		return productInformation;
	}

	/**
	 * Helper method for mapping empty String to a meaningful value
	 */
	private String nullValueHelper(String input) {
		if (input.equals("")) {
			return "無資料";
		} else {
			return input;
		}
	}

	/**
	 * Helper method for translate addType to literal value
	 */
	private String addTypeMappingHelper(int value) {
		String addType = "";

		switch (value) {
		case 0:
			addType = "無";
			break;
		case 1:
			addType = "可追加";
			break;
		case 2:
			addType = "不可追加";
			break;
		case 3:
			addType = "暫缺貨";
			break;
		case 4:
			addType = "無貨";
			break;
		default:
			break;
		}

		return addType;
	}

	/**
	 * Using given information containing in ShipRequest to mark certain
	 * clothIdentifier ship status is true and save a record to
	 * outStockReqeust repository
	 */
	public void letClothIdentifierisShiped(ShipRequest shipRequest) {
		ClothIdentifier res = clothIdentifierRepo.findById(shipRequest.getClothIdentifierId()).get();
		ClothInfo resInfo = clothInfoRepository.findByClothIdentifierId(res.getId()).get();
		OutStockRequest outStockRequest = new OutStockRequest(res.getProductNo(), res.getLotNo(), res.getType(),
				res.getLength(), res.getUnit(), shipRequest.getReason(), res.getId());

		res.setExist(false);
		res.setShip(true);
		res.setShipReason(shipRequest.getReason());
		res.setOutStock(true);
		res.setOutStockAt(LocalDateTime.now());

		outStockRequest.setColor(resInfo.getColor());
		outStockRequest.setDefect(resInfo.getDefect());
		outStockRequest.setOutStockType(0);
		outStockRequestRepo.save(outStockRequest);
//		clothIdentifierRepo.save(res);
	}
	
	/**
	 * Cancel certain clothIdentifier ship process and update the corresponding
	 * outStockRequest record as deleted
	 */
	public void letClothIdentifierisNotShiped(long clothIdentifierId) {
		ClothIdentifier res = clothIdentifierRepo.findById(clothIdentifierId).get();

		// if roll-back, set delete status in OutStockRequest
		outStockRequestRepo.findByClothIdentifierIdAndIsDeleted(clothIdentifierId, false).get().setDeleted(true);

		res.setExist(true);
		res.setShip(false);
		res.setShipReason(null);
		res.setOutStock(false);
		res.setOutStockAt(null);

//		clothIdentifierRepo.save(res);
	}

	/**
	 * Fetch a list of ClothInfo assigned to shrinking process
	 */
	public List<ClothInfo> getWaitToShrinkList() {
		List<ClothInfo> result = new ArrayList<>();
		List<ClothIdentifier> res = clothIdentifierRepo.findByWaitToShrinkAndIsExist(true, true)
				.orElseGet(() -> new ArrayList<>());

		if (!res.isEmpty()) {
			res.stream().forEach(
					identifier -> result.add(clothInfoRepository.findByClothIdentifierId(identifier.getId()).get()));
		}

		return result;
	}

	/**
	 * Mark certain clothIdentifier waiting for shrinking process and save a record
	 * to outStockReqeust repository
	 */
	public String letClothIdentifierWaitToShrinkIsTrue(long clothIdentifierId) {
		ClothIdentifier res = clothIdentifierRepo.findById(clothIdentifierId).get();
		ClothInfo resInfo = clothInfoRepository.findByClothIdentifierId(res.getId()).get();
		OutStockRequest outStockRequest = new OutStockRequest(res.getProductNo(), res.getLotNo(), res.getType(),
				res.getLength(), res.getUnit(), "減肥", res.getId());

		res.setWaitToShrink(true);
		res.setOutStock(true);
		res.setOutStockAt(LocalDateTime.now());

		outStockRequest.setColor(resInfo.getColor());
		outStockRequest.setDefect(resInfo.getDefect());
		outStockRequest.setOutStockType(1);
		outStockRequestRepo.save(outStockRequest);

		return res.getProductNo();
//		return clothIdentifierRepo.save(res).getProductNo();
	}

	/**
	 * Cancel certain clothIdentifier shrinking process and update the corresponding
	 * outStockRequest record as deleted
	 */
	public void letClothIdentifierWaitToShrinkIsFalse(long clothIdentifierId) {
		ClothIdentifier res = clothIdentifierRepo.findById(clothIdentifierId).get();

		// if roll-back, set delete status in OutStockRequest
		outStockRequestRepo.findByClothIdentifierIdAndIsDeleted(clothIdentifierId, false).get().setDeleted(true);

		res.setWaitToShrink(false);
		res.setOutStock(false);
		res.setOutStockAt(null);

//		clothIdentifierRepo.save(res);
	}

	/**
	 * Using given information containing in ShrinkStockRequest to update old
	 * ClothIdentifier and create new ClothIdentifier/ClothInfo
	 */
	public void shrinkCloth(ShrinkStockRequest shrinkStockRequest) {
		// find old clothIdentifier, and set to not exist
		ClothIdentifier res = clothIdentifierRepo.findById(shrinkStockRequest.getOldClothIdentifierId()).get();

		res.setExist(false);

		// then batch create new cloth
		createClothInfoes(shrinkStockRequest.getInStockRequests());
	}

	/**
	 * Save a special outStockRequest to repository
	 */
	public OutStockRequest createOutStockRequest(OutStockRequest outStockRequest) {
		outStockRequest.setOutStockType(2);

		return outStockRequestRepo.save(outStockRequest);
	}
	
	// TODO: special outStockRequest delete method
	public void deleteOutStockRequest (long outStockRequestId) {
		outStockRequestRepo.findById(outStockRequestId).get().setDeleted(true);
	}
	
	/**
	 * Return a response containing a list of waitHandle records created at 'today'
	 * in outStockRequest repository and a list of create users collected in
	 * previous list
	 */
	public HandleListResponse getOutStockWaitHandleList() {
		LocalDateTime today = LocalDate.now().atStartOfDay();

		Specification<OutStockRequest> specification = new Specification<OutStockRequest>() {

			@Override
			public Predicate toPredicate(Root<OutStockRequest> root, CriteriaQuery<?> query,
					CriteriaBuilder criteriaBuilder) {
				List<Predicate> predicatesList = new ArrayList<>();

				Predicate deletePredicate = criteriaBuilder.isFalse(root.get("isDeleted"));
				predicatesList.add(deletePredicate);

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
		resultList.forEach(outStockRequest -> {
			if (!userSet.contains(outStockRequest.getCreatedBy())) {
				userSet.add(outStockRequest.getCreatedBy());
			}
		});

		HandleListResponse res = new HandleListResponse(userSet.stream().collect(Collectors.toList()), resultMap);

		return res;
	}

	/**
	 * Return a response containing a list of waitHandle records created between
	 * 'start' and 'end' in outStockRequest repository and a list of create users
	 * collected in previous list
	 */
	public HandleListResponse getOutStockWaitHandleListWithTimeInterval(String start, String end) {
		LocalDateTime startDateTime = LocalDateTime.parse(start, DateTimeFormatter.ISO_LOCAL_DATE_TIME).plusHours(8);
		LocalDateTime endDateTime = LocalDateTime.parse(end, DateTimeFormatter.ISO_LOCAL_DATE_TIME).plusHours(8);

		Specification<OutStockRequest> specification = new Specification<OutStockRequest>() {

			@Override
			public Predicate toPredicate(Root<OutStockRequest> root, CriteriaQuery<?> query,
					CriteriaBuilder criteriaBuilder) {
				List<Predicate> predicatesList = new ArrayList<>();

				Predicate deletePredicate = criteriaBuilder.isFalse(root.get("isDeleted"));
				predicatesList.add(deletePredicate);

				if (startDateTime != null && endDateTime != null) {
					Predicate startFromPredicate = criteriaBuilder.between(root.get("createdAt"), startDateTime,
							endDateTime);
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

		for (int i = 0; i <= dayInterval; i += 1) {
			LocalDate d = tempTime.plusDays(i).toLocalDate();
			dateList.add(d);
		}

		// filter the requests with given date and store the filter results in the Map
		dateList.stream().forEach(date -> {
			List<OutStockRequest> filterResultList = resultList.stream()
					.filter(outStockRequest -> outStockRequest.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE)
							.equals(date.format(DateTimeFormatter.ISO_LOCAL_DATE)))
					.collect(Collectors.toList());
			resultMap.put(date.format(DateTimeFormatter.ISO_LOCAL_DATE), filterResultList);
		});

		// collect all users showing within createdBy attribute
		resultList.forEach(outStockRequest -> {
			if (!userSet.contains(outStockRequest.getCreatedBy())) {
				userSet.add(outStockRequest.getCreatedBy());
			}
		});

		HandleListResponse res = new HandleListResponse(userSet.stream().collect(Collectors.toList()), resultMap);

		return res;
	}

	/**
	 * Update outStockRequest using given outStockUpdateRequest, and create excel at
	 * server for user download
	 */
	public void updateOutStockRequest(OutStockUpdateRequest outStockUpdateRequest) throws IOException {
		Map<Long, String> updateRequest = outStockUpdateRequest.getOutStockUpdate();
		List<OutStockRequest> tempList = new ArrayList<>();

		// Create a excel for this updateRequest for later modification
		String fileName = OutStockRequestExcelHelper.createNewFile();

		// Use id stored in update request as key to update database
		updateRequest.keySet().forEach(id -> {
			OutStockRequest res = outStockRequestRepo.findById(id).get();
			res.setRequestFrom(updateRequest.get(id));
			res.setHandled(true);
			res.setFileName(fileName);
			tempList.add(res);
		});

		// write res information into excel
		try {
			OutStockRequestExcelHelper.modifyExisting(tempList, fileName);
		} catch (Exception e) {
			e.printStackTrace();
		}

	}

}
