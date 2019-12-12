package com.wmstool.wmstool.services;

import java.io.IOException;
import java.lang.reflect.Type;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
import javax.persistence.criteria.Predicate;
import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.wmstool.wmstool.models.History;
import com.wmstool.wmstool.models.InStockOrderRecord;
import com.wmstool.wmstool.models.OutStockRequest;
import com.wmstool.wmstool.models.Product;
import com.wmstool.wmstool.models.StockAdjustmentRecord;
import com.wmstool.wmstool.models.StockAllocationRecord;
import com.wmstool.wmstool.models.StockIdentifier;
import com.wmstool.wmstool.models.StockIdentifierBacklog;
import com.wmstool.wmstool.models.StockInfo;
import com.wmstool.wmstool.models.TransactionRecord;
import com.wmstool.wmstool.models.payloads.HandleListResponse;
import com.wmstool.wmstool.models.payloads.InStockRequest;
import com.wmstool.wmstool.models.payloads.OutStockUpdateRequest;
import com.wmstool.wmstool.models.payloads.ProductInformation;
import com.wmstool.wmstool.models.payloads.QueryOrderResponse;
import com.wmstool.wmstool.models.payloads.QueryProductNoResponse;
import com.wmstool.wmstool.models.payloads.ShipRequest;
import com.wmstool.wmstool.models.payloads.ShrinkStockRequest;
import com.wmstool.wmstool.models.payloads.UpdateInfoRequest;
import com.wmstool.wmstool.repositories.HistoryRepository;
import com.wmstool.wmstool.repositories.InStockOrderRepo;
import com.wmstool.wmstool.repositories.OutStockRequestRepo;
import com.wmstool.wmstool.repositories.ProductRepository;
import com.wmstool.wmstool.repositories.StockAdjustmentRecordRepo;
import com.wmstool.wmstool.repositories.StockAllocationRecordRepo;
import com.wmstool.wmstool.repositories.StockIdentifierBacklogRepo;
import com.wmstool.wmstool.repositories.StockIdentifierRepo;
import com.wmstool.wmstool.repositories.StockInfoRepository;
import com.wmstool.wmstool.repositories.TransactionRecordRepo;
import com.wmstool.wmstool.utilities.DailyStockComparisonExcelHelper;
import com.wmstool.wmstool.utilities.OutStockRequestExcelHelper;
import com.wmstool.wmstool.utilities.StockAdjustRecordExcelHelper;
import com.wmstool.wmstool.utilities.StockAllocateRecordExcelHelper;
import com.wmstool.wmstool.utilities.WeeklyStockComparisonExcelHelper;

@Service
@Transactional
public class StockService {

	@Autowired
	@Qualifier("testEntityManagerFactory")
	private EntityManagerFactory emf;

	@Autowired
	private StockIdentifierRepo stockIdentifierRepo;

	@Autowired
	private StockIdentifierBacklogRepo stockIdentifierBacklogRepo;

	@Autowired
	private StockInfoRepository stockInfoRepository;

	@Autowired
	private HistoryRepository historyRepository;

	@Autowired
	private OutStockRequestRepo outStockRequestRepo;

	@Autowired
	private InStockOrderRepo inStockOrderRepo;

	@Autowired
	private TransactionRecordRepo transactionRecordRepo;

	@Autowired
	private ProductRepository productRepository;

	@Autowired
	private StockAllocationRecordRepo stockAllocationRecordRepo;

	@Autowired
	private StockAdjustmentRecordRepo stockAdjustmentRecordRepo;

	private static final String InStockType_Normal = "normal";
	private static final String InStockType_Assemble = "assemble";
	private static final String InStockType_Shrink = "shrink";

	/**
	 * Return a response containing current 'in-stock' order content fetching from
	 * second db and previous process records fetching from first db
	 */
	public QueryOrderResponse queryInStockOrder(String inStockOrderNo) {
		Map<String, Map<String, Map<String, String>>> currentOrderStatus = getInStockOrderContent(inStockOrderNo);
		Map<String, Map<String, Map<String, String>>> prevOrderStatus = getInStockOrderRecord(inStockOrderNo);
		Map<String, Map<String, Map<String, String>>> waitHandleStatus = deriveWaitHandleStatus(currentOrderStatus,
				prevOrderStatus);
		return new QueryOrderResponse(currentOrderStatus, waitHandleStatus);
	}

	/**
	 * Fetch necessary 'in-stock' order content from second db, and accumulate the
	 * amount of same type based on productNo
	 */
	private Map<String, Map<String, Map<String, String>>> getInStockOrderContent(String orderNo) {
		String inStockSQLStatement = "SELECT PROD, QTY, UNIT, GWN, BANQTY FROM dbo.STKPRHS2 WHERE CODE= ?1";
		List<InStockOrderRecord> orderRecordList = new ArrayList<>();

		EntityManager em = emf.createEntityManager();
		Query q = em.createNativeQuery(inStockSQLStatement);
		q.setParameter(1, orderNo);

		// The format of q.getResultList() is as below:
		// Row n : [PROD, QTY, UNIT, GWN, BANQTY]
		for (Object row : q.getResultList()) {
			Object[] cell = (Object[]) row;
			InStockOrderRecord orderRecord = new InStockOrderRecord();

			orderRecord.setProductNo(cell[0].toString());
			orderRecord.setQuantity(String.format("%.1f",
					Double.parseDouble(cell[1].toString()) + Double.parseDouble(cell[4].toString())));
			orderRecord.setUnit(unitMappingHelper(cell[2].toString()));
			orderRecord.setType(typeMappingHelper(cell[3].toString()));

			orderRecordList.add(orderRecord);
		}

		return orderContentCollector(orderRecordList);
	}

