package com.wmstool.models.payloads;

import com.wmstool.models.ClothIdentifierBacklog;
import com.wmstool.models.ClothInfo;
import com.wmstool.models.ClothRecord;

public class InStockRequest {

	private ClothIdentifierBacklog clothIdentifierBacklog;

	private ClothInfo clothInfo;

	private ClothRecord records;

	public ClothIdentifierBacklog getClothIdentifierBacklog() {
		return clothIdentifierBacklog;
	}

	public void setClothIdentifierBacklog(ClothIdentifierBacklog clothIdentifierBacklog) {
		this.clothIdentifierBacklog = clothIdentifierBacklog;
	}

	public ClothInfo getClothInfo() {
		return clothInfo;
	}

	public void setClothInfo(ClothInfo clothInfo) {
		this.clothInfo = clothInfo;
	}

	public ClothRecord getRecords() {
		return records;
	}

	public void setRecords(ClothRecord records) {
		this.records = records;
	}

}
