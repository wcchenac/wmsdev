package com.wmstool.wmstool.models.payloads;

public class CreateFileRequest {

	private String productNo;

	private float decrement;

	public CreateFileRequest() {
	}

	public String getProductNo() {
		return productNo;
	}

	public void setProductNo(String productNo) {
		this.productNo = productNo;
	}

	public float getDecrement() {
		return decrement;
	}

	public void setDecrement(float decrement) {
		this.decrement = decrement;
	}

}
