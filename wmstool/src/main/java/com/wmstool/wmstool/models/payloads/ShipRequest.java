package com.wmstool.wmstool.models.payloads;

import javax.validation.constraints.NotBlank;

public class ShipRequest {

	private long clothIdentifierId;

	@NotBlank(message = "原因不可空白")
	private String reason;

	public long getClothIdentifierId() {
		return clothIdentifierId;
	}

	public void setClothIdentifierId(long clothIdentifierId) {
		this.clothIdentifierId = clothIdentifierId;
	}

	public String getReason() {
		return reason;
	}

	public void setReason(String reason) {
		this.reason = reason;
	}

}
