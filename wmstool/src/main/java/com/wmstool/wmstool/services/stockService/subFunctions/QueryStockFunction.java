package com.wmstool.wmstool.services.stockService.subFunctions;

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
import com.wmstool.wmstool.utilities.HistoryTreeNode;

@Component
public class QueryStockFunction {

	@Autowired
	@Qualifier("dataDbEntityManagerFactory")
	private EntityManagerFactory emf;

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

	private final String queryBasicProductInfoSQLStatement = "SELECT CODE, CNAME, SPEC, PACKDESC, ADDTYPE, PICTURE FROM dbo.PRODUCT WHERE CODE= ?1";
	private final String queryProductInfoSQLStatement = "SELECT x.CODE, x.CNAME, x.SPEC, x.SUPP, y.CNAME SUPPNAME, x.PRODDESC, x.USERFLD1, x.DESCRIP, x.PACKDESC, x.ADDTYPE, x.PICTURE, x.CCOST FROM dbo.PRODUCT x INNER JOIN dbo.SUPPLIER y ON x.SUPP = y.CODE WHERE x.CODE= ?1";

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

	// TODO
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

}
