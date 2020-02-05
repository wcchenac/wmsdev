package com.wmstool.wmstool.models.payloads;

import java.util.Map;

public class OutStockUpdateRequest {

	private Map<Long, String> outStockUpdate;

	public Map<Long, String> getOutStockUpdate() {
		return outStockUpdate;
	}

	public void setOutStockUpdate(Map<Long, String> outStockUpdate) {
		this.outStockUpdate = outStockUpdate;
	}

}
