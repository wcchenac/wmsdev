package com.wmstool.wmstool.models.payloads;

import java.util.List;

import javax.validation.constraints.NotEmpty;

public class ShrinkStockRequest {

	private long oldClothIdentifierId;

	@NotEmpty
	private List<InStockRequest> inStockRequests;

	public long getOldClothIdentifierId() {
		return oldClothIdentifierId;
	}

	public void setOldClothIdentifierId(long oldClothIdentifierId) {
		this.oldClothIdentifierId = oldClothIdentifierId;
	}

	public List<InStockRequest> getInStockRequests() {
		return inStockRequests;
	}

	public void setInStockRequests(List<InStockRequest> inStockRequests) {
		this.inStockRequests = inStockRequests;
	}

}
