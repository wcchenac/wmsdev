package com.wmstool.wmstool.models.payloads;

import javax.validation.constraints.NotBlank;

public class ShipRequest {

	private long stockIdentifierId;

	@NotBlank(message = "原因不可空白")
	private String reason;

	public ShipRequest() {
	}

	public ShipRequest(long stockIdentifierId, String reason) {
		this.stockIdentifierId = stockIdentifierId;
		this.reason = reason;
	}

	public long getStockIdentifierId() {
		return stockIdentifierId;
	}

	public void setStockIdentifierId(long stockIdentifierId) {
		this.stockIdentifierId = stockIdentifierId;
	}

	public String getReason() {
		return reason;
	}

	public void setReason(String reason) {
		this.reason = reason;
	}

}
