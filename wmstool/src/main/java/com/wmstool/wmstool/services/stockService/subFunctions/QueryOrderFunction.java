package com.wmstool.wmstool.services.stockService.subFunctions;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Query;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.wmstool.wmstool.models.InStockOrderRecord;
import com.wmstool.wmstool.models.payloads.ProductInformation;
import com.wmstool.wmstool.models.payloads.QueryOrderResponse;
import com.wmstool.wmstool.repositories.InStockOrderRepo;

@Component
public class QueryOrderFunction {

	@Autowired
	@Qualifier("dataDbEntityManagerFactory")
	private EntityManagerFactory emf;

	@Autowired
	private InStockOrderRepo inStockOrderRepo;

	@Autowired
	private StockServiceUtilities stockServiceUtilities;

	private final String InStockType_Normal = "normal";
	private final String InStockType_Assemble = "assemble";
	private final String InStockType_CustomerReturn = "customerReturn";
	private final String InStockType_StoreReturn = "storeReturn";

	private final String inStockOrderSQLStatement = "SELECT * FROM dbo.InstockOrder WHERE CODE= ?1";
	private final String assembleOrderAndProductUnitSQLStatement = "SELECT * FROM dbo.AssembleOrder WHERE CODE = ?1";
	private final String customerReturnOrderSQLStatement = "SELECT * FROM dbo.CustomerReturnOrder WHERE CODE= ?1";
	private final String storeReturnOrderSQLStatement = "SELECT * FROM dbo.StoreReturnOrder WHERE CODE= ?1";
	private final String outStockToStoreOrderSQLStatement = "SELECT * FROM dbo.OutStockToStoreOrder WHERE OrderNo = ?1 Order By SERIAL";

	/**
	 * Return a response containing current 'in-stock' order content fetching from
	 * second db and previous process records fetching from first db
	 */
	public QueryOrderResponse queryInStockOrder(String inStockOrderNo) {
		Map<String, Map<String, Map<String, String>>> currentOrderStatus = getInStockOrderContent(inStockOrderNo);
		Map<String, Map<String, Map<String, String>>> prevOrderStatus = getOrderRecord(InStockType_Normal,
				inStockOrderNo);
		Map<String, Map<String, Map<String, String>>> waitHandleStatus = deriveWaitHandleStatus(currentOrderStatus,
				prevOrderStatus);
		return new QueryOrderResponse(currentOrderStatus, waitHandleStatus);
	}

	/**
	 * Return a response containing current 'assemble' order content fetching from
	 * second db and previous process records fetching from first db
	 */
	public QueryOrderResponse queryAssembleOrder(String assembleOrderNo) {
		Map<String, Map<String, Map<String, String>>> currentOrderStatus = getAssembleOrderContent(assembleOrderNo);
		Map<String, Map<String, Map<String, String>>> prevOrderStatus = getOrderRecord(InStockType_Assemble,
				assembleOrderNo);
		Map<String, Map<String, Map<String, String>>> waitHandleStatus = deriveWaitHandleStatus(currentOrderStatus,
				prevOrderStatus);
		return new QueryOrderResponse(currentOrderStatus, waitHandleStatus);
	}

	/**
	 * Return a response containing current 'customer return' order content fetching
	 * from second db and previous process records fetching from first db
	 */
	public QueryOrderResponse queryCustomerReturnOrder(String returnOrderNo) {
		Map<String, Map<String, Map<String, String>>> currentOrderStatus = getCustomerReturnOrderContent(returnOrderNo);
		Map<String, Map<String, Map<String, String>>> prevOrderStatus = getOrderRecord(InStockType_CustomerReturn,
				returnOrderNo);
		Map<String, Map<String, Map<String, String>>> waitHandleStatus = deriveWaitHandleStatus(currentOrderStatus,
				prevOrderStatus);
		return new QueryOrderResponse(currentOrderStatus, waitHandleStatus);
	}

	/**
	 * Return a response containing current 'store return' order content fetching
	 * from second db and previous process records fetching from first db
	 */
	public QueryOrderResponse queryStoreReturnOrder(String returnOrderNo) {
		// TODO: modify to getStoreReturnOrderContent
		Map<String, Map<String, Map<String, String>>> currentOrderStatus = getStoreReturnOrderContent(returnOrderNo);
		Map<String, Map<String, Map<String, String>>> prevOrderStatus = getOrderRecord(InStockType_StoreReturn,
				returnOrderNo);
		Map<String, Map<String, Map<String, String>>> waitHandleStatus = deriveWaitHandleStatus(currentOrderStatus,
				prevOrderStatus);
		return new QueryOrderResponse(currentOrderStatus, waitHandleStatus);
	}

