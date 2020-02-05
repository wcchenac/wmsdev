package com.wmstool.wmstool.services.stockService.subFunctions;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

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
	 * Update or create Product quantity to db by a given Product list
	 */
	public void updateProductQuantityWithList(String productNo, List<Product> productList) {
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

}