	/**
	 * Helper method to create nested structure : { productNo : { type : { quantity:
	 * quantity_value, unit: unit_value}}}
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

					properties.put("quantity", content.getQuantity());
					properties.put("unit", content.getUnit());
					type_properties.put(content.getType(), properties);
					productNo_type_properties.put(content.getProductNo(), type_properties);
				} else {
					Map<String, Map<String, String>> temp_type_properties = productNo_type_properties
							.get(content.getProductNo());
					// if productNo exist but type no exist, create sub Map object
					if (!temp_type_properties.containsKey(content.getType())) {
						Map<String, String> properties = new HashMap<>();

						properties.put("quantity", content.getQuantity());
						properties.put("unit", content.getUnit());

						temp_type_properties.put(content.getType(), properties);
					} else {
						// if productNo exist and type exist, sum
						Map<String, String> tempProperties = productNo_type_properties.get(content.getProductNo())
								.get(content.getType());
						tempProperties.put("quantity",
								String.format("%.1f", Double.parseDouble(tempProperties.get("quantity"))
										+ Double.parseDouble(content.getQuantity())));
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

		return unitList[Integer.parseInt(unitCode)];
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
		case "AD":
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
		return orderContentCollector(
				inStockOrderRepo.findByInStockTypeAndInStockOrderNo(InStockType_Normal, inStockOrderNo));
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

		// deep copy currentStatus object by Gson
		Gson gson = new Gson();
		String mapString = gson.toJson(currentStatus);
		Type typeOfMap = new TypeToken<Map<String, Map<String, Map<String, String>>>>() {
		}.getType();
		Map<String, Map<String, Map<String, String>>> waitHandleStatus = gson.fromJson(mapString, typeOfMap);

		// when prevStatus map has same productNo and type as waitHandleStatus map, the
		// calculation arises
		waitHandleStatus.keySet().forEach(productNo -> waitHandleStatus.get(productNo).keySet().forEach(type -> {
			if (prevStatus.get(productNo) != null && prevStatus.get(productNo).get(type) != null) {
				waitHandleStatus.get(productNo).get(type).put("quantity",
						String.format("%.1f",
								Double.parseDouble(waitHandleStatus.get(productNo).get(type).get("quantity"))
										- Double.parseDouble(prevStatus.get(productNo).get(type).get("quantity"))));
			}
		}));

		return waitHandleStatus;
	}

	/**
	 * Return a response containing current 'assemble' order content fetching from
	 * second db
	 */
	// Check waitHandleStatus/prevOrderStatus
	public QueryOrderResponse queryAssembleOrder(String assembleOrderNo) {
		Map<String, Map<String, Map<String, String>>> currentOrderStatus = getAssembleOrderContent(assembleOrderNo);
		Map<String, Map<String, Map<String, String>>> prevOrderStatus = getAssembleOrderRecord(assembleOrderNo);
		Map<String, Map<String, Map<String, String>>> waitHandleStatus = deriveWaitHandleStatus(currentOrderStatus,
				prevOrderStatus);
		return new QueryOrderResponse(currentOrderStatus, waitHandleStatus);
	}

	/**
	 * Fetch necessary 'assemble' order content from second db
	 */
	private Map<String, Map<String, Map<String, String>>> getAssembleOrderContent(String orderNo) {
		String assembleAndProductUnitSQLStatement = "SELECT x.MPROD, x.GWN, x.MQTY, y.UNIT FROM dbo.BOMMIS1 x INNER JOIN dbo.PRODUCT y ON x.MPROD = y.CODE WHERE x.CODE = ?1";
		List<InStockOrderRecord> orderRecordList = new ArrayList<>();

		EntityManager em = emf.createEntityManager();
		Query q = em.createNativeQuery(assembleAndProductUnitSQLStatement);
		q.setParameter(1, orderNo);

		// The format of q.getResultList() is as below:
		// Row n : [MPROD, GWN, MQTY, UNIT]
		for (Object row : q.getResultList()) {
			Object[] cell = (Object[]) row;
			InStockOrderRecord orderRecord = new InStockOrderRecord();

			orderRecord.setProductNo(cell[0].toString());
			orderRecord.setType(typeMappingHelper(cell[1].toString()));

			Integer unit = Integer.parseInt(cell[3].toString()); // receive product unit
			String quantity = "";

			// calculate quantity for unit conversion
			switch (unit) {
			case 2:
				quantity = cell[2].toString();
				break;
			case 3:
				quantity = String.format("%.1f", Double.parseDouble(cell[2].toString()) / 3.0);
				unit = 2;
				break;
			default:
				break;
			}

			orderRecord.setQuantity(quantity);
			orderRecord.setUnit(unitMappingHelper(unit.toString()));

			orderRecordList.add(orderRecord);
		}

		return orderContentCollector(orderRecordList);
	}

	/**
	 * Fetch previous process records of certain orderNo from first db
	 */
	private Map<String, Map<String, Map<String, String>>> getAssembleOrderRecord(String assembleOrderNo) {
		return orderContentCollector(
				inStockOrderRepo.findByInStockTypeAndInStockOrderNo(InStockType_Assemble, assembleOrderNo));
	}

