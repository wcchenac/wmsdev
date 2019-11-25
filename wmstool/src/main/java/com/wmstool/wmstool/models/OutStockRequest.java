package com.wmstool.wmstool.models;

import java.time.LocalDateTime;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;

@Entity
public class OutStockRequest {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String productNo;

	private String lotNo;

	private String type;

	private String length;

	private String unit;

	private int color;

	private String defect;

	private String reason;

	private int outStockType; // 0: 出貨, 1: 減肥, 2: 概略拉貨

	private long clothIdentifierId;

	private String fileName;

	private boolean isHandled = false;

	private boolean isDeleted = false;

	private String requestFrom;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	private String createdBy;

	private String updatedBy;

	public OutStockRequest() {
	}

	public OutStockRequest(String productNo, String lotNo, String type, String length, String unit, String reason) {
		this.productNo = productNo;
		this.lotNo = lotNo;
		this.type = type;
		this.length = length;
		this.unit = unit;
		this.reason = reason;
	}

	public OutStockRequest(String productNo, String lotNo, String type, String length, String unit, String reason,
			long clothIdentifierId) {
		this.productNo = productNo;
		this.lotNo = lotNo;
		this.type = type;
		this.length = length;
		this.unit = unit;
		this.reason = reason;
		this.clothIdentifierId = clothIdentifierId;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getProductNo() {
		return productNo;
	}

	public void setProductNo(String productNo) {
		this.productNo = productNo;
	}

	public String getLotNo() {
		return lotNo;
	}

	public void setLotNo(String lotNo) {
		this.lotNo = lotNo;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getLength() {
		return length;
	}

	public void setLength(String length) {
		this.length = length;
	}

	public String getUnit() {
		return unit;
	}

	public void setUnit(String unit) {
		this.unit = unit;
	}

	public int getColor() {
		return color;
	}

	public void setColor(int color) {
		this.color = color;
	}

	public String getDefect() {
		return defect;
	}

	public void setDefect(String defect) {
		this.defect = defect;
	}

	public String getReason() {
		return reason;
	}

	public void setReason(String reason) {
		this.reason = reason;
	}

	public int getOutStockType() {
		return outStockType;
	}

	public void setOutStockType(int outStockType) {
		this.outStockType = outStockType;
	}

	public long getClothIdentifierId() {
		return clothIdentifierId;
	}

	public void setClothIdentifierId(long clothIdentifierId) {
		this.clothIdentifierId = clothIdentifierId;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public boolean isHandled() {
		return isHandled;
	}

	public void setHandled(boolean isHandled) {
		this.isHandled = isHandled;
	}

	public boolean isDeleted() {
		return isDeleted;
	}

	public void setDeleted(boolean isDeleted) {
		this.isDeleted = isDeleted;
	}

	public String getRequestFrom() {
		return requestFrom;
	}

	public void setRequestFrom(String requestFrom) {
		this.requestFrom = requestFrom;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public String getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}

	public String getUpdatedBy() {
		return updatedBy;
	}

	public void setUpdatedBy(String updatedBy) {
		this.updatedBy = updatedBy;
	}

	@PrePersist
	protected void onCreated() {
		this.createdAt = LocalDateTime.now();
	}

	@PreUpdate
	protected void onUpdate() {
		this.updatedAt = LocalDateTime.now();
	}

}