	/**
	 * Return a response of 'OutStockToStore' order content fetching from second db
	 */
	public List<ProductInformation> queryOutStockToStoreOrder(String outStockToStoreOrderNo) {
		List<ProductInformation> ret = new ArrayList<>();
		EntityManager em = emf.createEntityManager();

		Query q = em.createNativeQuery(outStockToStoreOrderSQLStatement);
		q.setParameter(1, outStockToStoreOrderNo);
		List<?> resultList = q.getResultList();

		if (!resultList.isEmpty()) {
			resultList.forEach(row -> {
				Object[] cells = (Object[]) row;
				ProductInformation productInformation = new ProductInformation();

				productInformation.setProductNo(QueryStockFunction.nullValueHelper(cells[0].toString()));
				productInformation.setcName(QueryStockFunction.nullValueHelper(cells[1].toString()));
				productInformation.setcCCCODE(QueryStockFunction.nullValueHelper(cells[2].toString()));
				productInformation.setSpec(QueryStockFunction.nullValueHelper(cells[3].toString()));
				productInformation.setPackDesc(QueryStockFunction.nullValueHelper(cells[4].toString()));

				ret.add(productInformation);
			});
		}

		return ret;
	}

	/**
	 * Fetch necessary 'in-stock' order content from second db, and accumulate the
	 * amount of same type based on productNo
	 */
	private Map<String, Map<String, Map<String, String>>> getInStockOrderContent(String orderNo) {
		List<InStockOrderRecord> orderRecordList = new ArrayList<>();

		EntityManager em = emf.createEntityManager();
		Query q = em.createNativeQuery(inStockOrderSQLStatement);
		q.setParameter(1, orderNo);

		// The format of q.getResultList() is as below:
		// Row n : [PROD, QTY, UNIT, GWN, BANQTY]
		for (Object row : q.getResultList()) {
			Object[] cell = (Object[]) row;
			InStockOrderRecord orderRecord = new InStockOrderRecord();

			orderRecord.setProductNo(cell[0].toString());
			orderRecord.setQuantity(String.format("%.2f",
					Double.parseDouble(cell[1].toString()) + Double.parseDouble(cell[4].toString())));
			orderRecord.setUnit(stockServiceUtilities.unitMappingHelper(cell[2].toString()));
			orderRecord.setType(stockServiceUtilities.typeMappingHelper(cell[3].toString()));

			orderRecordList.add(orderRecord);
		}

		return orderContentCollector(orderRecordList);
	}

	/**
	 * Fetch necessary 'assemble' order content from second db, and accumulate the
	 * amount of same type based on productNo
	 */
	private Map<String, Map<String, Map<String, String>>> getAssembleOrderContent(String orderNo) {
		List<InStockOrderRecord> orderRecordList = new ArrayList<>();

		EntityManager em = emf.createEntityManager();
		Query q = em.createNativeQuery(assembleOrderAndProductUnitSQLStatement);
		q.setParameter(1, orderNo);

		// The format of q.getResultList() is as below:
		// Row n : [MPROD, GWN, MQTY, UNIT]
		for (Object row : q.getResultList()) {
			Object[] cell = (Object[]) row;
			InStockOrderRecord orderRecord = new InStockOrderRecord();

			orderRecord.setProductNo(cell[0].toString());
			orderRecord.setType(stockServiceUtilities.typeMappingHelper(cell[1].toString()));
			orderRecord.setQuantity(String.format("%.2f", Double.parseDouble(cell[2].toString())));
			orderRecord.setUnit(stockServiceUtilities.unitMappingHelper(cell[3].toString()));

			orderRecordList.add(orderRecord);
		}

		return orderContentCollector(orderRecordList);
	}

