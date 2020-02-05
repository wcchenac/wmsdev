package com.wmstool.wmstool.models.payloads;

import java.util.List;

import com.wmstool.wmstool.models.Product;
import com.wmstool.wmstool.models.StockInfo;

public class QueryProductNoResponse {

	private List<StockInfo> result;

	private ProductInformation information;

	private List<Product> productList;

	public QueryProductNoResponse() {
	}

	public QueryProductNoResponse(List<StockInfo> result, ProductInformation information) {
		this.result = result;
		this.information = information;
	}

	public QueryProductNoResponse(List<StockInfo> result, ProductInformation information, List<Product> productList) {
		this.result = result;
		this.information = information;
		this.productList = productList;
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
