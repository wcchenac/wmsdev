package com.wmstool.wmstool.models.payloads;

import java.util.List;

import com.wmstool.wmstool.models.StockInfo;

public class QueryProductNoResponse {

	private List<StockInfo> result;

	private ProductInformation information;

	public QueryProductNoResponse() {
	}

	public QueryProductNoResponse(List<StockInfo> result, ProductInformation information) {
		this.result = result;
		this.information = information;
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

}
