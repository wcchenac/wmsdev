package com.wmstool.wmstool.models.payloads;

import java.util.List;

import com.wmstool.wmstool.models.ClothInfo;

public class QueryProductNoResponse {

	private List<ClothInfo> result;

	private ProductInformation information;

	public QueryProductNoResponse() {
	}

	public QueryProductNoResponse(List<ClothInfo> result, ProductInformation information) {
		this.result = result;
		this.information = information;
	}

	public List<ClothInfo> getResult() {
		return result;
	}

	public void setResult(List<ClothInfo> result) {
		this.result = result;
	}

	public ProductInformation getInformation() {
		return information;
	}

	public void setInformation(ProductInformation information) {
		this.information = information;
	}

}
