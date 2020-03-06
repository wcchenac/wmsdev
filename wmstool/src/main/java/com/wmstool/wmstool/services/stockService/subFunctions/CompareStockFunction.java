package com.wmstool.wmstool.services.stockService.subFunctions;

import java.io.IOException;
import java.time.LocalDate;
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

import com.wmstool.wmstool.models.Product;
import com.wmstool.wmstool.repositories.ProductRepository;
import com.wmstool.wmstool.utilities.FullStockComparisonExcelHelper;

@Component
public class CompareStockFunction {

	@Autowired
	@Qualifier("dataDbEntityManagerFactory")
	private EntityManagerFactory emf;

	@Autowired
	private ProductRepository productRepository;

	@Autowired
	private StockServiceUtilities stockServiceUtilities;

	@Autowired
	private FullStockComparisonExcelHelper fullStockComparisonExcelHelper;

	private final String queryProductCQTYAndUnitSQLStatement = "SELECT * FROM dbo.ProductCQTYUNIT";
	private final String queryProductCategoryStatement = "SELECT CODE, CLAS FROM dbo.PRODUCT";

	/**
	 * Fully stock quantity comparison between 2 databases
	 */
	public void stockFullyComparison() throws IOException {
		LocalDate now = LocalDate.now();
		String fileName = fullStockComparisonExcelHelper.createNewFile(now);

		// Get all product quantity from 1st db
		List<Product> firstDBResList = productRepository.findAll();

		// Get all product quantity from 2nd db
		Map<String, Map<String, Product>> secondDBRes = new HashMap<>();
		EntityManager em = emf.createEntityManager();
		Query q = em.createNativeQuery(queryProductCQTYAndUnitSQLStatement);

		// The format of q.getResultList() is as below:
		// Row n : [PROD, GWN , CQTY, UNIT]
		// Create Product object based on query result, then put it into a map with
		// structure like { productNo : {type : Product object} }
		for (Object row : q.getResultList()) {
			Object[] cell = (Object[]) row;
			String type = stockServiceUtilities.typeMappingHelper(cell[1].toString());

			if (!type.equals("")) {
				Product p = new Product();

				String productNo = cell[0].toString();
				String quantity = cell[2].toString();
				Integer unit = Integer.parseInt(cell[3].toString());

				switch (unit) {
				case 3: // 尺
					quantity = String.format("%.2f", Double.parseDouble(quantity) / 3.0);
					unit = 2;
					break;
				case 7: // 打
					quantity = String.format("%.2f", Double.parseDouble(quantity) * 12.0);
					unit = 6;
					break;
				default:
					break;
				}

				p.setProductNo(productNo);
				p.setType(type);
				p.setQuantity(quantity);
				p.setUnit(stockServiceUtilities.unitMappingHelper(unit.toString()));

				boolean checkProductExist = secondDBRes.containsKey(productNo);

				if (!checkProductExist) {
					Map<String, Product> typeProduct = new HashMap<>();
					typeProduct.put(type, p);
					secondDBRes.put(productNo, typeProduct);
				} else if (!secondDBRes.get(productNo).containsKey(type)) {
					secondDBRes.get(productNo).put(type, p);
				} else {
					Product temp = secondDBRes.get(productNo).get(type);
					temp.setQuantity(String.format("%.2f",
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

				if (String.format("%.2f", Math.abs(Double.parseDouble(firstDBQTY) - Double.parseDouble(secondDBQTY)))
						.equals("0.00")) {
					tempResultList.add("Pass");
				} else {
					tempResultList.add("Fail");
					tempResultList.add(
							String.format("%.2f", Double.parseDouble(firstDBQTY) - Double.parseDouble(secondDBQTY)));
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
						rest.add(String.format("%.2f", Double.parseDouble(quantity) * -1));

						compareResult.add(rest);
					}
				}
			}));
		}

		try {
			fullStockComparisonExcelHelper.outputComparisonResult(compareResult, now, fileName);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * Sync Product category information from 2nd to 1st
	 */
	public void syncProductCategory() {
		EntityManager em = emf.createEntityManager();
		Query q = em.createNativeQuery(queryProductCategoryStatement);
		Map<String, String> product_class = new HashMap<>();

		// The format of q.getResultList() is as below:
		// Row n : [CODE, CLAS]
		for (Object row : q.getResultList()) {
			Object[] cell = (Object[]) row;

			product_class.put(cell[0].toString(), cell[1].toString());
		}

		// Get product list from 1st db
		productRepository.findAll().forEach(productType -> {
			String productNo = productType.getProductNo();
			String targetCategory = product_class.containsKey(productNo) ? product_class.get(productNo) : "未分類";

			if (productType.getCategory() == null || !productType.getCategory().equals(targetCategory))
				productType.setCategory(targetCategory);
		});
	}
}