	/**
	 * Save inStockRequest in List as StockInfo/InStockOrderRecord to first db
	 */
	public List<StockInfo> createStockInfoes(List<InStockRequest> inStockRequests) {
		List<StockInfo> resultList = new ArrayList<>();
		List<Product> productList = new ArrayList<>();
		String productNo = inStockRequests.get(0).getProductNo();

		for (InStockRequest isr : inStockRequests) {
			History oldHistory = new History();
			History newHistory = new History();

			// Unit conversion
			InStockRequest inStockRequest = quantityConvertor(isr);
			String condition = inStockRequest.getInStockType();

			// find stockIdentifierBacklog is exist or not; if not exist, create new
			StockIdentifierBacklog resStockIdentifierBacklog = stockIdentifierBacklogRepo
					.findByProductNoAndLotNoAndTypeAndQuantityAndUnit(inStockRequest.getProductNo(),
							inStockRequest.getLotNo(), inStockRequest.getType(), inStockRequest.getQuantity(),
							inStockRequest.getUnit())
					.orElseGet(() -> stockIdentifierBacklogRepo.save(new StockIdentifierBacklog(inStockRequest)));

			// use stockIdentifierBacklog to create stockIdentifier
			StockIdentifier stockIdentifier = new StockIdentifier(resStockIdentifierBacklog);

			// increase serialotNo in stockIdentifierBacklog
			int newSerialNo = resStockIdentifierBacklog.getSerialNo() + 1;
			resStockIdentifierBacklog.setSerialNo(newSerialNo);

			// identify newInStock and shrink process, to set firstInStockAt
			switch (condition) {
			case InStockType_Normal:
			case InStockType_Assemble:
				stockIdentifier.setFirstInStockAt(LocalDate.now().toString());
				break;
			case InStockType_Shrink:
				// use the data "parentId" from inStockRequest as key to find the parent
				// TODO: data not found exception
				oldHistory = historyRepository.findByCurrentIdentifierId(inStockRequest.getParentId()).get();
				stockIdentifier.setFirstInStockAt(
						stockIdentifierRepo.findById(oldHistory.getRootIdentifierId()).get().getFirstInStockAt());
				break;
			default:
				break;
			}

			// save stockIdentifier
			StockIdentifier resIdentifier = stockIdentifierRepo.save(stockIdentifier);

			// history function code start
			long resIdentifierId = resIdentifier.getId();

			// define newHistory or update oldHistory
			newHistory.setCurrentIdentifierId(resIdentifierId);

			switch (condition) {
			case InStockType_Normal:
			case InStockType_Assemble:
				newHistory.setRootIdentifierId(resIdentifierId);
				newHistory.setRoot(true);
				break;
			case InStockType_Shrink:
				// type exchange: array to list
				List<Long> oldChildrenList = Arrays.stream(oldHistory.getChildrenIdentifierId())
						.collect(Collectors.toList());
				oldChildrenList.add(resIdentifierId);

				// type exchange: list to array
				Long[] oldHistoryArr = oldChildrenList.toArray(oldHistory.getChildrenIdentifierId());
				oldHistory.setChildrenIdentifierId(oldHistoryArr);

				// update oldHistory
				historyRepository.save(oldHistory);

				newHistory.setRootIdentifierId(oldHistory.getRootIdentifierId());
				break;
			default:
				break;
			}

			// save newHistory
			historyRepository.save(newHistory);
			// history function code end

			// use stockIdentifier & inStockRequest to create stockInfo, then add into list
			StockInfo result = new StockInfo(resIdentifier, inStockRequest);
			resultList.add(result);

			// only new stock from InStockOrder & AssembleOrder should be saved in
			// InStockOrderRepo
			if (condition.equals(InStockType_Normal) || condition.equals(InStockType_Assemble)) {
				inStockOrderRepo.save(new InStockOrderRecord(resIdentifier, inStockRequest));
			}

			// Create TransactionRecord and save it
			TransactionRecord transactionRecord = new TransactionRecord(resIdentifier);
			transactionRecord.setOperator("1");

			switch (condition) {
			case InStockType_Normal:
				transactionRecord.setTransactionType("NI");
				break;
			case InStockType_Assemble:
				transactionRecord.setTransactionType("AI");
				break;
			case InStockType_Shrink:
				transactionRecord.setTransactionType("SKI");
				break;
			default:
				break;
			}

			transactionRecordRepo.save(transactionRecord);

			// Create Individual Product object, then add to list
			Product p = new Product(resIdentifier);
			productList.add(p);
		}

		// Accumulate quantity in productList, then create or update Product
		updateProductQuantityWithList(productNo, productList);

		return stockInfoRepository.saveAll(resultList);
	}

	/**
	 * Unit conversion for InStockRequest(There are some unit having the conversion)
	 */
	private InStockRequest quantityConvertor(InStockRequest inStockRequest) {
		String quantity = inStockRequest.getQuantity();
		String unit = inStockRequest.getUnit();

		switch (unit) {
		case "尺":
			quantity = String.format("%.1f", Double.parseDouble(quantity) / 3.0);
			unit = "碼";
			inStockRequest.setQuantity(quantity);
			inStockRequest.setUnit(unit);
			break;
		case "打":
			quantity = String.format("%d", Integer.parseInt(quantity) * 12);
			unit = "個";
			inStockRequest.setQuantity(quantity);
			inStockRequest.setUnit(unit);
			break;
		default:
			break;
		}

		return inStockRequest;
	}

	/**
	 * Update or create Product quantity to db by a given Product list
	 */
	private void updateProductQuantityWithList(String productNo, List<Product> productList) {
		Map<String, String> typeQuantity = accumulateQuantityByTypeForSameProduct(productList);
		List<Product> result = new ArrayList<>();
		String unit = productList.get(0).getUnit();

		typeQuantity.keySet().forEach(type -> {
			Product p = productRepository.findByProductNoAndType(productNo, type).orElseGet(() -> {
				Product x = new Product();
				x.setProductNo(productNo);
				x.setType(type);
				x.setQuantity("0");
				x.setUnit(unit);

				return x;
			});

			p.setQuantity(String.format("%.1f",
					Double.parseDouble(typeQuantity.get(type)) + Double.parseDouble(p.getQuantity())));

			result.add(p);
		});

		productRepository.saveAll(result);
	}

