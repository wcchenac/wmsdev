package com.wmstool.wmstool.exceptions;

public class InStockRequestExceptionResponse {

	private String inStockRequest;

	public InStockRequestExceptionResponse(String inStockRequest) {
		this.inStockRequest = inStockRequest;
	}

	public String getInStockRequest() {
		return inStockRequest;
	}

	public void setInStockRequest(String inStockRequest) {
		this.inStockRequest = inStockRequest;
	}

}
