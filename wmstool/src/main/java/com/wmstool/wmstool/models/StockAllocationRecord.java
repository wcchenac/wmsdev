package com.wmstool.wmstool.models;

import java.time.LocalDateTime;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;

@Entity
public class StockAllocationRecord {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String productNo;

	private String quantity;

	private String unit;

	private String realQuantity;

	private String INGWN;

	private String OUTGWN;

	private Long issuedByStockIdentifier;

	private Long issuedByTransactionRecord;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	public StockAllocationRecord() {
	}

	public StockAllocationRecord(String productNo, String unit) {
		this.productNo = productNo;
		this.unit = unit;
		this.INGWN = "AB";
		this.OUTGWN = "AD";
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

	public String getINGWN() {
		return INGWN;
	}

	public void setINGWN(String INGWN) {
		this.INGWN = INGWN;
	}

	public String getOUTGWN() {
		return OUTGWN;
	}

	public void setOUTGWN(String OUTGWN) {
		this.OUTGWN = OUTGWN;
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