	/**
	 * Helper method for accumulate "same" Product quantity by type
	 */
	private Map<String, String> accumulateQuantityByTypeForSameProduct(List<Product> productList) {
		Map<String, String> typeQuantity = new HashMap<>();

		for (Product p : productList) {
			if (!typeQuantity.containsKey(p.getType())) {
				typeQuantity.put(p.getType(), p.getQuantity());
			} else {
				String currentQuantity = typeQuantity.get(p.getType());
				typeQuantity.put(p.getType(), String.format("%.1f",
						Double.parseDouble(currentQuantity) + Double.parseDouble(p.getQuantity())));
			}
		}

		return typeQuantity;
	}

	/**
	 * Sum the quantity in Product with the original quantity in db, and update
	 */
	private void updateProductQuantity(String productNo, Product product) {
		String type = product.getType();

		// TODO: data not found exception
		Product res = productRepository.findByProductNoAndType(productNo, type).get();

		res.setQuantity(String.format("%.1f",
				Double.parseDouble(product.getQuantity()) + Double.parseDouble(res.getQuantity())));

//		productRepository.save(res);
	}

	/**
	 * Update certain StockInfo contents
	 */
	public String updateStockInfo(UpdateInfoRequest updateInfoRequest) {
		// TODO: data not found exception
		StockInfo res = stockInfoRepository.findById(updateInfoRequest.getId()).get();

		if (res.getColor() != updateInfoRequest.getColor()) {
			res.setColor(updateInfoRequest.getColor());
		}
		if (!res.getDefect().equals(updateInfoRequest.getDefect())) {
			res.setDefect(updateInfoRequest.getDefect());
		}
		if (!res.getRecord().equals(updateInfoRequest.getRecord())) {
			res.setRecord(updateInfoRequest.getRecord());
		}
		if (!res.getRemark().equals(updateInfoRequest.getRemark())) {
			res.setRemark(updateInfoRequest.getRemark());
		}

		return res.getStockIdentifier().getProductNo();
	}

	/**
	 * Return a response containing 'less' information for certain productNo
	 * fetching from second db and a list of StockInfoes with certain productNo
	 * fetching from first db
	 */
	public QueryProductNoResponse findBasicStockInfoByProductNo(String productNo) {
		return new QueryProductNoResponse(getStockInfoByProductNo(productNo), getBasicProductNoInfo(productNo));
	}

	/**
	 * Return a response containing information for certain productNo fetching from
	 * second db and a list of StockInfoes with certain productNo fetching from
	 * first db
	 */
	public QueryProductNoResponse findStockInfoByProductNo(String productNo) {
		return new QueryProductNoResponse(getStockInfoByProductNo(productNo), getProductNoInfo(productNo));
	}

	/**
	 * Fetch a list of StockInfoes with certain productNo from first db
	 */
	private List<StockInfo> getStockInfoByProductNo(String productNo) {
		List<StockInfo> result = new ArrayList<>();

		List<StockIdentifier> res = stockIdentifierRepo.findByProductNoAndIsExist(productNo.toUpperCase(), true)
				.orElseGet(ArrayList::new);

		if (!res.isEmpty()) {
			res.forEach(
					// TODO: data not found exception
					identifier -> result.add(stockInfoRepository.findByStockIdentifierId(identifier.getId()).get()));
		}

		return result;
	}

