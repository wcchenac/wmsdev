package com.wmstool.wmstool.models;

import java.time.LocalDateTime;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;

@Entity
public class TransactionRecord {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String productNo;

	private String lotNo;

	private String type;

	private String quantity;

	private String unit;

	private String operator; // 1 for positive, -1 for negative

	private Long stockIdentifierId;

	private String transactionType; // NI: normal, AI: assemble, SKI/SKO: shrink, SPO: ship, FI: file import

	private LocalDateTime createdAt;

	private String createdBy;

	public TransactionRecord() {
	}

	public TransactionRecord(StockIdentifier stockIdentifier, String editor) {
		this.productNo = stockIdentifier.getProductNo();
		this.lotNo = stockIdentifier.getLotNo();
		this.type = stockIdentifier.getType();
		this.quantity = stockIdentifier.getQuantity();
		this.unit = stockIdentifier.getUnit();
		this.stockIdentifierId = stockIdentifier.getId();
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

	public String getOperator() {
		return operator;
	}

	public void setOperator(String operator) {
		this.operator = operator;
	}

	public Long getStockIdentifierId() {
		return stockIdentifierId;
	}

	public void setStockIdentifierId(Long stockIdentifierId) {
		this.stockIdentifierId = stockIdentifierId;
	}

	public String getTransactionType() {
		return transactionType;
	}

	public void setTransactionType(String transactionType) {
		this.transactionType = transactionType;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public String getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}

	@PrePersist
	protected void onCreated() {
		this.createdAt = LocalDateTime.now();
	}

}
