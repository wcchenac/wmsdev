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

	private String quantity;

	private String unit;

	private int color;

	private String defect;

	private String reason;

	private int outStockType; // 0: 出貨, 1: 減肥, 2: 無指定拉貨

	private long stockIdentifierId;

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

	public OutStockRequest(String productNo, String lotNo, String type, String quantity, String unit, String reason,
			String editor) {
		this.productNo = productNo;
		this.lotNo = lotNo;
		this.type = type;
		this.quantity = quantity;
		this.unit = unit;
		this.reason = reason;
		this.createdBy = editor;
	}

	public OutStockRequest(StockIdentifier stockIdentifier, StockInfo stockInfo, String reason, String editor) {
		this.productNo = stockIdentifier.getProductNo();
		this.lotNo = stockIdentifier.getLotNo();
		this.type = stockIdentifier.getType();
		this.quantity = stockIdentifier.getQuantity();
		this.unit = stockIdentifier.getUnit();
		this.stockIdentifierId = stockIdentifier.getId();
		this.color = stockInfo.getColor();
		this.defect = stockInfo.getDefect();
		this.reason = reason;
		this.createdBy = editor;
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

	public String getQuantity() {
		return quantity;
	}

	public void setQuantity(String quantity) {
		this.quantity = quantity;
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

	public long getStockIdentifierId() {
		return stockIdentifierId;
	}

	public void setStockIdentifierId(long stockIdentifierId) {
		this.stockIdentifierId = stockIdentifierId;
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
