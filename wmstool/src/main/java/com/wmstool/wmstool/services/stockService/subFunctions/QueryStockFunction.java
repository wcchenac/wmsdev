package com.wmstool.wmstool.services.stockService.subFunctions;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Query;
import javax.persistence.criteria.Predicate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import com.wmstool.wmstool.models.InStockOrderRecord;
import com.wmstool.wmstool.models.Product;
import com.wmstool.wmstool.models.StockIdentifier;
import com.wmstool.wmstool.models.StockInfo;
import com.wmstool.wmstool.models.payloads.ProductInformation;
import com.wmstool.wmstool.models.payloads.QueryProductNoResponse;
import com.wmstool.wmstool.repositories.InStockOrderRepo;
import com.wmstool.wmstool.repositories.ProductRepository;
import com.wmstool.wmstool.repositories.StockIdentifierRepo;
import com.wmstool.wmstool.repositories.StockInfoRepository;
import com.wmstool.wmstool.repositories.TransactionRecordRepo;
import com.wmstool.wmstool.services.HistoryService;
import com.wmstool.wmstool.utilities.CategoryDetailExcelHelper;
import com.wmstool.wmstool.utilities.HistoryTreeNode;

@Component
public class QueryStockFunction {

	@Autowired
	@Qualifier("dataDbEntityManagerFactory")
	private EntityManagerFactory emf;

	@Autowired
	@Qualifier("WmstoolEntityManagerFactory")
	private EntityManagerFactory emf_wms;

	@Autowired
	private StockIdentifierRepo stockIdentifierRepo;

	@Autowired
	private StockInfoRepository stockInfoRepository;

	@Autowired
	private InStockOrderRepo inStockOrderRepo;

	@Autowired
	private TransactionRecordRepo transactionRecordRepo;

	@Autowired
	private HistoryService historyService;

	@Autowired
	private ProductRepository productRepository;

	@Autowired
	private CategoryDetailExcelHelper categoryDetailExcelHelper;

	private final String queryBasicProductInfoSQLStatement = "SELECT * FROM dbo.BasicProductInfo WHERE CODE= ?1";
	private final String queryProductInfoSQLStatement = "SELECT * FROM dbo.ProductInfo WHERE CODE= ?1";
	private final String queryCategoryDetailSQLStatement = "SELECT * FROM wms.categorydetail WHERE category= ?1";
	private final String queryProductInfoForCategoryDetailSQLStatement = "SELECT CODE, SUPP, SUPPNAME, CCOST, CNAME, DESCRIP FROM dbo.ProductInfo WHERE CLAS=?1";
	private final String querySaleRecordsForCategoryDetailSQLStatement = "SELECT * FROM wms.salerecords WHERE category = ?1";

	/**
	 * Return a response containing 'less' information for certain productNo
	 * fetching from second db and a list of StockInfoes with certain productNo
	 * fetching from first db
	 */
	public QueryProductNoResponse findBasicStockInfoByProductNo(String productNo) {
		return new QueryProductNoResponse(getStockInfoByProductNo(productNo), getProductNoInfo(productNo, true),
				getProductsByProductNo(productNo), nearByProductNo(productNo));
	}

