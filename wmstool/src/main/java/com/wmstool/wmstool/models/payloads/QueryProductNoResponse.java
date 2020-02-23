package com.wmstool.wmstool.models.payloads;

import java.util.List;
import java.util.Map;

import com.wmstool.wmstool.models.Product;
import com.wmstool.wmstool.models.StockInfo;

public class QueryProductNoResponse {

	private String nextProduct;

	private String prevProduct;

	private List<StockInfo> result;

	private ProductInformation information;

	private List<Product> productList;

	public QueryProductNoResponse() {
	}

	public QueryProductNoResponse(List<StockInfo> result, ProductInformation information, List<Product> productList,
			Map<String, String> productMap) {
		this.result = result;
		this.information = information;
		this.productList = productList;
		this.nextProduct = productMap.get("next");
		this.prevProduct = productMap.get("prev");
	}

	public String getNextProduct() {
		return nextProduct;
	}

	public void setNextProduct(String nextProduct) {
		this.nextProduct = nextProduct;
	}

	public String getPrevProduct() {
		return prevProduct;
	}

	public void setPrevProduct(String prevProduct) {
		this.prevProduct = prevProduct;
	}

	public List<StockInfo> getResult() {
		return result;
	}

	public void setResult(List<StockInfo> result) {
		this.result = result;
	}

	public ProductInformation getInformation() {
		return information;
	}

	public void setInformation(ProductInformation information) {
		this.information = information;
	}

	public List<Product> getProductList() {
		return productList;
	}

	public void setProductList(List<Product> productList) {
		this.productList = productList;
	}

}