	/**
	 * Fetch less & necessary productNo information from second db
	 */
	private ProductInformation getBasicProductNoInfo(String productNo) {
		ProductInformation productInformation = new ProductInformation();
		EntityManager em = emf.createEntityManager();

		String queryBasicProductInfoSQLStatement = "SELECT CODE, CNAME, SPEC, PACKDESC, ADDTYPE, PICTURE FROM dbo.PRODUCT WHERE CODE= ?1";
		Query q1 = em.createNativeQuery(queryBasicProductInfoSQLStatement);
		q1.setParameter(1, productNo);
		List<?> resultList = q1.getResultList();

		if (!resultList.isEmpty()) {
			// directly use get(0), because productNo is unique in db
			Object[] cells = (Object[]) resultList.get(0);

			productInformation.setProductNo(nullValueHelper(cells[0].toString()));
			productInformation.setcName(nullValueHelper(cells[1].toString()));
			productInformation.setSpec(nullValueHelper(cells[2].toString()));
			productInformation.setPackDesc(nullValueHelper(cells[3].toString()));
			productInformation.setAddType(addTypeMappingHelper(Integer.parseInt(cells[4].toString())));
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

		String queryProductInfoSQLStatement = "SELECT x.CODE, x.CNAME, x.SPEC, x.SUPP, y.CNAME SUPPNAME, x.PRODDESC, x.USERFLD1, x.DESCRIP, x.PACKDESC, x.ADDTYPE, x.PICTURE FROM dbo.PRODUCT x INNER JOIN dbo.SUPPLIER y ON x.SUPP = y.CODE WHERE x.CODE= ?1";
		Query q = em.createNativeQuery(queryProductInfoSQLStatement);
		q.setParameter(1, productNo);
		List<?> resultList = q.getResultList();

		if (!resultList.isEmpty()) {
			// directly use get(0), because productNo is unique in db
			Object[] cells = (Object[]) resultList.get(0);

			productInformation.setProductNo(nullValueHelper(cells[0].toString()));
			productInformation.setcName(nullValueHelper(cells[1].toString()));
			productInformation.setSpec(nullValueHelper(cells[2].toString()));
			productInformation.setSupp(nullValueHelper(cells[3].toString()));
			productInformation.setSuppName(nullValueHelper(cells[4].toString()));
			productInformation.setProdDesc(nullValueHelper(cells[5].toString()));
			productInformation.setUserField1(nullValueHelper(cells[6].toString()));
			productInformation.setDescrip(nullValueHelper(cells[7].toString()));
			productInformation.setPackDesc(nullValueHelper(cells[8].toString()));
			productInformation.setAddType(addTypeMappingHelper(Integer.parseInt(cells[9].toString())));
			productInformation.setPicture(nullValueHelper(cells[10].toString()));
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
	 * stockIdentifier ship status is true and save a record to
	 * OutStockReqeust/TransactionRecord/Product repository
	 */
	public void letStockIdentifierisShiped(ShipRequest shipRequest) {
		// TODO: data not found exception
		StockIdentifier res = stockIdentifierRepo.findById(shipRequest.getStockIdentifierId()).get();
		StockInfo resInfo = stockInfoRepository.findByStockIdentifierId(res.getId()).get();

		// Create OutStockRequest object, set extra information and save it
		OutStockRequest outStockRequest = new OutStockRequest(res, resInfo, shipRequest.getReason());
		outStockRequest.setOutStockType(0);
		outStockRequestRepo.save(outStockRequest);

		// Update related information in StockIdentifier
		res.setExist(false);
		res.setShip(true);
		res.setShipReason(shipRequest.getReason());
		res.setOutStock(true);
		res.setOutStockAt(LocalDateTime.now());

		// Create TransactionRecord for ship and save it
		TransactionRecord transactionRecord = new TransactionRecord(res);
		transactionRecord.setOperator("-1");
		transactionRecord.setTransactionType("SPO");
		transactionRecordRepo.save(transactionRecord);

		// Create Product object to update Product quantity in db
		Product p = new Product(res);
		p.setQuantity("-" + p.getQuantity());
		updateProductQuantity(res.getProductNo(), p);
	}

	/**
	 * Cancel certain stockIdentifier ship process and update the corresponding
	 * OutStockReqeust/TransactionRecord as deleted, update Product repository
	 */
	public void letStockIdentifierisNotShiped(long stockIdentifierId) {
		// TODO: data not found exception
		StockIdentifier res = stockIdentifierRepo.findById(stockIdentifierId).get();

		// Update relative information in StockIdentifier
		res.setExist(true);
		res.setShip(false);
		res.setShipReason(null);
		res.setOutStock(false);
		res.setOutStockAt(null);

		// Set delete status in OutStockRequest
		// TODO: data not found exception
		outStockRequestRepo.findByStockIdentifierIdAndIsDeleted(stockIdentifierId, false).get().setDeleted(true);

		// Delete TransactionRecord
		// TODO: data not found exception
		transactionRecordRepo.delete(
				transactionRecordRepo.findByStockIdentifierIdAndTransactionType(stockIdentifierId, "SPO").get());

		// Create Product object to update Product quantity in db
		Product p = new Product(res);
		updateProductQuantity(res.getProductNo(), p);
	}

	/**
	 * Fetch a list of StockInfo assigned to shrinking process
	 */
	public List<StockInfo> getWaitToShrinkList() {
		List<StockInfo> result = new ArrayList<>();
		List<StockIdentifier> res = stockIdentifierRepo.findByWaitToShrinkAndIsExist(true, true)
				.orElseGet(ArrayList::new);

		if (!res.isEmpty()) {
			res.forEach(
					// TODO: data not found exception
					identifier -> result.add(stockInfoRepository.findByStockIdentifierId(identifier.getId()).get()));
		}

		return result;
	}

	/**
	 * Mark certain stockIdentifier waiting for shrinking process and save a record
	 * to outStockReqeust repository/TransactionRecord/Product repository
	 */
	public String letStockIdentifierWaitToShrinkIsTrue(long stockIdentifierId) {
		// TODO: data not found exception
		StockIdentifier res = stockIdentifierRepo.findById(stockIdentifierId).get();
		StockInfo resInfo = stockInfoRepository.findByStockIdentifierId(res.getId()).get();
		OutStockRequest outStockRequest = new OutStockRequest(res, resInfo, "減肥");

		res.setWaitToShrink(true);
		res.setOutStock(true);
		res.setOutStockAt(LocalDateTime.now());
		// TODO: avoid multiple click

		// Set extra information in OutStockRequest
		outStockRequest.setOutStockType(1);
		outStockRequestRepo.save(outStockRequest);

		return res.getProductNo();
	}

	/**
	 * Cancel certain stockIdentifier shrinking process and update the corresponding
	 * outStockRequest record as deleted
	 */
	public void letStockIdentifierWaitToShrinkIsFalse(long stockIdentifierId) {
		// TODO: data not found exception
		StockIdentifier res = stockIdentifierRepo.findById(stockIdentifierId).get();

		// Set delete status in OutStockRequest
		outStockRequestRepo.findByStockIdentifierIdAndIsDeleted(stockIdentifierId, false).get().setDeleted(true);

		// Update relative information in StockIdentifier
		res.setWaitToShrink(false);
		res.setOutStock(false);
		res.setOutStockAt(null);
	}

	/**
	 * Using given information containing in ShrinkStockRequest to update old
	 * StockIdentifier and create new StockIdentifier/StockInfo
	 */
	public void shrinkStock(ShrinkStockRequest shrinkStockRequest) throws IOException {
		LocalDate now = LocalDate.now();

		// find old stockIdentifier, and set to not exist
		// TODO: data not found exception
		StockIdentifier oldIdentifier = stockIdentifierRepo.findById(shrinkStockRequest.getOldStockIdentifierId())
				.get();

		oldIdentifier.setExist(false);

		// Create TransactionRecord for oldStock shrink and save it
		TransactionRecord transactionRecord = new TransactionRecord(oldIdentifier);

		transactionRecord.setOperator("-1");
		transactionRecord.setTransactionType("SKO");

		transactionRecordRepo.save(transactionRecord);

		String productNo = oldIdentifier.getProductNo();
		String unit = oldIdentifier.getUnit();

		// Create Product object to update Product quantity in db
		Product p = new Product(oldIdentifier);
		p.setQuantity("-" + p.getQuantity());
		updateProductQuantity(productNo, p);

		// Then batch create new stockInfo for offspring
		createStockInfoes(shrinkStockRequest.getInStockRequests());

		// Create StockAllocationRecord object
		// and output to record file when allocation != 0
		float allocation = shrinkStockRequest.getAllocation();

		if (allocation != 0) {
			String unitReference = productBaseUnitRetrieve(productNo);
			String allocationString = String.format("%.1f", allocation);

			// Create StockAllocationRecord, and save
			StockAllocationRecord stockAllocationRecord = new StockAllocationRecord(productNo, unit);

			stockAllocationRecord.setQuantity(allocationString);
			stockAllocationRecord.setIssuedByStockIdentifier(oldIdentifier.getId());

			// If oldIdentifier unit != unitReference, do quantity conversion
			if (unitReference.equals(unit)) {
				stockAllocationRecord.setRealQuantity(allocationString);
			} else {
				stockAllocationRecord.setRealQuantity(String.format("%.1f", allocation * 3.0));
			}

			stockAllocationRecordRepo.save(stockAllocationRecord);

			// Output to file
			String allocationFileName = StockAllocateRecordExcelHelper.createNewFile(now);
			StockAllocateRecordExcelHelper.modifyExisting(stockAllocationRecord, now, allocationFileName);
		}

		// Create StockAdjustmentRecord object
		// and output to record file when adjustment != 0
		float adjustment = shrinkStockRequest.getAdjustment();

		if (adjustment != 0) {
			String unitReference = productBaseUnitRetrieve(productNo);
			String adjustmentString = String.format("%.1f", adjustment);

			// Create StocAdjustmnetRecord, and save
			StockAdjustmentRecord stockAdjustmentRecord = new StockAdjustmentRecord(productNo, unit);

			stockAdjustmentRecord.setQuantity(adjustmentString);
			stockAdjustmentRecord.setIssuedByStockIdentifier(oldIdentifier.getId());

			// If oldIdentifier unit != unitReference, do quantity conversion
			if (unitReference.equals(unit)) {
				stockAdjustmentRecord.setRealQuantity(adjustmentString);
			} else {
				stockAdjustmentRecord.setRealQuantity(String.format("%.1f", adjustment * 3.0));
			}

			stockAdjustmentRecordRepo.save(stockAdjustmentRecord);

			// Output to file
			String adjustmentFileName = StockAdjustRecordExcelHelper.createNewFile(now);
			StockAdjustRecordExcelHelper.modifyExisting(stockAdjustmentRecord, now, adjustmentFileName);
		}

	}

	/**
	 * Retrieve certain product base unit from 2nd db
	 */
	private String productBaseUnitRetrieve(String productNo) {
		String queryProductInfoSQLStatement = "SELECT UNIT FROM dbo.PRODUCT WHERE CODE=?1";
		EntityManager em = emf.createEntityManager();
		Query q = em.createNativeQuery(queryProductInfoSQLStatement);

		q.setParameter(1, productNo);

		// The format of q.getResultList() is : { Row n : [UNIT] }
		return unitMappingHelper(q.getResultList().get(0).toString());
	}

	/**
	 * Save a special outStockRequest to repository
	 */
	public OutStockRequest createOutStockRequest(OutStockRequest outStockRequest) {
		outStockRequest.setOutStockType(2);

		return outStockRequestRepo.save(outStockRequest);
	}

	/**
	 * Delete method for special outStockRequest
	 */
	public void deleteOutStockRequest(long outStockRequestId) {
		// TODO: data not found exception
		outStockRequestRepo.findById(outStockRequestId).get().setDeleted(true);
	}

	/**
	 * Return a response containing a list of waitHandle records created at 'today'
	 * in outStockRequest repository and a list of create users collected in
	 * previous list
	 */
	public HandleListResponse getOutStockWaitHandleList() {
		LocalDateTime today = LocalDate.now().atStartOfDay();

		Specification<OutStockRequest> specification = (Specification<OutStockRequest>) (root, query,
				criteriaBuilder) -> {
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
		};

		// query results after filter
		List<OutStockRequest> resultList = outStockRequestRepo.findAll(specification);

		Map<String, List<OutStockRequest>> resultMap = new HashMap<>();
		Set<String> userSet = new HashSet<>();
		DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;

		// store the results at the certain day in the Map
		resultMap.put(today.format(formatter), resultList);

		// collect all users showing within createdBy attribute
		resultList.forEach(outStockRequest -> userSet.add(outStockRequest.getCreatedBy()));

		return new HandleListResponse(new ArrayList<>(userSet), resultMap);
	}

	/**
	 * Return a response containing a list of waitHandle records created between
	 * 'start' and 'end' in outStockRequest repository and a list of create users
	 * collected in previous list
	 */
	public HandleListResponse getOutStockWaitHandleListWithTimeInterval(String start, String end) {
		LocalDateTime startDateTime = LocalDateTime.parse(start, DateTimeFormatter.ISO_LOCAL_DATE_TIME).plusHours(8);
		LocalDateTime endDateTime = LocalDateTime.parse(end, DateTimeFormatter.ISO_LOCAL_DATE_TIME).plusHours(8);

		Specification<OutStockRequest> specification = (Specification<OutStockRequest>) (root, query,
				criteriaBuilder) -> {
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
		};

		// query results after filter
		List<OutStockRequest> resultList = outStockRequestRepo.findAll(specification);

		List<LocalDate> dateList = new ArrayList<>();
		Map<String, List<OutStockRequest>> resultMap = new HashMap<>();
		Set<String> userSet = new HashSet<>();

		// create a date list containing days between start and end
		Period period = Period.between(startDateTime.toLocalDate(), endDateTime.toLocalDate());
		int dayInterval = period.getDays();

		for (int i = 0; i <= dayInterval; i += 1) {
			LocalDate d = startDateTime.plusDays(i).toLocalDate();
			dateList.add(d);
		}

		// filter the requests with given date and store the filter results in the Map
		dateList.forEach(date -> {
			List<OutStockRequest> filterResultList = resultList.stream()
					.filter(outStockRequest -> outStockRequest.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE)
							.equals(date.format(DateTimeFormatter.ISO_LOCAL_DATE)))
					.collect(Collectors.toList());
			resultMap.put(date.format(DateTimeFormatter.ISO_LOCAL_DATE), filterResultList);
		});

		// collect all users showing within createdBy attribute
		resultList.forEach(outStockRequest -> userSet.add(outStockRequest.getCreatedBy()));

		return new HandleListResponse(new ArrayList<>(userSet), resultMap);
	}

	/**
	 * Update outStockRequest using given outStockUpdateRequest, and create excel at
	 * server for user download
	 */
	public void updateOutStockRequest(OutStockUpdateRequest outStockUpdateRequest) throws IOException {
		Map<Long, String> updateRequest = outStockUpdateRequest.getOutStockUpdate();
		List<OutStockRequest> tempList = new ArrayList<>();
		LocalDateTime now = LocalDateTime.now();

		// Create a excel for this updateRequest for later modification
		String fileName = OutStockRequestExcelHelper.createNewFile(now);

		// Use id stored in update request as key to update database
		updateRequest.keySet().forEach(id -> {
			// TODO: data not found exception
			OutStockRequest res = outStockRequestRepo.findById(id).get();
			res.setRequestFrom(updateRequest.get(id));
			res.setHandled(true);
			res.setFileName(fileName);
			tempList.add(res);
		});

		// write res information into excel
		try {
			OutStockRequestExcelHelper.modifyExisting(tempList, now, fileName);
		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	/**
	 * Daily stock comparison between 2 databases based on TransactionRecord
	 */
	public void stockComparisonByTransactionRecord() throws IOException {
		LocalDateTime startTime = LocalDateTime.of(LocalDate.of(2019, 12, 06), LocalTime.of(0, 0, 0));
		LocalDateTime endTime = LocalDateTime.of(LocalDate.of(2019, 12, 06), LocalTime.of(23, 59, 59));
		String fileName = DailyStockComparisonExcelHelper.createNewFile(startTime.toLocalDate()); // TODO : track now

		// Define query criteria : createdAt between startTime and endTime
		Specification<TransactionRecord> specification = (Specification<TransactionRecord>) (root, query,
				criteriaBuilder) -> {
			List<Predicate> predicatesList = new ArrayList<>();

			if (startTime != null && endTime != null) {
				Predicate startFromPredicate = criteriaBuilder.between(root.get("createdAt"), startTime, endTime);
				predicatesList.add(startFromPredicate);
			}

			Predicate[] predicates = new Predicate[predicatesList.size()];

			return criteriaBuilder.and(predicatesList.toArray(predicates));
		};

		Set<String> productNoStringSet = new HashSet<>();

		// Pick-up distinct productNo from TransactionRecord
		transactionRecordRepo.findAll(specification).forEach(tr -> productNoStringSet.add(tr.getProductNo()));

		EntityManager em = emf.createEntityManager();
		String queryProductCQTYAndUnitSQLStatement = "SELECT x.PROD, x.GWN, x.CQTY, y.UNIT FROM dbo.PRODQTY x INNER JOIN dbo.PRODUCT y ON y.CODE = x.PROD WHERE x.PROD=?1";

		// Based on productNoStringSet, compare each product quantity
		// between 1st db and 2nd db
		productNoStringSet.forEach(productNo -> {
			// Get productNo current quantity from 1st db
			List<Product> firstDBRes = productRepository.findByProductNo(productNo);

			// Get productNo current quantity from 2nd db
			List<Product> secondDBRes = new ArrayList<>();
			Query q = em.createNativeQuery(queryProductCQTYAndUnitSQLStatement);
			q.setParameter(1, productNo);

			// The format of q.getResultList() is as below:
			// Row n : [PROD, GWN , CQTY, UNIT]
			for (Object row : q.getResultList()) {
				Object[] cell = (Object[]) row;
				Product p = new Product();

				p.setProductNo(productNo);
				p.setType(typeMappingHelper(cell[1].toString()));

				String quantity = cell[2].toString();
				Integer unit = Integer.parseInt(cell[3].toString());

				switch (unit) {
				case 3: // 尺
					quantity = String.format("%.1f", Double.parseDouble(quantity) / 3.0);
					unit = 2;
					break;
				case 7: // 打
					quantity = String.format("%d", Integer.parseInt(quantity) * 12);
					unit = 6;
					break;
				default:
					break;
				}

				p.setQuantity(quantity);
				p.setUnit(unitMappingHelper(unit.toString()));

				secondDBRes.add(p);
			}

			String unitString = firstDBRes.get(0).getUnit();

			// Accumulate quantity by type
			Map<String, String> firstTypeQuantity = accumulateQuantityByTypeForSameProduct(firstDBRes);
			Map<String, String> secondTypeQuantity = accumulateQuantityByTypeForSameProduct(secondDBRes);

			// Compare quantity of each type and output to excel
			List<List<String>> compareResult = new ArrayList<>();

			firstTypeQuantity.forEach((type, quantity) -> {
				List<String> tempResultList = new ArrayList<>();
				String secondDBQTY = secondTypeQuantity.get(type);

				tempResultList.add(productNo);
				tempResultList.add(type);
				tempResultList.add(secondDBQTY);
				tempResultList.add(quantity);
				tempResultList.add(unitString);

				if (quantity.equals(secondDBQTY)) {
					tempResultList.add("Pass");
				} else {
					tempResultList.add("Fail");
					tempResultList
							.add(String.format("%.1f", Double.parseDouble(quantity) - Double.parseDouble(secondDBQTY)));
				}

				compareResult.add(tempResultList);
			});

			try {
				DailyStockComparisonExcelHelper.outputComparisonResult(compareResult, startTime.toLocalDate(),
						fileName);
			} catch (Exception e) {
				e.printStackTrace();
			}
		});
	}

	/**
	 * Weakly stock comparison between 2 databases
	 */
	public void stockFullyComparison() throws IOException {
		LocalDate now = LocalDate.now();
		String fileName = WeeklyStockComparisonExcelHelper.createNewFile(now);

		// Get all product quantity from 1st db
		List<Product> firstDBResList = productRepository.findAll();

		// Get all product quantity from 2nd db
		Map<String, Map<String, Product>> secondDBRes = new HashMap<>();
		EntityManager em = emf.createEntityManager();
		String queryProductCQTYAndUnitSQLStatement = "SELECT x.PROD, x.GWN, x.CQTY, y.UNIT FROM dbo.PRODQTY x INNER JOIN dbo.PRODUCT y ON y.CODE = x.PROD WHERE x.GWN='AB' OR x.GWN='AC' OR x.GWN='AD' OR x.GWN='AE' OR x.GWN='AP'";
		Query q = em.createNativeQuery(queryProductCQTYAndUnitSQLStatement);

		// The format of q.getResultList() is as below:
		// Row n : [PROD, GWN , CQTY, UNIT]
		// Create Product object based on query result, then put it into a map with
		// structure like { productNo : {type : Product object} }
		for (Object row : q.getResultList()) {
			Object[] cell = (Object[]) row;
			String type = typeMappingHelper(cell[1].toString());

			if (!type.equals("")) {
				Product p = new Product();

				String productNo = cell[0].toString();
				String quantity = cell[2].toString();
				Integer unit = Integer.parseInt(cell[3].toString());

				switch (unit) {
				case 3: // 尺
					quantity = String.format("%.1f", Double.parseDouble(quantity) / 3.0);
					unit = 2;
					break;
				case 7: // 打
					quantity = String.format("%d", Integer.parseInt(quantity) * 12);
					unit = 6;
					break;
				default:
					break;
				}

				p.setProductNo(productNo);
				p.setType(type);
				p.setQuantity(quantity);
				p.setUnit(unitMappingHelper(unit.toString()));

				boolean checkProductExist = secondDBRes.containsKey(productNo);

				if (!checkProductExist) {
					Map<String, Product> typeProduct = new HashMap<>();
					typeProduct.put(type, p);
					secondDBRes.put(productNo, typeProduct);
				} else if (!secondDBRes.get(productNo).containsKey(type)) {
					secondDBRes.get(productNo).put(type, p);
				} else {
					Product temp = secondDBRes.get(productNo).get(type);
					temp.setQuantity(String.format("%.1f",
							Double.parseDouble(temp.getQuantity()) + Double.parseDouble(quantity)));
				}
			}
		}

		// Based on 1st db, compare quantity of each product/type with 2nd db
		// and store comparison result
		List<List<String>> compareResult = new ArrayList<>();

		for (Product p1 : firstDBResList) {
			List<String> tempResultList = new ArrayList<>();
			String productNo = p1.getProductNo();
			String type = p1.getType();
			String firstDBQTY = p1.getQuantity();
			String unit = p1.getUnit();
			boolean checkProductExistIn2nd = secondDBRes.containsKey(productNo);

			// Only if both productNo&type exist in secondDBRes, it need to compare
			// quantity; otherwise, comparison always fail;
			// then add comparison result to compareResult list
			if (checkProductExistIn2nd && secondDBRes.get(productNo).containsKey(type)) {
				Product p2 = secondDBRes.get(productNo).get(type);
				String secondDBQTY = p2.getQuantity();

				tempResultList.add(productNo);
				tempResultList.add(type);
				tempResultList.add(secondDBQTY);
				tempResultList.add(firstDBQTY);
				tempResultList.add(unit);

				if (firstDBQTY.equals(secondDBQTY)) {
					tempResultList.add("Pass");
				} else {
					tempResultList.add("Fail");
					tempResultList.add(
							String.format("%.1f", Double.parseDouble(firstDBQTY) - Double.parseDouble(secondDBQTY)));
				}

				// After comparing, remove p1 data from the map under productNo in secondDBRes;
				// if there is no object under productNo, remove productNo in secondDBRes
				secondDBRes.get(productNo).remove(type);

				if (secondDBRes.get(productNo).isEmpty()) {
					secondDBRes.remove(productNo);
				}
			} else {
				tempResultList.add(productNo);
				tempResultList.add(type);
				tempResultList.add("");
				tempResultList.add(firstDBQTY);
				tempResultList.add(unit);
				tempResultList.add("Fail");
				tempResultList.add(firstDBQTY);
			}

			compareResult.add(tempResultList);
		}

		// If secondDBRes is not empty, which means some data do not record in 1st db.
		// Extract certain condition records, and add to compareResult
		// The filter conditions : (1) type != "雜項", (2) quantity != 0
		if (!secondDBRes.isEmpty()) {
			secondDBRes.keySet().forEach(product -> secondDBRes.get(product).keySet().forEach(type -> {
				if (!type.equals("雜項")) {
					List<String> rest = new ArrayList<>();
					Product p = secondDBRes.get(product).get(type);
					String quantity = p.getQuantity();

					if (Double.parseDouble(quantity) != 0) {
						rest.add(product);
						rest.add(type);
						rest.add(quantity);
						rest.add("");
						rest.add(p.getUnit());
						rest.add("Fail");
						rest.add(String.format("%.1f", Double.parseDouble(quantity) * -1));

						compareResult.add(rest);
					}
				}
			}));
		}

		try {
			WeeklyStockComparisonExcelHelper.outputComparisonResult(compareResult, now, fileName);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