	/**
	 * Return a response containing information for certain productNo fetching from
	 * second db and a list of StockInfoes with certain productNo fetching from
	 * first db and current total quantity
	 */
	public QueryProductNoResponse findStockInfoByProductNoWithQuantity(String productNo) {
		return new QueryProductNoResponse(getStockInfoByProductNo(productNo), getProductNoInfo(productNo, false),
				getProductsByProductNo(productNo), nearByProductNo(productNo));
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
	 * Collect all inStockRecord with certain orderType/orderNo, and return result
	 * with structure {productNo: StockInfo list}
	 */
	public Map<String, List<StockInfo>> getInStockRollbackList(String orderType, String orderNo) {
		Map<String, List<StockInfo>> result = new HashMap<>();
		List<InStockOrderRecord> processedRecords = inStockOrderRepo.findByInStockTypeAndInStockOrderNo(orderType,
				orderNo);

		if (processedRecords.size() == 0) {
			return result;
		}

		processedRecords.forEach(record -> {
			if (!result.containsKey(record.getProductNo())) {
				List<StockInfo> tempList = new ArrayList<>();

				tempList.add(stockInfoRepository.findByStockIdentifierId(record.getStockIdentifierId()).get());

				result.put(record.getProductNo(), tempList);
			} else {
				result.get(record.getProductNo())
						.add(stockInfoRepository.findByStockIdentifierId(record.getStockIdentifierId()).get());
			}
		});

		return result;
	}

	/**
	 * Return a list of HistoryTreeNode composed of top 5 transaction records with
	 * SKO type ordered by create time
	 */
	public List<HistoryTreeNode> findByPeriodTransactionRecord(String productNo) {
		List<HistoryTreeNode> result = new ArrayList<>();

		transactionRecordRepo.findTop5ByProductNoAndTransactionTypeOrderByCreatedAtDesc(productNo, "SKO")
				.forEach(transaction -> {
					result.add(historyService.createHistoryTreeByIdentifierId(transaction.getStockIdentifierId()));
				});

		return result;
	}

	/**
	 * Based on each start StockIdentifier, collect process histories from
	 * InStock(Start) to Shrink/Ship(End) with a certain productNo in a period time,
	 * and return the result list with a hierarchical structure
	 */
	public List<HistoryTreeNode> findPeriodStockIdentifierHistory(String productNo, String start, String end) {
		LocalDateTime startDateTime = LocalDateTime.parse(start, DateTimeFormatter.ISO_LOCAL_DATE_TIME).plusHours(8);
		LocalDateTime endDateTime = LocalDateTime.parse(end, DateTimeFormatter.ISO_LOCAL_DATE_TIME).plusHours(8);

		Specification<InStockOrderRecord> specification = (Specification<InStockOrderRecord>) (root, query,
				criteriaBuilder) -> {
			List<Predicate> predicatesList = new ArrayList<>();

			Predicate productNoPredicate = criteriaBuilder.equal(root.get("productNo"), productNo);
			predicatesList.add(productNoPredicate);

			if (startDateTime != null && endDateTime != null) {
				Predicate startFromPredicate = criteriaBuilder.between(root.get("createdAt"), startDateTime,
						endDateTime);
				predicatesList.add(startFromPredicate);
			}

			query.orderBy(criteriaBuilder.asc(root.get("createdAt")));

			Predicate[] predicates = new Predicate[predicatesList.size()];

			return criteriaBuilder.and(predicatesList.toArray(predicates));
		};

		List<InStockOrderRecord> resultOfInStockOrderRecord = inStockOrderRepo.findAll(specification);
		List<HistoryTreeNode> resultOfHistoryTree = new ArrayList<>();

		resultOfInStockOrderRecord.forEach(inStockOrderRecord -> {
			resultOfHistoryTree
					.add(historyService.createHistoryTreeByIdentifierId(inStockOrderRecord.getStockIdentifierId()));
		});

		return resultOfHistoryTree;
	}

	/**
	 * Return a category list
	 */
	public List<Map<String, String>> getAllCategory() {
		List<Map<String, String>> result = new ArrayList<>();

		for (String category : productRepository.getAllCategory()) {
			Map<String, String> temp = new HashMap<>();

			temp.put("label", category);
			temp.put("value", category);

			result.add(temp);
		}

		return result;
	}

	/**
	 * Return a filename, and the file is composed of pictures, existed stock, based
	 * on a certain category
	 */
	public void findCategoryDetails(String category) throws FileNotFoundException, IOException {
		EntityManager em_wms = emf_wms.createEntityManager();
		EntityManager em = emf.createEntityManager();

		// query remain stock which belong to certain category
		Query q_stockResult = em_wms.createNativeQuery(queryCategoryDetailSQLStatement);
		q_stockResult.setParameter(1, category);

		// query product information of all productNo which belong to certain category
		Query q_prodInfo = em.createNativeQuery(queryProductInfoForCategoryDetailSQLStatement);
		q_prodInfo.setParameter(1, category);

		// query sale records of all productNo which belong to certain category
		Query q_saleRecords = em_wms.createNativeQuery(querySaleRecordsForCategoryDetailSQLStatement);
		q_saleRecords.setParameter(1, category);

		categoryDetailExcelHelper.outputCategoryResult(category, q_stockResult.getResultList(),
				collectProdInfoForCategoryDetail(q_prodInfo.getResultList()),
				summarySaleRecords(q_saleRecords.getResultList()));
	}

	/**
	 * Return the previous/next productNo in a sorted all-product list at first DB
	 */
	private Map<String, String> nearByProductNo(String productNo) {
		Map<String, String> result = new HashMap<>();
		List<String> productList = productRepository.getAllProducts();
		int target = productList.indexOf(productNo);
		int prev = (target - 1) < 0 ? -1 : (target - 1);
		int next = (target + 1) > productList.size() - 1 ? -1 : (target + 1);

		result.put("prev", prev == -1 ? null : productList.get(prev));
		result.put("next", next == -1 ? null : productList.get(next));

		return result;
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
	 * Fetch a list of Products with certain productNo from first db
	 */
	private List<Product> getProductsByProductNo(String productNo) {
		return productRepository.findByProductNo(productNo);
	}

	/**
	 * Fetch necessary productNo information from second db
	 */
	private ProductInformation getProductNoInfo(String productNo, boolean basicMode) {
		ProductInformation productInformation = new ProductInformation();
		EntityManager em = emf.createEntityManager();

		Query q = em.createNativeQuery(basicMode ? queryBasicProductInfoSQLStatement : queryProductInfoSQLStatement);
		q.setParameter(1, productNo);
		List<?> resultList = q.getResultList();

		if (!resultList.isEmpty()) {
			// directly use get(0), because productNo is unique in db
			Object[] cells = (Object[]) resultList.get(0);

			productInformation.setProductNo(nullValueHelper(cells[0].toString()));
			productInformation.setcName(nullValueHelper(cells[1].toString()));
			productInformation.setSpec(nullValueHelper(cells[2].toString()));

			if (basicMode) {
				productInformation.setPackDesc(nullValueHelper(cells[3].toString()));
				productInformation.setAddType(addTypeMappingHelper(Integer.parseInt(cells[4].toString())));
				productInformation.setPicture(nullValueHelper(cells[5].toString()));
			} else {
				productInformation.setSupp(nullValueHelper(cells[3].toString()));
				productInformation.setSuppName(nullValueHelper(cells[4].toString()));
				productInformation.setProdDesc(nullValueHelper(cells[5].toString()));
				productInformation.setUserField1(nullValueHelper(cells[6].toString()));
				productInformation.setDescrip(nullValueHelper(cells[7].toString()));
				productInformation.setPackDesc(nullValueHelper(cells[8].toString()));
				productInformation.setAddType(addTypeMappingHelper(Integer.parseInt(cells[9].toString())));
				productInformation.setPicture(nullValueHelper(cells[10].toString()));
				productInformation.setcCost(nullValueHelper(cells[11].toString()));
			}
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
			return addType = "無";
		case 1:
			return addType = "可追加";
		case 2:
			return addType = "不可追加";
		case 3:
			return addType = "暫缺貨";
		case 4:
			return addType = "無貨";
		default:
			return addType;
		}
	}

	/**
	 * Helper method for collecting required product information
	 */
	private Map<String, String[]> collectProdInfoForCategoryDetail(List<?> produtctInfo) {
		Map<String, String[]> result = new HashMap<>();

		for (Object row : produtctInfo) {
			Object[] cells = (Object[]) row;

			String[] temp = { cells[1].toString(), cells[2].toString(), cells[3].toString(), cells[4].toString(),
					cells[5].toString() };

			result.put(cells[0].toString(), temp);
		}

		return result;
	}

	/**
	 * Helper method for sale records summary and store into a structured map
	 * {productNo: { reason : { quantity: "", unit : "" }}}
	 */
	private Map<String, Map<String, Map<String, String>>> summarySaleRecords(List<?> saleRecords) {
		Map<String, Map<String, Map<String, String>>> result = new HashMap<>();

		for (Object row : saleRecords) {
			Object[] cells = (Object[]) row;
			String productNo = cells[0].toString();
			String reason = cells[1].toString();
			String quantity = cells[2].toString();
			String unit = cells[3].toString();

			if (!result.containsKey(productNo)) {
				Map<String, Map<String, String>> reason_property = new HashMap<>();
				Map<String, String> property = new HashMap<>();

				property.put("quantity", quantity);
				property.put("unit", unit);

				reason_property.put(reason, property);
				result.put(productNo, reason_property);
			} else {
				Map<String, Map<String, String>> temp_reason_property = result.get(productNo);

				if (!temp_reason_property.containsKey(reason)) {
					Map<String, String> property = new HashMap<>();

					property.put("quantity", quantity);
					property.put("unit", unit);

					temp_reason_property.put(reason, property);
				} else {
					Map<String, String> temp_property = temp_reason_property.get(reason);

					temp_property.put("quantity", String.format("%.2f",
							Double.parseDouble(temp_property.get("quantity")) + Double.parseDouble(quantity)));
				}
			}
		}

		return result;
	}
}