	/**
	 * Fetch necessary 'customerReturn' order content from second db, and accumulate
	 * the amount of same type based on productNo
	 */
	private Map<String, Map<String, Map<String, String>>> getCustomerReturnOrderContent(String orderNo) {
		List<InStockOrderRecord> orderRecordList = new ArrayList<>();

		EntityManager em = emf.createEntityManager();
		Query q = em.createNativeQuery(customerReturnOrderSQLStatement);
		q.setParameter(1, orderNo);

		// The format of q.getResultList() is as below:
		// Row n : [PROD, QTY, UNIT, GWN]
		for (Object row : q.getResultList()) {
			Object[] cell = (Object[]) row;
			InStockOrderRecord orderRecord = new InStockOrderRecord();

			orderRecord.setProductNo(cell[0].toString());
			orderRecord.setQuantity(String.format("%.2f", Double.parseDouble(cell[1].toString())));
			orderRecord.setUnit(stockServiceUtilities.unitMappingHelper(cell[2].toString()));
			orderRecord.setType(stockServiceUtilities.typeMappingHelper(cell[3].toString()));

			orderRecordList.add(orderRecord);
		}

		return orderContentCollector(orderRecordList);
	}

	/**
	 * Fetch necessary 'storeReturn' order content from second db, and accumulate
	 * the amount of same type based on productNo
	 */
	private Map<String, Map<String, Map<String, String>>> getStoreReturnOrderContent(String orderNo) {
		List<InStockOrderRecord> orderRecordList = new ArrayList<>();

		EntityManager em = emf.createEntityManager();
		Query q = em.createNativeQuery(storeReturnOrderSQLStatement);
		q.setParameter(1, orderNo);

		// The format of q.getResultList() is as below:
		// Row n : [PROD, QTY, UNIT, INGWN]
		for (Object row : q.getResultList()) {
			Object[] cell = (Object[]) row;
			InStockOrderRecord orderRecord = new InStockOrderRecord();

			orderRecord.setProductNo(cell[0].toString());
			orderRecord.setQuantity(String.format("%.2f", Double.parseDouble(cell[1].toString())));
			orderRecord.setUnit(stockServiceUtilities.unitMappingHelper(cell[2].toString()));
			orderRecord.setType(stockServiceUtilities.typeMappingHelper(cell[3].toString()));

			orderRecordList.add(orderRecord);
		}

		return orderContentCollector(orderRecordList);
	}

	/**
	 * Fetch previous process records of certain orderNo from first db
	 */
	private Map<String, Map<String, Map<String, String>>> getOrderRecord(String orderType, String inStockOrderNo) {
		return orderContentCollector(inStockOrderRepo.findByInStockTypeAndInStockOrderNo(orderType, inStockOrderNo));
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

					quantityConvertor(content);

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

						quantityConvertor(content);

						properties.put("quantity", content.getQuantity());
						properties.put("unit", content.getUnit());

						temp_type_properties.put(content.getType(), properties);
					} else {
						// if productNo exist and type exist, sum
						Map<String, String> tempProperties = productNo_type_properties.get(content.getProductNo())
								.get(content.getType());

						quantityConvertor(content);

						tempProperties.put("quantity",
								String.format("%.2f", Double.parseDouble(tempProperties.get("quantity"))
										+ Double.parseDouble(content.getQuantity())));
					}
				}
			}
		}

		return productNo_type_properties;
	}

	/**
	 * Unit conversion for InStockOrderRecord (There are some unit having the
	 * conversion)
	 */
	private InStockOrderRecord quantityConvertor(InStockOrderRecord inStockOrderRecord) {
		String quantity = inStockOrderRecord.getQuantity();
		String unit = inStockOrderRecord.getUnit();

		switch (unit) {
		case "尺":
			quantity = String.format("%.2f", Double.parseDouble(quantity) / 3.0);
			unit = "碼";
			inStockOrderRecord.setQuantity(quantity);
			inStockOrderRecord.setUnit(unit);

			return inStockOrderRecord;
		case "打":
			quantity = String.format("%d", Integer.parseInt(quantity) * 12);
			unit = "個";
			inStockOrderRecord.setQuantity(quantity);
			inStockOrderRecord.setUnit(unit);

			return inStockOrderRecord;
		default:
			return inStockOrderRecord;
		}
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
						String.format("%.2f",
								Double.parseDouble(waitHandleStatus.get(productNo).get(type).get("quantity"))
										- Double.parseDouble(prevStatus.get(productNo).get(type).get("quantity"))));
			}
		}));

		return waitHandleStatus;
	}
}
