package com.wmstool.wmstool.services.stockService.subFunctions;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.wmstool.wmstool.models.InStockOrderRecord;
import com.wmstool.wmstool.models.Product;
import com.wmstool.wmstool.repositories.ProductRepository;

@Component
public class StockServiceUtilities {

	@Autowired
	private ProductRepository productRepository;

	private final String[] unitList = { "台", "支", "碼", "尺", "公斤", "公尺", "個", "打", "包", "箱", "件", "對", "本", "張", "才",
			"幅", "盒", "瓶", "磅", "批", "條", "筆", "雙", "公克", "次", "疊", "組" };

	/**
	 * Helper method for translate UNIT to literal value
	 */
	public String unitMappingHelper(String unitCode) {
		return unitList[Integer.parseInt(unitCode)];
	}

	/**
	 * Helper method for translate GWN to literal value
	 */
	public String typeMappingHelper(String whName) {
		String type = "";

		switch (whName) {
		case "AB":
			return type = "板卷";
		case "AC":
		case "AD":
		case "AE":
			return type = "整支";
		case "AP":
			return type = "雜項";
		default:
			return type;
		}
	}

	/**
	 * Sum the quantity in Product with the original quantity in db, and update
	 */
	public void updateProductQuantity(String productNo, Product product) {
		String type = product.getType();

		// TODO: data not found exception
		Product res = productRepository.findByProductNoAndType(productNo, type).get();

		res.setQuantity(String.format("%.1f",
				Double.parseDouble(product.getQuantity()) + Double.parseDouble(res.getQuantity())));
	}

	/**
	 * Update or create Product quantity to db by a given Product collection
	 */
	public void updateProductQuantityWithList(Map<String, Map<String, Map<String, String>>> productResult) {
		List<Product> productList = new ArrayList<>();

		productResult.keySet().forEach(productNo -> {
			productResult.get(productNo).keySet().forEach(type -> {
				Product p = new Product();
				Map<String, String> property = productResult.get(productNo).get(type);

				p.setProductNo(productNo);
				p.setType(type);
				p.setQuantity(property.get("quantity"));
				p.setUnit(property.get("unit"));

				productList.add(p);
			});
		});

		productRepository.saveAll(productList);
	}

//	public void updateProductQuantityWithList(List<Product> productList) {
//		Map<String, String> typeQuantity = accumulateQuantityByTypeForSameProduct(productList);
//		List<Product> result = new ArrayList<>();
//		String unit = productList.get(0).getUnit();
//
//		typeQuantity.keySet().forEach(type -> {
//			Product p = productRepository.findByProductNoAndType(productNo, type).orElseGet(() -> {
//				Product x = new Product();
//				x.setProductNo(productNo);
//				x.setType(type);
//				x.setQuantity("0");
//				x.setUnit(unit);
//
//				return x;
//			});
//
//			p.setQuantity(String.format("%.1f",
//					Double.parseDouble(typeQuantity.get(type)) + Double.parseDouble(p.getQuantity())));
//
//			result.add(p);
//		});
//
//		productRepository.saveAll(result);
//	}
//
	/**
	 * Helper method for accumulate "same" Product quantity by type
	 */
	public Map<String, String> accumulateQuantityByTypeForSameProduct(List<Product> productList) {
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
	 * Helper method to create nested structure : { productNo : { type : { quantity:
	 * quantity_value, unit: unit_value}}}
	 */
	public void contentCollector(Product p, Map<String, Map<String, Map<String, String>>> productResult) {
		if (p == null) {
			return;
		}

		// filter type = "" which is not necessary
		if (!p.getType().equals("")) {
			// if product is not exist, create sub Map Objects
			if (!productResult.containsKey(p.getProductNo())) {
				Map<String, Map<String, String>> type_properties = new HashMap<>();
				Map<String, String> properties = new HashMap<>();

				properties.put("quantity", p.getQuantity());
				properties.put("unit", p.getUnit());
				type_properties.put(p.getType(), properties);
				productResult.put(p.getProductNo(), type_properties);
			} else {
				Map<String, Map<String, String>> temp_type_properties = productResult.get(p.getProductNo());
				// if productNo exist but type no exist, create sub Map object
				if (!temp_type_properties.containsKey(p.getType())) {
					Map<String, String> properties = new HashMap<>();

					properties.put("quantity", p.getQuantity());
					properties.put("unit", p.getUnit());

					temp_type_properties.put(p.getType(), properties);
				} else {
					// if productNo exist and type exist, sum
					Map<String, String> tempProperties = productResult.get(p.getProductNo()).get(p.getType());
					tempProperties.put("quantity", String.format("%.1f",
							Double.parseDouble(tempProperties.get("quantity")) + Double.parseDouble(p.getQuantity())));
				}
			}
		}
	}

}
