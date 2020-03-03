package com.wmstool.wmstool.models;

import java.time.LocalDateTime;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;

@Entity
public class StockAdjustmentRecord {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String productNo;

	private String quantity;

	private String unit;

	private String realQuantity;

	private String GWN;

	private Long issuedByStockIdentifier;

	private Long issuedByTransactionRecord;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	public StockAdjustmentRecord() {
	}

	public StockAdjustmentRecord(String productNo, String unit, String shrinkType) {
		this.productNo = productNo;
		this.unit = unit;

		switch (shrinkType) {
		case "RR":
		case "BR":
			this.GWN = "AD";
			break;
		case "BB":
		case "RB":
			this.GWN = "AB";
			break;
		case "HH":
			this.GWN = "AP";
		default:
			break;
		}

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

	public String getRealQuantity() {
		return realQuantity;
	}

	public void setRealQuantity(String realQuantity) {
		this.realQuantity = realQuantity;
	}

	public String getGWN() {
		return GWN;
	}

	public void setGWN(String GWN) {
		this.GWN = GWN;
	}

	public Long getIssuedByStockIdentifier() {
		return issuedByStockIdentifier;
	}

	public void setIssuedByStockIdentifier(Long issuedByStockIdentifier) {
		this.issuedByStockIdentifier = issuedByStockIdentifier;
	}

	public Long getIssuedByTransactionRecord() {
		return issuedByTransactionRecord;
	}

	public void setIssuedByTransactionRecord(Long issuedByTransactionRecord) {
		this.issuedByTransactionRecord = issuedByTransactionRecord;
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

	@PrePersist
	protected void onCreated() {
		this.createdAt = LocalDateTime.now();
	}

	@PreUpdate
	protected void onUpdate() {
		this.updatedAt = LocalDateTime.now();
	}

}
