package com.wmstool.wmstool.models.payloads;

import java.util.List;

import javax.validation.constraints.NotEmpty;

public class ShrinkStockRequest {

	private long oldStockIdentifierId;

	@NotEmpty
	private List<InStockRequest> inStockRequests;

	private Float allocation;

	private Float adjustment;

	public long getOldStockIdentifierId() {
		return oldStockIdentifierId;
	}

	public void setOldStockIdentifierId(long oldStockIdentifierId) {
		this.oldStockIdentifierId = oldStockIdentifierId;
	}

	public List<InStockRequest> getInStockRequests() {
		return inStockRequests;
	}

	public void setInStockRequests(List<InStockRequest> inStockRequests) {
		this.inStockRequests = inStockRequests;
	}

	public Float getAllocation() {
		return allocation;
	}

	public void setAllocation(Float allocation) {
		this.allocation = allocation;
	}

	public Float getAdjustment() {
		return adjustment;
	}

	public void setAdjustment(Float adjustment) {
		this.adjustment = adjustment;
	}

}
